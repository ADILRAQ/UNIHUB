package com.unihub.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/**
 * Composite primary key for {@link UserClassGroup}: {@code (userId, classGroupId)}.
 */
@Embeddable
public class UserClassGroupId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "class_group_id")
    private Long classGroupId;

    public UserClassGroupId() {
    }

    public UserClassGroupId(Long userId, Long classGroupId) {
        this.userId = userId;
        this.classGroupId = classGroupId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getClassGroupId() {
        return classGroupId;
    }

    public void setClassGroupId(Long classGroupId) {
        this.classGroupId = classGroupId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserClassGroupId that)) {
            return false;
        }
        return Objects.equals(userId, that.userId) && Objects.equals(classGroupId, that.classGroupId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, classGroupId);
    }
}
