import { baseApi } from "./baseApi";
import { User } from "../../types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkAuth: builder.query<User, void>({
      query: () => "/auth/me",
      transformResponse: (response: { data: User }) => response.data,
      providesTags: ["Auth"],
    }),
    login: builder.mutation<User, { emailOrUsername: string; password: string }>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: { data: { user: User; accessToken?: string; refreshToken?: string } }) => {
        if (typeof window !== "undefined" && response.data?.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
          if (response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
          }
        }
        return response.data.user;
      },
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<User, { username: string; email: string; password: string; fullName: string }>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      transformResponse: (response: { data: { user: User; accessToken?: string; refreshToken?: string } }) => {
        if (typeof window !== "undefined" && response.data?.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
          if (response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
          }
        }
        return response.data.user;
      },
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        try {
          await queryFulfilled;
          dispatch(baseApi.util.resetApiState());
        } catch {}
      },
    }),
    updateProfile: builder.mutation<User, { fullName?: string; bio?: string; website?: string }>({
      query: (data) => ({
        url: "/users/profile",
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: User }) => response.data,
      invalidatesTags: ["Auth", "User"],
    }),
  }),
});

export const {
  useCheckAuthQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
} = authApi;
