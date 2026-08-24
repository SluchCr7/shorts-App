import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Short } from "../../types";
import { apiFetch } from "../api/apiConfig";

interface ShortsState {
  feed: Short[];
  feedType: "for-you" | "following";
  activeShortId: string | null;
  loading: boolean;
  hasMore: boolean;
  page: number;
  searchResults: Short[];
  searchLoading: boolean;
  isUploadOpen: boolean;
  error: string | null;
}

const initialState: ShortsState = {
  feed: [],
  feedType: "for-you",
  activeShortId: null,
  loading: false,
  hasMore: true,
  page: 1,
  searchResults: [],
  searchLoading: false,
  isUploadOpen: false,
  error: null,
};

// Fetch Shorts Feed
export const fetchShortsFeed = createAsyncThunk(
  "shorts/fetchFeed",
  async (
    { type = "for-you", page = 1 }: { type?: "for-you" | "following"; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiFetch(`/shorts/feed?type=${type}&page=${page}&limit=10`);
      return {
        shorts: res.data.shorts,
        hasMore: res.data.hasMore,
        page,
        type,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Search Shorts
export const searchShorts = createAsyncThunk(
  "shorts/search",
  async (query: string, { rejectWithValue }) => {
    try {
      const res = await apiFetch(`/shorts/search?q=${encodeURIComponent(query)}`);
      return res.data.shorts;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Toggle Like Short (Optimistic Thunk)
export const toggleLikeShort = createAsyncThunk(
  "shorts/toggleLike",
  async (short: Short, { dispatch, rejectWithValue }) => {
    const isLiked = short.isLiked;
    dispatch(shortsSlice.actions.optimisticLikeToggle(short._id));
    try {
      if (isLiked) {
        await apiFetch(`/shorts/${short._id}/like`, { method: "DELETE" });
      } else {
        await apiFetch(`/shorts/${short._id}/like`, { method: "POST" });
      }
      return { shortId: short._id, isLiked: !isLiked };
    } catch (error: any) {
      // Rollback on error
      dispatch(shortsSlice.actions.optimisticLikeToggle(short._id));
      return rejectWithValue(error.message);
    }
  }
);

// Toggle Save Short (Optimistic Thunk)
export const toggleSaveShort = createAsyncThunk(
  "shorts/toggleSave",
  async (short: Short, { dispatch, rejectWithValue }) => {
    const isSaved = short.isSaved;
    dispatch(shortsSlice.actions.optimisticSaveToggle(short._id));
    try {
      if (isSaved) {
        await apiFetch(`/shorts/${short._id}/save`, { method: "DELETE" });
      } else {
        await apiFetch(`/shorts/${short._id}/save`, { method: "POST" });
      }
      return { shortId: short._id, isSaved: !isSaved };
    } catch (error: any) {
      // Rollback on error
      dispatch(shortsSlice.actions.optimisticSaveToggle(short._id));
      return rejectWithValue(error.message);
    }
  }
);

// Upload Short
export const uploadShort = createAsyncThunk(
  "shorts/upload",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await apiFetch("/shorts", {
        method: "POST",
        body: formData,
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const shortsSlice = createSlice({
  name: "shorts",
  initialState,
  reducers: {
    setFeedType: (state, action: PayloadAction<"for-you" | "following">) => {
      state.feedType = action.payload;
      state.feed = [];
      state.page = 1;
      state.hasMore = true;
    },
    setActiveShortId: (state, action: PayloadAction<string | null>) => {
      state.activeShortId = action.payload;
    },
    openUploadModal: (state) => {
      state.isUploadOpen = true;
    },
    closeUploadModal: (state) => {
      state.isUploadOpen = false;
    },
    optimisticLikeToggle: (state, action: PayloadAction<string>) => {
      const short = state.feed.find((s) => s._id === action.payload);
      if (short) {
        short.isLiked = !short.isLiked;
        short.likesCount += short.isLiked ? 1 : -1;
      }
    },
    optimisticSaveToggle: (state, action: PayloadAction<string>) => {
      const short = state.feed.find((s) => s._id === action.payload);
      if (short) {
        short.isSaved = !short.isSaved;
        short.savesCount += short.isSaved ? 1 : -1;
      }
    },
    incrementViews: (state, action: PayloadAction<string>) => {
      const short = state.feed.find((s) => s._id === action.payload);
      if (short) {
        short.viewsCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchShortsFeed
      .addCase(fetchShortsFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShortsFeed.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.feed = action.payload.shorts;
        } else {
          // Append unique
          const newShorts = action.payload.shorts.filter(
            (ns: Short) => !state.feed.some((s) => s._id === ns._id)
          );
          state.feed.push(...newShorts);
        }
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page;
        state.feedType = action.payload.type;
        if (!state.activeShortId && state.feed.length > 0) {
          state.activeShortId = state.feed[0]._id;
        }
      })
      .addCase(fetchShortsFeed.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // searchShorts
      .addCase(searchShorts.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchShorts.fulfilled, (state, action: PayloadAction<Short[]>) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchShorts.rejected, (state) => {
        state.searchLoading = false;
      })
      // uploadShort
      .addCase(uploadShort.fulfilled, (state, action: PayloadAction<Short>) => {
        state.feed.unshift(action.payload);
        state.isUploadOpen = false;
      });
  },
});

export const {
  setFeedType,
  setActiveShortId,
  openUploadModal,
  closeUploadModal,
  optimisticLikeToggle,
  optimisticSaveToggle,
  incrementViews,
} = shortsSlice.actions;

export default shortsSlice.reducer;
