import { baseApi } from "./baseApi";
import { User, Short } from "../../types";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<User, string>({
      query: (username) => `/users/profile/${username}`,
      transformResponse: (res: { data: User }) => res.data,
      providesTags: (result, error, username) => [{ type: "User", id: username }],
    }),

    getUserShorts: builder.query<Short[], string>({
      query: (userId) => `/users/${userId}/shorts`,
      transformResponse: (res: { data: { shorts: Short[] } }) => res.data?.shorts || [],
      providesTags: (result, error, userId) => [{ type: "Short", id: `USER_${userId}` }],
    }),

    getUserLikedShorts: builder.query<Short[], string>({
      query: (userId) => `/users/${userId}/liked-shorts`,
      transformResponse: (res: { data: { shorts: Short[] } }) => res.data?.shorts || [],
      providesTags: [{ type: "Short", id: "USER_LIKED" }],
    }),

    getUserSavedShorts: builder.query<Short[], void>({
      query: () => `/users/saved/shorts`,
      transformResponse: (res: { data: { shorts: Short[] } }) => res.data?.shorts || [],
      providesTags: [{ type: "Short", id: "USER_SAVED" }],
    }),

    toggleFollowUser: builder.mutation<
      { isFollowing: boolean; followersCount: number },
      { userId: string; username?: string; isFollowing?: boolean; targetState?: boolean }
    >({
      query: ({ userId, isFollowing, targetState }) => ({
        url: `/users/${userId}/follow`,
        method: "POST",
        body: typeof targetState === "boolean" ? { targetState } : typeof isFollowing === "boolean" ? { targetState: !isFollowing } : {},
      }),
      transformResponse: (res: { data: { isFollowing: boolean; followersCount: number } }) => res.data,
      async onQueryStarted({ userId, username, isFollowing, targetState }, { dispatch, queryFulfilled }) {
        const nextIsFollowing = typeof targetState === "boolean" ? targetState : !isFollowing;
        const diff = nextIsFollowing ? 1 : -1;

        let patchProfile;
        if (username) {
          patchProfile = dispatch(
            usersApi.util.updateQueryData("getUserProfile", username, (draft) => {
              if (draft) {
                draft.isFollowing = nextIsFollowing;
                draft.followersCount = Math.max(0, draft.followersCount + diff);
              }
            })
          );
        }

        try {
          const { data } = await queryFulfilled;
          if (data && username) {
            dispatch(
              usersApi.util.updateQueryData("getUserProfile", username, (draft) => {
                if (draft) {
                  draft.isFollowing = data.isFollowing;
                  draft.followersCount = data.followersCount;
                }
              })
            );
          }
        } catch {
          if (patchProfile) patchProfile.undo();
        }
      },
      invalidatesTags: (result, error, { username }) => [
        { type: "User", id: username || "PROFILE" },
        "Auth",
      ],
    }),

    updateProfile: builder.mutation<User, { fullName?: string; bio?: string; website?: string }>({
      query: (data) => ({
        url: "/users/profile",
        method: "PATCH",
        body: data,
      }),
      transformResponse: (res: { data: User }) => res.data,
      invalidatesTags: ["Auth", "User"],
    }),

    updateAvatar: builder.mutation<User, FormData>({
      query: (formData) => ({
        url: "/users/avatar",
        method: "PATCH",
        body: formData,
      }),
      transformResponse: (res: { data: User }) => res.data,
      invalidatesTags: ["Auth", "User"],
    }),

    updateCover: builder.mutation<User, FormData>({
      query: (formData) => ({
        url: "/users/cover",
        method: "PATCH",
        body: formData,
      }),
      transformResponse: (res: { data: User }) => res.data,
      invalidatesTags: ["Auth", "User"],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useGetUserShortsQuery,
  useGetUserLikedShortsQuery,
  useGetUserSavedShortsQuery,
  useToggleFollowUserMutation,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useUpdateCoverMutation,
} = usersApi;

