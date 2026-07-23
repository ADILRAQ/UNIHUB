package com.unihub.model;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.DayOfWeek;
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
 * A weekly recurrence rule for a {@link Course}. The generation engine (UNIH-29) expands
 * an active template into concrete {@link Session}s for every matching {@code dayOfWeek}
 * between {@code startDate} and {@code endDate} (inclusive).
 *
 * <p>{@code dayOfWeek} reuses {@link java.time.DayOfWeek}, persisted ISO-style (Mon=1..
 * Sun=7) via {@link DayOfWeekConverter}. {@code startTime}/{@code endTime} are naive
 * times-of-day ({@link LocalTime} / SQL {@code TIME}); the active period bounds are naive
 * dates ({@link LocalDate} / SQL {@code DATE}).
 */
@Entity
@Table(name = "schedule_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Convert(converter = DayOfWeekConverter.class)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(length = 255)
    private String room;

    /** First date the recurrence applies (inclusive). */
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /** Last date the recurrence applies (inclusive). */
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
