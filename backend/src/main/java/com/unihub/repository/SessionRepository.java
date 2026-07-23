package com.unihub.repository;

import com.unihub.model.Session;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findBySessionDateBetween(LocalDate start, LocalDate end);

    List<Session> findByCourse_IdAndSessionDateBetween(Long courseId, LocalDate start, LocalDate end);

    /** All sessions ever generated from a template — the reconciliation input for regeneration (UNIH-29). */
    List<Session> findByTemplate_Id(Long templateId);

    /** Idempotency check for template regeneration (UNIH-29); backed by uq_sessions_template_date. */
    boolean existsByTemplate_IdAndSessionDate(Long templateId, LocalDate sessionDate);
}
