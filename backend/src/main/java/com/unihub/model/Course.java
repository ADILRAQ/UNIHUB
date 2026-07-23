package com.unihub.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * A course taught by one teacher to one class group, with an optional Google Meet link.
 *
 * <p>The keystone of Epic 4, reused by announcements/resources/payments (Epics 3/5/6).
 * Associations are {@code LAZY} and one-directional (no {@code @OneToMany} back to
 * sessions/templates) to avoid N+1 foot-guns — see {@link ClassGroup}.
 */
@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** The teaching {@link User} (role {@code TEACHER}). Ownership scope for RBAC. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_group_id", nullable = false)
    private ClassGroup classGroup;

    /** Plain Google Meet URL; a per-session link overrides this when set. */
    @Column(name = "meet_link", length = 1024)
    private String meetLink;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
