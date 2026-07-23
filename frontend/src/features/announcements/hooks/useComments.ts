/**
 * Logic hook for the comments thread component.
 * Handles pagination, new-comment form state, posting, and deletion.
 */
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import * as commentService from '../services/commentService';
import type { CommentDto } from '../types';
import type { PagedResponse } from '../../../api/types';

interface UseCommentsOptions {
  announcementId: number;
  currentUserId: number;
  currentUserRole: string;
}

interface UseCommentsReturn {
  comments: CommentDto[];
  totalPages: number;
  page: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  newComment: string;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
  onDelete: (commentId: number) => void;
  isSubmitting: boolean;
  isLoading: boolean;
  isError: boolean;
  canDelete: (comment: CommentDto) => boolean;
}

const useComments = ({
  announcementId,
  currentUserId,
  currentUserRole,
}: UseCommentsOptions): UseCommentsReturn => {
  const [page, setPage] = useState(0);
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const commentsKey = ['comments', announcementId, page] as const;

  const { data, isLoading, isError } = useGetData<
    PagedResponse<CommentDto>,
    string | number,
    PagedResponse<CommentDto>
  >({
    queryKey: [...commentsKey],
    queryFn: () => commentService.listComments(announcementId, page),
    transformFn: (d) => d,
  });

  const refetchComments = () => {
    void queryClient.invalidateQueries({ queryKey: ['comments', announcementId] });
  };

  const { mutate: submitComment, isPending: isSubmitting } = usePostData<
    string | number,
    commentService.AddCommentParams,
    CommentDto
  >({
    keys: ['comments', announcementId, 'add'],
    serviceFn: commentService.addComment,
    onSuccessFn: () => {
      setNewComment('');
      refetchComments();
    },
  });

  const { mutate: doDelete } = usePostData<
    string | number,
    commentService.DeleteCommentParams,
    void
  >({
    keys: ['comments', announcementId, 'delete'],
    serviceFn: commentService.deleteComment,
    onSuccessFn: () => {
      refetchComments();
    },
  });

  const onNextPage = () => {
    if (data && page < data.totalPages - 1) {
      setPage((p) => p + 1);
    }
  };

  const onPrevPage = () => {
    if (page > 0) {
      setPage((p) => p - 1);
    }
  };

  const onCommentChange = (value: string) => {
    setNewComment(value);
  };

  const onSubmit = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    submitComment({ announcementId, content: trimmed });
  };

  const onDelete = (commentId: number) => {
    doDelete({ announcementId, commentId });
  };

  const canDelete = (comment: CommentDto): boolean =>
    currentUserId === comment.authorId || currentUserRole === 'ADMIN';

  return {
    comments: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    page,
    onNextPage,
    onPrevPage,
    newComment,
    onCommentChange,
    onSubmit,
    onDelete,
    isSubmitting,
    isLoading,
    isError,
    canDelete,
  };
};

export default useComments;
