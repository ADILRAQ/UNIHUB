package com.unihub.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Read receipt: records that a {@link User} has seen a particular {@link Announcement}.
 *
 * <p>The composite primary key {@code (announcementId, userId)} prevents duplicate
 * receipts for the same pair. Used by the service layer to compute unread counts.
 *
 * <p>Never expose this entity directly in a response; use the {@code dto} package.
 */
@Entity
@Table(name = "announcement_reads")
@Getter
@Setter
@NoArgsConstructor
public class AnnouncementRead {

    @EmbeddedId
    private AnnouncementReadId id = new AnnouncementReadId();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("announcementId")
    @JoinColumn(name = "announcement_id")
    private Announcement announcement;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @CreationTimestamp
    @Column(name = "read_at", nullable = false, updatable = false)
    private Instant readAt;

    public AnnouncementRead(Announcement announcement, User user) {
        this.announcement = announcement;
        this.user = user;
        this.id = new AnnouncementReadId(announcement.getId(), user.getId());
    }
}
