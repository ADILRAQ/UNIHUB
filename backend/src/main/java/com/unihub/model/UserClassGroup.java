package com.unihub.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Membership of a {@link User} in a {@link ClassGroup}.
 *
 * <p><strong>Dual meaning driven by the member's role</strong> (single table,
 * no separate rights table):
 * <ul>
 *   <li>A row where the user has role {@code STUDENT} represents cohort
 *       membership in the group.</li>
 *   <li>A row where the user has role {@code TEACHER} <em>is</em> that
 *       teacher's import-rights grant for the group — i.e. the set of groups
 *       a teacher may CSV-import students into / manage is exactly the set of
 *       {@code TEACHER}-role rows for that teacher in this table. There is no
 *       separate "teacher rights" table.
 * </ul>
 */
@Entity
@Table(name = "user_class_groups")
@Getter
@Setter
@NoArgsConstructor
public class UserClassGroup {

    @EmbeddedId
    private UserClassGroupId id = new UserClassGroupId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("classGroupId")
    @JoinColumn(name = "class_group_id")
    private ClassGroup classGroup;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public UserClassGroup(User user, ClassGroup classGroup) {
        this.user = user;
        this.classGroup = classGroup;
        this.id = new UserClassGroupId(user.getId(), classGroup.getId());
    }
}
