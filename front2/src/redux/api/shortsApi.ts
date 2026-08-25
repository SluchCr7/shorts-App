import { baseApi } from "./baseApi";
import { Short } from "../../types";

export interface FeedResponse {
  shorts: Short[];
  hasMore: boolean;
}

export const shortsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShortsFeed: builder.query<FeedResponse, { type?: "for-you" | "following"; page?: number }>({
      query: ({ type = "for-you", page = 1 }) => `/shorts/feed?type=${type}&page=${page}&limit=10`,
      transformResponse: (res: { data: { shorts: Short[]; hasMore: boolean } }) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.shorts.map((s) => ({ type: "Short" as const, id: s._id })),
              { type: "Short", id: "LIST" },
            ]
          : [{ type: "Short", id: "LIST" }],
      // Merge results for infinite scrolling pagination
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.type || "for-you"}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1 || !arg.page) {
          return newItems;
        }
        const existingIds = new Set(currentCache.shorts.map((s) => s._id));
        const filteredNew = newItems.shorts.filter((s) => !existingIds.has(s._id));
        currentCache.shorts.push(...filteredNew);
        currentCache.hasMore = newItems.hasMore;
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg?.page !== previousArg?.page || currentArg?.type !== previousArg?.type;
      },
    }),

    getShortById: builder.query<Short, string>({
      query: (id) => `/shorts/${id}`,
      transformResponse: (res: { data: Short }) => res.data,
      providesTags: (result, error, id) => [{ type: "Short", id }],
    }),

    searchShorts: builder.query<Short[], { query?: string; tag?: string }>({
      query: ({ query = "", tag = "" }) => {
        let endpoint = "/shorts/search?";
        if (tag) endpoint += `tag=${encodeURIComponent(tag)}`;
        else if (query) endpoint += `q=${encodeURIComponent(query)}`;
        return endpoint;
      },
      transformResponse: (res: { data: { shorts: Short[] } }) => res.data?.shorts || [],
      providesTags: [{ type: "Short", id: "SEARCH_LIST" }],
    }),

    toggleLikeShort: builder.mutation<{ shortId: string; isLiked: boolean }, { short: Short; feedType?: "for-you" | "following" }>({
      query: ({ short }) => ({
        url: `/shorts/${short._id}/like`,
        method: short.isLiked ? "DELETE" : "POST",
      }),
      async onQueryStarted({ short, feedType = "for-you" }, { dispatch, queryFulfilled }) {
        const patchFeed = dispatch(
          shortsApi.util.updateQueryData("getShortsFeed", { type: feedType, page: 1 }, (draft) => {
            const target = draft.shorts.find((s) => s._id === short._id);
            if (target) {
              target.isLiked = !target.isLiked;
              target.likesCount += target.isLiked ? 1 : -1;
            }
          })
        );

        const patchSingle = dispatch(
          shortsApi.util.updateQueryData("getShortById", short._id, (draft) => {
            if (draft) {
              draft.isLiked = !draft.isLiked;
              draft.likesCount += draft.isLiked ? 1 : -1;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchFeed.undo();
          patchSingle.undo();
        }
      },
    }),

    toggleSaveShort: builder.mutation<{ shortId: string; isSaved: boolean }, { short: Short; feedType?: "for-you" | "following" }>({
      query: ({ short }) => ({
        url: `/shorts/${short._id}/save`,
        method: short.isSaved ? "DELETE" : "POST",
      }),
      async onQueryStarted({ short, feedType = "for-you" }, { dispatch, queryFulfilled }) {
        const patchFeed = dispatch(
          shortsApi.util.updateQueryData("getShortsFeed", { type: feedType, page: 1 }, (draft) => {
            const target = draft.shorts.find((s) => s._id === short._id);
            if (target) {
              target.isSaved = !target.isSaved;
              target.savesCount += target.isSaved ? 1 : -1;
            }
          })
        );

        const patchSingle = dispatch(
          shortsApi.util.updateQueryData("getShortById", short._id, (draft) => {
            if (draft) {
              draft.isSaved = !draft.isSaved;
              draft.savesCount += draft.isSaved ? 1 : -1;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchFeed.undo();
          patchSingle.undo();
        }
      },
    }),

    uploadShort: builder.mutation<Short, FormData>({
      query: (formData) => ({
        url: "/shorts",
        method: "POST",
        body: formData,
      }),
      transformResponse: (res: { data: Short }) => res.data,
      invalidatesTags: [{ type: "Short", id: "LIST" }],
    }),

    incrementViews: builder.mutation<void, { shortId: string; feedType?: "for-you" | "following" }>({
      query: ({ shortId }) => ({
        url: `/shorts/${shortId}/view`,
        method: "POST",
      }),
      async onQueryStarted({ shortId, feedType = "for-you" }, { dispatch, queryFulfilled }) {
        const patchFeed = dispatch(
          shortsApi.util.updateQueryData("getShortsFeed", { type: feedType, page: 1 }, (draft) => {
            const target = draft.shorts.find((s) => s._id === shortId);
            if (target) {
              target.viewsCount += 1;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchFeed.undo();
        }
      },
    }),

    deleteShort: builder.mutation<{ message: string }, string>({
      query: (shortId) => ({
        url: `/shorts/${shortId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Short", id },
        { type: "Short", id: "LIST" },
        { type: "Short", id: "SEARCH_LIST" },
        "User",
      ],
    }),
  }),
});

export const {
  useGetShortsFeedQuery,
  useGetShortByIdQuery,
  useSearchShortsQuery,
  useToggleLikeShortMutation,
  useToggleSaveShortMutation,
  useUploadShortMutation,
  useIncrementViewsMutation,
  useDeleteShortMutation,
} = shortsApi;
