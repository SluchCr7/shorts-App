"use client";

import { useState } from "react";
import Link from "next/link";
import { Comment } from "../../types";
import VerifiedBadge from "../common/VerifiedBadge";
import { useAppDispatch } from "../../redux/store";
import { useCheckAuthQuery } from "../../redux/api/authApi";
import { openAuthModal } from "../../redux/slices/uiSlice";
import {
  useDeleteCommentMutation,
  useToggleLikeCommentMutation,
  useGetCommentRepliesQuery,
  useAddCommentMutation,
} from "../../redux/api/commentsApi";
import { FiHeart, FiTrash2, FiCornerDownRight, FiChevronDown, FiChevronUp, FiSend } from "react-icons/fi";

interface CommentItemProps {
  comment: Comment;
  shortId: string;
  depth?: number;
}

export default function CommentItem({ comment, shortId, depth = 0 }: CommentItemProps) {
  const dispatch = useAppDispatch();
  const { data: user } = useCheckAuthQuery();
  const [deleteComment] = useDeleteCommentMutation();
  const [toggleLikeComment] = useToggleLikeCommentMutation();
  const [addComment, { isLoading: isPostingReply }] = useAddCommentMutation();

  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const { data: replies = [], isLoading: isLoadingReplies } = useGetCommentRepliesQuery(comment._id, {
    skip: !showReplies,
  });

  const isOwner = user?._id === comment.user?._id;
  const isAuthenticated = !!user;

  const handleDelete = () => {
    deleteComment({
      commentId: comment._id,
      shortId,
      parentCommentId: comment.parentComment || undefined,
    });
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal("like comments"));
      return;
    }
    toggleLikeComment({
      commentId: comment._id,
      shortId,
      parentCommentId: comment.parentComment || undefined,
      isLiked: comment.isLiked,
    });
  };

  const handleReplyClick = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal("reply to comments"));
      return;
    }
    setIsReplying(!isReplying);
    if (!isReplying && !replyText) {
      setReplyText(`@${comment.user?.username} `);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(openAuthModal("reply to comments"));
      return;
    }
    if (!replyText.trim() || isPostingReply) return;

    try {
      await addComment({
        shortId,
        content: replyText.trim(),
        parentCommentId: comment._id,
      }).unwrap();

      setReplyText("");
      setIsReplying(false);
      setShowReplies(true);
    } catch (err) {
      console.error("Failed to post reply", err);
    }
  };

  const effectiveRepliesCount = comment.repliesCount || replies.length;

  return (
    <div className="flex flex-col py-2.5 group transition-all">
      <div className="flex gap-3">
        {/* User Avatar */}
        <Link href={`/profile/${comment.user?.username}`} className="flex-shrink-0">
          <img
            src={comment.user?.avatar || "https://res.cloudinary.com/demo/image/upload/v1570972417/avatar-placeholder.png"}
            alt={comment.user?.username || "User"}
            className={`${depth > 0 ? "w-7 h-7" : "w-9 h-9"} rounded-full object-cover border border-[var(--border-color)]`}
          />
        </Link>

        {/* Comment Content */}
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/profile/${comment.user?.username}`}
                className="font-bold text-xs text-[var(--text-primary)] hover:underline"
              >
                @{comment.user?.username}
              </Link>
              {comment.user?.isVerified && (
                <VerifiedBadge size="xs" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-xs cursor-pointer ${
                  comment.isLiked ? "text-rose-500 font-semibold" : "text-[var(--text-muted)] hover:text-rose-500"
                }`}
              >
                <FiHeart className={`w-3.5 h-3.5 ${comment.isLiked ? "fill-rose-500" : ""}`} />
                {comment.likesCount > 0 && <span className="text-[11px]">{comment.likesCount}</span>}
              </button>

              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="text-[var(--text-muted)] hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-1 cursor-pointer"
                  title="Delete comment"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed break-words">
            {comment.content}
          </p>

          {/* Action Row: Timestamp & Reply */}
          <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] pt-0.5">
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>

            {depth < 3 && (
              <button
                onClick={handleReplyClick}
                className="font-bold hover:text-[var(--accent-primary)] transition-colors cursor-pointer flex items-center gap-1"
              >
                <FiCornerDownRight className="w-3 h-3" />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Reply Form */}
      {isReplying && (
        <form onSubmit={handlePostReply} className="mt-2.5 ml-10 flex gap-2 animate-in fade-in duration-150">
          <input
            type="text"
            autoFocus
            placeholder={`Reply to @${comment.user?.username}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 h-9 px-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
          <button
            type="submit"
            disabled={!replyText.trim() || isPostingReply}
            className="h-9 px-3 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            {isPostingReply ? (
              <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <FiSend className="w-3 h-3" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsReplying(false)}
            className="h-9 px-3 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* View Replies Toggle Button */}
      {effectiveRepliesCount > 0 && (
        <div className="ml-10 mt-1.5">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
          >
            <div className="w-6 border-b border-[var(--accent-primary)]/40" />
            {showReplies ? (
              <>
                <FiChevronUp className="w-3.5 h-3.5" />
                <span>Hide replies</span>
              </>
            ) : (
              <>
                <FiChevronDown className="w-3.5 h-3.5" />
                <span>View {effectiveRepliesCount} {effectiveRepliesCount === 1 ? "reply" : "replies"}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Nested Replies List */}
      {showReplies && (
        <div className="ml-6 pl-4 border-l-2 border-[var(--border-color)]/60 mt-2 space-y-1">
          {isLoadingReplies ? (
            <div className="py-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
              <span>Loading replies...</span>
            </div>
          ) : replies.length === 0 ? (
            <p className="py-1 text-xs text-[var(--text-muted)]">No replies found.</p>
          ) : (
            replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                shortId={shortId}
                depth={depth + 1}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
