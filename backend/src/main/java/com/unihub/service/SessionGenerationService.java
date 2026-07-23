package com.unihub.service;

import com.unihub.exception.BadRequestException;
import com.unihub.exception.ConflictException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.model.ScheduleTemplate;
import com.unihub.model.Session;
import com.unihub.model.SessionStatus;
import com.unihub.repository.SessionRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Expands weekly {@link ScheduleTemplate}s into concrete {@link Session}s and applies the
 * three per-occurrence exceptions (cancel, reschedule) without disturbing the rest of a
 * series. This is the engine only; the REST surface that drives it is UNIH-30.
 *
 * <h2>How a template's expected dates map to existing rows</h2>
 * A template's <em>expected dates</em> are every date in {@code [startDate, endDate]} whose
 * weekday equals {@code dayOfWeek}. Each expected date is a <em>slot</em>. Every session
 * belonging to a template occupies exactly one slot, identified by its <strong>slot key</strong>:
 * <ul>
 *   <li>a normal (SCHEDULED) or CANCELLED occurrence keys on its own {@code sessionDate};</li>
 *   <li>a RESCHEDULED occurrence keys on its {@code originalDate} — the slot it moved away
 *       from — while its {@code sessionDate} points at the new (off-recurrence) date.</li>
 * </ul>
 * Regeneration reconciles the expected slots against existing rows using that slot key, so a
 * cancelled or moved occurrence is never recreated at its origin (the "reschedule hole"), and
 * running the engine twice is a no-op (idempotent).
 *
 * <h2>Why rescheduling can never collide with {@code UNIQUE(template_id, session_date)}</h2>
 * A rescheduled row keeps its {@code template_id} (so the engine still sees it and honours its
 * origin slot). To guarantee its new {@code sessionDate} can never clash with a generated slot,
 * {@link #rescheduleSession} refuses to move an occurrence onto a date the course normally meets
 * (same weekday inside the active window) or onto a date the template already occupies. You move
 * a class to an <em>off</em> date (a make-up day); to clear a normal day you cancel it. That
 * makes the unique constraint unreachable by construction rather than relying on catching a DB
 * error.
 *
 * <h2>Boundaries preserved on edit</h2>
 * Regeneration after a template edit never touches the past (dates before today) nor any
 * {@code manuallyModified} row (cancelled/rescheduled occurrences survive); it only reconciles
 * future, auto-generated rows.
 */
@Service
public class SessionGenerationService {

    private final SessionRepository sessionRepository;

    public SessionGenerationService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    /**
     * Initial expansion when a template is created: materialises a session for every expected
     * date across the whole active period. Idempotent — safe to call again (reconciles instead
     * of duplicating).
     */
    @Transactional
    public List<Session> generateSessions(ScheduleTemplate template) {
        return sync(template, template.getStartDate());
    }

    /**
     * Reconciles future sessions after a template edit: past occurrences and any manually
     * modified (cancelled/rescheduled) occurrences are left untouched; only future auto-generated
     * rows are added, retimed, or removed to match the current template.
     */
    @Transactional
    public List<Session> regenerateSessions(ScheduleTemplate template) {
        return sync(template, LocalDate.now());
    }

    /**
     * Core reconciliation. {@code protectBefore} is the first date the engine is allowed to
     * create/modify/delete auto rows on — anything strictly earlier is frozen. Initial generation
     * passes the template start date (nothing precedes it); regeneration passes today.
     */
    private List<Session> sync(ScheduleTemplate template, LocalDate protectBefore) {
        List<Session> existing = sessionRepository.findByTemplate_Id(template.getId());

        // Slots already spoken for by a preserved (hand-modified) occurrence — cancelled rows by
        // their own date, rescheduled rows by the date they moved away from. These are never
        // regenerated.
        Set<LocalDate> claimedSlots = new HashSet<>();
        // Future auto rows we're free to reuse/retime/delete, indexed by their date.
        Map<LocalDate, Session> reusableByDate = new HashMap<>();
        for (Session s : existing) {
            if (s.isManuallyModified()) {
                // Key on the origin slot whenever the row has one — a rescheduled occupant keeps
                // claiming the recurrence date it moved away from even after it is later cancelled
                // (its sessionDate points at the off-day it was moved to). A plain cancelled row
                // never moved, so it keys on its own date.
                LocalDate slot = s.getOriginalDate() != null ? s.getOriginalDate() : s.getSessionDate();
                claimedSlots.add(slot);
            } else if (!s.getSessionDate().isBefore(protectBefore)) {
                reusableByDate.put(s.getSessionDate(), s);
            }
            // else: a past auto row — frozen, ignored.
        }

        // Expected slots we actually need to materialise: on/after the protect boundary, on the
        // template weekday, not already represented by a preserved occurrence. An inactive
        // template expects nothing, so every future auto row falls away.
        List<LocalDate> neededDates = new ArrayList<>();
        if (template.isActive()) {
            LocalDate rangeStart = template.getStartDate().isBefore(protectBefore)
                    ? protectBefore
                    : template.getStartDate();
            for (LocalDate d = rangeStart; !d.isAfter(template.getEndDate()); d = d.plusDays(1)) {
                if (d.getDayOfWeek() == template.getDayOfWeek() && !claimedSlots.contains(d)) {
                    neededDates.add(d);
                }
            }
        }

        List<Session> result = new ArrayList<>();
        List<Session> toSave = new ArrayList<>();
        Set<LocalDate> neededSet = new HashSet<>(neededDates);

        for (LocalDate date : neededDates) {
            Session session = reusableByDate.remove(date);
            if (session == null) {
                session = new Session();
                session.setCourse(template.getCourse());
                session.setTemplate(template);
                session.setSessionDate(date);
                session.setStatus(SessionStatus.SCHEDULED);
                session.setManuallyModified(false);
                toSave.add(session);
            }
            // Retime/re-room to the current template (a no-op on an unchanged reused row, which
            // is what keeps repeat runs idempotent).
            session.setStartTime(template.getStartTime());
            session.setEndTime(template.getEndTime());
            session.setRoom(template.getRoom());
            result.add(session);
        }

        // Whatever future auto rows we didn't reuse are orphaned by the edit (weekday changed,
        // range shortened, template deactivated) — remove them. They're auto + future, never
        // hand-modified, so deleting them loses no manual work.
        List<Session> orphans = new ArrayList<>();
        for (Session leftover : reusableByDate.values()) {
            if (!neededSet.contains(leftover.getSessionDate())) {
                orphans.add(leftover);
            }
        }
        if (!orphans.isEmpty()) {
            sessionRepository.deleteAll(orphans);
        }
        if (!toSave.isEmpty()) {
            sessionRepository.saveAll(toSave);
        }
        return result;
    }

    /**
     * Cancels a single occurrence. The row stays in the table (cancelled sessions still appear in
     * the calendar, flagged) and is marked manually modified so regeneration never revives it.
     */
    @Transactional
    public Session cancelSession(Long sessionId, String note) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));
        session.setStatus(SessionStatus.CANCELLED);
        session.setChangeNote(note);
        session.setManuallyModified(true);
        return sessionRepository.save(session);
    }

    /**
     * Moves a single occurrence to a new date/time/room. Records the slot it came from in
     * {@code originalDate} (preserved across repeated reschedules) and marks the row manually
     * modified so the rest of the series is untouched.
     *
     * <p>Rejects a move onto a date the course normally meets or that the template already
     * occupies — see the class Javadoc for why this keeps {@code UNIQUE(template_id, session_date)}
     * unreachable.
     */
    @Transactional
    public Session rescheduleSession(Long sessionId, LocalDate newDate, LocalTime newStartTime,
                                     LocalTime newEndTime, String newRoom, String note) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        if (newDate == null || newStartTime == null || newEndTime == null) {
            throw new BadRequestException("Reschedule requires a new date, start time and end time.");
        }
        if (!newEndTime.isAfter(newStartTime)) {
            throw new BadRequestException("End time must be after start time.");
        }

        ScheduleTemplate template = session.getTemplate();
        if (template != null) {
            boolean onRecurrenceDay = newDate.getDayOfWeek() == template.getDayOfWeek()
                    && !newDate.isBefore(template.getStartDate())
                    && !newDate.isAfter(template.getEndDate());
            if (onRecurrenceDay) {
                throw new BadRequestException(
                        "Cannot reschedule onto a date the course already meets — cancel that "
                                + "occurrence instead, or pick an off day.");
            }
            boolean slotTaken = !newDate.equals(session.getSessionDate())
                    && sessionRepository.existsByTemplate_IdAndSessionDate(template.getId(), newDate);
            if (slotTaken) {
                throw new ConflictException("Another session of this course already occupies " + newDate + ".");
            }
        }

        // Preserve the true origin across repeated reschedules; only capture it the first time.
        if (session.getStatus() != SessionStatus.RESCHEDULED) {
            session.setOriginalDate(session.getSessionDate());
        }
        session.setSessionDate(newDate);
        session.setStartTime(newStartTime);
        session.setEndTime(newEndTime);
        session.setRoom(newRoom);
        session.setStatus(SessionStatus.RESCHEDULED);
        session.setChangeNote(note);
        session.setManuallyModified(true);
        return sessionRepository.save(session);
    }
}
