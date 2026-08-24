import { baseApi } from "./baseApi";
import { Comment } from "../../types";

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<Comment[], string>({
      query: (shortId) => `/shorts/${shortId}/comments`,
      transformResponse: (res: { data: { comments: Comment[] } }) => res.data?.comments || [],
      providesTags: (result, error, shortId) =>
        result
          ? [
              ...result.map((c) => ({ type: "Comment" as const, id: c._id })),
              { type: "Comment", id: `LIST_${shortId}` },
            ]
          : [{ type: "Comment", id: `LIST_${shortId}` }],
    }),

    getCommentReplies: builder.query<Comment[], string>({
      query: (commentId) => `/comments/${commentId}/replies`,
      transformResponse: (res: { data: { replies: Comment[] } }) => res.data?.replies || [],
      providesTags: (result, error, commentId) => [{ type: "Comment", id: `REPLIES_${commentId}` }],
    }),

    addComment: builder.mutation<Comment, { shortId: string; content: string; parentCommentId?: string }>({
      query: ({ shortId, content, parentCommentId }) => ({
        url: `/shorts/${shortId}/comments`,
        method: "POST",
        body: { content, parentCommentId },
      }),
      transformResponse: (res: { data: Comment }) => res.data,
      invalidatesTags: (result, error, { shortId, parentCommentId }) => [
        { type: "Comment", id: `LIST_${shortId}` },
        ...(parentCommentId ? [{ type: "Comment" as const, id: `REPLIES_${parentCommentId}` }] : []),
      ],
    }),

    deleteComment: builder.mutation<void, { commentId: string; shortId: string; parentCommentId?: string }>({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { shortId, parentCommentId }) => [
        { type: "Comment", id: `LIST_${shortId}` },
        ...(parentCommentId ? [{ type: "Comment" as const, id: `REPLIES_${parentCommentId}` }] : []),
      ],
    }),

    toggleLikeComment: builder.mutation<
      void,
      { commentId: string; shortId: string; parentCommentId?: string; isLiked?: boolean }
    >({
      query: ({ commentId, isLiked }) => ({
        url: `/comments/${commentId}/like`,
        method: isLiked ? "DELETE" : "POST",
      }),
      async onQueryStarted({ commentId, shortId, parentCommentId }, { dispatch, queryFulfilled }) {
        const patchList = dispatch(
          commentsApi.util.updateQueryData("getComments", shortId, (draft) => {
            const comment = draft.find((c) => c._id === commentId);
            if (comment) {
              comment.isLiked = !comment.isLiked;
              comment.likesCount += comment.isLiked ? 1 : -1;
            }
          })
        );

        let patchReplies;
        if (parentCommentId) {
          patchReplies = dispatch(
            commentsApi.util.updateQueryData("getCommentReplies", parentCommentId, (draft) => {
              const comment = draft.find((c) => c._id === commentId);
              if (comment) {
                comment.isLiked = !comment.isLiked;
                comment.likesCount += comment.isLiked ? 1 : -1;
              }
            })
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patchList.undo();
          if (patchReplies) patchReplies.undo();
        }
      },
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useGetCommentRepliesQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useToggleLikeCommentMutation,
} = commentsApi;
