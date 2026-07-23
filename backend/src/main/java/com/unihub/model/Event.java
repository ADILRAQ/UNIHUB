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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * A one-off calendar entry (exam, deadline, or generic event) that sits alongside the
 * recurring {@link Session} series.
 *
 * <p>Scope: a null {@code classGroup} means department-wide; otherwise the event targets
 * that cohort. {@code course} is an optional association (e.g. an exam for a course).
 * {@code startTime}/{@code endTime} are optional — all-day entries leave them null.
 */
@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EventType type;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    /** Optional course this entry relates to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    /** Target cohort; {@code null} means department-wide. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_group_id")
    private ClassGroup classGroup;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
