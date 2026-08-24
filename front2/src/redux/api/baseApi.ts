import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getBaseUrl = () => {
  let url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1" || "https://shorts-server.vercel.app/api/v1").trim();
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

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    credentials: "include",
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ["Auth", "Short", "Comment", "User", "Sound"],
  endpoints: () => ({}),
});
