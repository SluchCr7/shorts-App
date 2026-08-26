import { baseApi } from "./baseApi";
import { Sound, Short } from "../../types";

export const soundsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAudios: builder.query<{ audios: Sound[]; total: number; page: number; hasMore: boolean }, { search?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append("search", params.search);
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        return `/audios?${queryParams.toString()}`;
      },
      transformResponse: (res: { data: { audios: Sound[]; total: number; page: number; hasMore: boolean } }) => res.data,
      providesTags: ["Sound"],
    }),

    getTrendingSounds: builder.query<Sound[], number | void>({
      query: (limit = 20) => `/sounds/trending?limit=${limit}`,
      transformResponse: (res: { data: Sound[] }) => res.data,
      providesTags: ["Sound"],
    }),

    getSoundById: builder.query<Sound, string>({
      query: (id) => `/sounds/${id}`,
      transformResponse: (res: { data: Sound }) => res.data,
      providesTags: (result, error, id) => [{ type: "Sound", id }],
    }),

    getSoundShorts: builder.query<Short[], string>({
      query: (id) => `/sounds/${id}/shorts`,
      transformResponse: (res: { data: { shorts: Short[] } }) => res.data?.shorts || [],
      providesTags: (result, error, id) => [{ type: "Short", id: `SOUND_${id}` }],
    }),

    uploadAudioTrack: builder.mutation<Sound, FormData>({
      query: (formData) => ({
        url: "/audios/upload",
        method: "POST",
        body: formData,
      }),
      transformResponse: (res: { data: Sound }) => res.data,
      invalidatesTags: ["Sound"],
    }),
  }),
});

export const {
  useGetAudiosQuery,
  useGetTrendingSoundsQuery,
  useGetSoundByIdQuery,
  useGetSoundShortsQuery,
  useUploadAudioTrackMutation,
} = soundsApi;
