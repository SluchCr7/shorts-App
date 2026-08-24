"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { closeCommentsDrawer } from "../../redux/slices/uiSlice";
import { useCheckAuthQuery } from "../../redux/api/authApi";
import { useGetCommentsQuery, useAddCommentMutation } from "../../redux/api/commentsApi";
import CommentItem from "./CommentItem";
import { FiX, FiSend } from "react-icons/fi";

export default function CommentsDrawer() {
  const dispatch = useAppDispatch();
  const { isCommentsOpen, commentsShortId } = useAppSelector((state) => state.ui);
  const { data: user } = useCheckAuthQuery();
  const isAuthenticated = !!user;

  const [newCommentText, setNewCommentText] = useState("");

  const { data: comments = [], isLoading } = useGetCommentsQuery(commentsShortId || "", {
    skip: !isCommentsOpen || !commentsShortId,
  });

  const [addComment, { isLoading: isPosting }] = useAddCommentMutation();

  if (!isCommentsOpen || !commentsShortId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !commentsShortId || isPosting) return;

    try {
      await addComment({
        shortId: commentsShortId,
        content: newCommentText.trim(),
      }).unwrap();
      setNewCommentText("");
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(closeCommentsDrawer())}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-md h-full bg-[var(--bg-surface)] border-l border-[var(--border-color)] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-elevated)]/30 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-[var(--text-primary)]">
              Comments
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-bold">
              {comments.length}
            </span>
          </div>
          <button
            onClick={() => dispatch(closeCommentsDrawer())}
            className="p-2 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-3 border-[var(--accent-primary)] border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-[var(--text-muted)]">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-16 text-center text-[var(--text-secondary)] space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] text-xl flex items-center justify-center mx-auto text-[var(--text-muted)]">
                💬
              </div>
              <p className="font-bold text-sm text-[var(--text-primary)]">No comments yet</p>
              <p className="text-xs text-[var(--text-muted)]">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} shortId={commentsShortId} />
            ))
          )}
        </div>

        {/* Input Form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex gap-2.5 items-center">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="flex-1 h-11 px-4 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim() || isPosting}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-[var(--accent-primary)]/20 hover:scale-105 active:scale-95 shrink-0"
            >
              <FiSend className="w-4 h-4 translate-x-0.5" />
            </button>
          </form>
        ) : (
          <div className="p-4 border-t border-[var(--border-color)] text-center text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-elevated)]/30">
            Please log in to join the conversation.
          </div>
        )}
      </div>
    </div>
  );
}
