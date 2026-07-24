package com.unihub.service;

import com.unihub.dto.CommentDto;
import com.unihub.dto.CreateCommentRequest;
import com.unihub.dto.PagedResponse;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.mapper.CommentMapper;
import com.unihub.model.Announcement;
import com.unihub.model.AnnouncementComment;
import com.unihub.model.User;
import com.unihub.repository.AnnouncementCommentRepository;
import com.unihub.repository.UserRepository;
import com.unihub.security.AuthenticatedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for announcement comments (UNIH-25).
 *
 * <p>Visibility of the parent announcement is delegated to
 * {@link AnnouncementService#requireVisibleAnnouncement} so the scoping rules
 * live in exactly one place.
 *
 * <p>Comment content is stored as plain text — no HTML sanitization is
 * applied here. HTML in comment content is not rendered by the frontend.
 */
@Service
public class CommentService {

    private static final int PAGE_SIZE = 20;
    private static final Sort OLDEST_FIRST = Sort.by(Sort.Order.asc("createdAt"));
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TEACHER = "TEACHER";

    private final AnnouncementCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final AnnouncementService announcementService;

    public CommentService(AnnouncementCommentRepository commentRepository,
                          UserRepository userRepository,
                          AnnouncementService announcementService) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.announcementService = announcementService;
    }

    /**
     * Returns the paginated comment list for the given announcement, oldest first.
     * 403 if the announcement is not visible to the caller.
     *
     * @param announcementId the announcement to list comments for
     * @param caller         the authenticated user
     * @param page           zero-based page index
     */
    @Transactional(readOnly = true)
    public PagedResponse<CommentDto> listComments(Long announcementId,
                                                  AuthenticatedUser caller,
                                                  int page) {
        // Visibility gate: 404 if announcement doesn't exist, 403 if not visible
        announcementService.requireVisibleAnnouncement(announcementId, caller);

        Page<AnnouncementComment> commentPage = commentRepository.findByAnnouncementId(
                announcementId, PageRequest.of(page, PAGE_SIZE, OLDEST_FIRST));

        return PagedResponse.from(commentPage, CommentMapper::toDto);
    }

    /**
     * Adds a plain-text comment to the announcement.
     * 403 if the announcement is not visible to the caller.
     * 400 if content is blank or exceeds 2000 characters.
     *
     * @param announcementId the announcement to comment on
     * @param request        the comment payload
     * @param caller         the authenticated user
     */
    @Transactional
    public CommentDto addComment(Long announcementId,
                                 CreateCommentRequest request,
                                 AuthenticatedUser caller) {
        Announcement announcement = announcementService.requireVisibleAnnouncement(announcementId, caller);

        // Belt-and-suspenders validation in addition to @Valid at the controller
        String content = request.content();
        if (content == null || content.isBlank()) {
            throw new BadRequestException("Comment content must not be blank.");
        }
        if (content.length() > 2000) {
            throw new BadRequestException("Comment content must not exceed 2000 characters.");
        }

        User author = requireUser(caller.userId());

        AnnouncementComment comment = new AnnouncementComment();
        comment.setAnnouncement(announcement);
        comment.setAuthor(author);
        comment.setContent(content.strip());

        return CommentMapper.toDto(commentRepository.save(comment));
    }

    /**
     * Deletes a comment. Allowed for:
     * <ul>
     *   <li>the comment's own author;</li>
     *   <li>the announcement's original author;</li>
     *   <li>any admin.</li>
     * </ul>
     * 404 if the comment does not exist or does not belong to this announcement.
     * 403 if the caller is none of the above.
     *
     * @param announcementId the announcement the comment must belong to
     * @param commentId      the comment to delete
     * @param caller         the authenticated user
     */
    @Transactional
    public void deleteComment(Long announcementId, Long commentId, AuthenticatedUser caller) {
        AnnouncementComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Comment " + commentId + " not found."));

        // Ensure the comment belongs to the announced announcement
        if (!comment.getAnnouncement().getId().equals(announcementId)) {
            throw new ResourceNotFoundException(
                    "Comment " + commentId + " does not belong to announcement " + announcementId + ".");
        }

        boolean isCommentAuthor = comment.getAuthor().getId().equals(caller.userId());
        boolean isAnnouncementAuthor = comment.getAnnouncement().getAuthor().getId()
                .equals(caller.userId());
        boolean isAdmin = ROLE_ADMIN.equals(caller.role()) || ROLE_TEACHER.equals(caller.role());

        if (!isCommentAuthor && !isAnnouncementAuthor && !isAdmin) {
            throw new AccessDeniedException("You are not allowed to delete this comment.");
        }

        commentRepository.delete(comment);
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User " + userId + " not found."));
    }
}
