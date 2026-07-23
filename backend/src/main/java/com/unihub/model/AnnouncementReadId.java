package com.unihub.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/**
 * Composite primary key for {@link AnnouncementRead}: {@code (announcementId, userId)}.
 */
@Embeddable
public class AnnouncementReadId implements Serializable {

    @Column(name = "announcement_id")
    private Long announcementId;

    @Column(name = "user_id")
    private Long userId;

    public AnnouncementReadId() {
    }

    public AnnouncementReadId(Long announcementId, Long userId) {
        this.announcementId = announcementId;
        this.userId = userId;
    }

    public Long getAnnouncementId() {
        return announcementId;
    }

    public void setAnnouncementId(Long announcementId) {
        this.announcementId = announcementId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AnnouncementReadId that)) {
            return false;
        }
        return Objects.equals(announcementId, that.announcementId)
                && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(announcementId, userId);
    }
}
