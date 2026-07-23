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
 * A department-wide or class-group-scoped announcement authored by a
 * {@link User} with role {@code TEACHER} or {@code ADMIN}.
 *
 * <p>{@code classGroup} is nullable: a {@code null} value means the
 * announcement is department-wide and visible to every user.
 *
 * <p>{@code bodyHtml} stores server-sanitized HTML — the service layer MUST
 * sanitize input before persisting. Never expose this entity directly in a
 * response; use the {@code dto} package instead.
 */
@Entity
@Table(name = "announcements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    /** {@code null} = department-wide announcement. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_group_id")
    private ClassGroup classGroup;

    @Column(nullable = false, length = 255)
    private String title;

    /** Server-sanitized HTML body; stored as-is after sanitization in the service layer. */
    @Column(name = "body_html", nullable = false, columnDefinition = "TEXT")
    private String bodyHtml;

    @Column(nullable = false)
    private boolean pinned = false;

    @Column(nullable = false)
    private boolean urgent = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Set by the service when the title or body is changed after the initial
     * creation. {@code null} means the announcement has never been edited.
     */
    @Column(name = "edited_at")
    private Instant editedAt;
}
