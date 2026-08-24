import { baseApi } from "./baseApi";
import { Sound, Short } from "../../types";

export const soundsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const { useGetSoundByIdQuery, useGetSoundShortsQuery } = soundsApi;
