import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

const getBaseUrl = () => {
  let url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1").trim();
  // Remove trailing slashes
  url = url.replace(/\/+$/, "");
  // If user provided domain without /api/v1, append /api/v1
  if (!url.endsWith("/api/v1")) {
    if (url.endsWith("/api")) {
      url += "/v1";
    } else {
      url += "/api/v1";
    }
  }
  return url;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const urlString = typeof args === "string" ? args : args.url;
    // Don't attempt reauth for auth endpoints like login, register, or refresh itself
    if (
      urlString.endsWith("/auth/login") ||
      urlString.endsWith("/auth/register") ||
      urlString.endsWith("/auth/refresh")
    ) {
      return result;
    }

    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

    if (refreshToken) {
      const refreshResult: any = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data?.data?.accessToken) {
        const newAccessToken = refreshResult.data.data.accessToken;
        const newRefreshToken = refreshResult.data.data.refreshToken;

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
        }

        // Retry original request with new access token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh token failed or expired, clean up stored tokens
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "Short", "Comment", "User", "Sound"],
  endpoints: () => ({}),
});
