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
      { isLiked: boolean; likesCount: number },
      { commentId: string; shortId: string; parentCommentId?: string; isLiked?: boolean; targetState?: boolean }
    >({
      query: ({ commentId, isLiked, targetState }) => ({
        url: `/comments/${commentId}/like`,
        method: "POST",
        body: typeof targetState === "boolean" ? { targetState } : typeof isLiked === "boolean" ? { targetState: !isLiked } : {},
      }),
      transformResponse: (res: { data: { isLiked: boolean; likesCount: number } }) => res.data,
      async onQueryStarted({ commentId, shortId, parentCommentId, isLiked, targetState }, { dispatch, queryFulfilled }) {
        const nextIsLiked = typeof targetState === "boolean" ? targetState : !isLiked;
        const diff = nextIsLiked ? 1 : -1;

        const updateItem = (comment: Comment) => {
          if (comment._id === commentId) {
            comment.isLiked = nextIsLiked;
            comment.likesCount = Math.max(0, comment.likesCount + diff);
          }
        };

        const patchList = dispatch(
          commentsApi.util.updateQueryData("getComments", shortId, (draft) => {
            if (Array.isArray(draft)) {
              draft.forEach(updateItem);
            }
          })
        );

        let patchReplies;
        if (parentCommentId) {
          patchReplies = dispatch(
            commentsApi.util.updateQueryData("getCommentReplies", parentCommentId, (draft) => {
              if (Array.isArray(draft)) {
                draft.forEach(updateItem);
              }
            })
          );
        }

        try {
          const { data } = await queryFulfilled;
          if (data) {
            const reconcileItem = (comment: Comment) => {
              if (comment._id === commentId) {
                comment.isLiked = data.isLiked;
                comment.likesCount = data.likesCount;
              }
            };

            dispatch(
              commentsApi.util.updateQueryData("getComments", shortId, (draft) => {
                if (Array.isArray(draft)) {
                  draft.forEach(reconcileItem);
                }
              })
            );

            if (parentCommentId) {
              dispatch(
                commentsApi.util.updateQueryData("getCommentReplies", parentCommentId, (draft) => {
                  if (Array.isArray(draft)) {
                    draft.forEach(reconcileItem);
                  }
                })
              );
            }
          }
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
