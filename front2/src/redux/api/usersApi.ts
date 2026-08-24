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
      { userId: string; isFollowing: boolean },
      { userId: string; username?: string; isFollowing?: boolean }
    >({
      query: ({ userId, isFollowing }) => ({
        url: `/users/${userId}/follow`,
        method: isFollowing ? "DELETE" : "POST",
      }),
      async onQueryStarted({ username, isFollowing }, { dispatch, queryFulfilled }) {
        let patchProfile;
        if (username) {
          patchProfile = dispatch(
            usersApi.util.updateQueryData("getUserProfile", username, (draft) => {
              if (draft) {
                draft.isFollowing = !draft.isFollowing;
                draft.followersCount += draft.isFollowing ? 1 : -1;
              }
            })
          );
        }
        try {
          await queryFulfilled;
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

