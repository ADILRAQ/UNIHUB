package com.unihub.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * One dated occurrence of a {@link Course}. Either generated from a
 * {@link ScheduleTemplate} ({@code template} set) or added by hand as a one-off
 * ({@code template} null).
 *
 * <p>Timing is naive ({@link LocalDate}/{@link LocalTime}). A per-session {@code meetLink}
 * overrides the course link when non-null. {@code originalDate} records the date this
 * occurrence moved from when {@code status} is {@code RESCHEDULED}.
 * {@code manuallyModified} lets the UNIH-29 regeneration engine preserve hand-edited
 * occurrences instead of overwriting them.
 */
@Entity
@Table(name = "sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /** Source template, or {@code null} for a manually added one-off session. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private ScheduleTemplate template;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(length = 255)
    private String room;

    /** Overrides {@link Course#getMeetLink()} for this occurrence when set. */
    @Column(name = "meet_link", length = 1024)
    private String meetLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessionStatus status = SessionStatus.SCHEDULED;

    /** The date this occurrence was moved from; set when {@code status} is RESCHEDULED. */
    @Column(name = "original_date")
    private LocalDate originalDate;

    @Column(name = "change_note", columnDefinition = "TEXT")
    private String changeNote;

    @Column(name = "manually_modified", nullable = false)
    private boolean manuallyModified = false;

    // -----------------------------------------------------------------------
    // Recap fields (UNIH-37) — all nullable; recap_updated_at is the
    // lightweight "has recap" indicator set on every teacher PUT.
    // -----------------------------------------------------------------------

    @Column(name = "recording_url", length = 1000)
    private String recordingUrl;

    @Column(name = "notes_html", columnDefinition = "TEXT")
    private String notesHtml;

    /** Set to NOW() on every recap PUT; stays null until the teacher first saves a recap. */
    @Column(name = "recap_updated_at")
    private Instant recapUpdatedAt;

    /** Existing course resources pinned to this session's recap. */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "session_recap_resources",
            joinColumns = @JoinColumn(name = "session_id"),
            inverseJoinColumns = @JoinColumn(name = "resource_id"))
    private List<Resource> recapResources = new ArrayList<>();

    /** Existing course assignments pinned to this session's recap. */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "session_recap_assignments",
            joinColumns = @JoinColumn(name = "session_id"),
            inverseJoinColumns = @JoinColumn(name = "assignment_id"))
    private List<Assignment> recapAssignments = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
