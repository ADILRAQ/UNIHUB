package com.unihub.repository;

import com.unihub.model.AnnouncementComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Data-access layer for {@link AnnouncementComment}.
 */
public interface AnnouncementCommentRepository extends JpaRepository<AnnouncementComment, Long> {

    /**
     * Returns all comments for the given announcement, ordered by the caller's
     * {@link Pageable} (typically {@code created_at ASC}).
     */
    Page<AnnouncementComment> findByAnnouncementId(Long announcementId, Pageable pageable);
}
