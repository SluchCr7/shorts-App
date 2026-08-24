import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Comment } from "../../types";
import { apiFetch } from "../api/apiConfig";

interface CommentsState {
  comments: Comment[];
  isOpen: boolean;
  activeShortId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  comments: [],
  isOpen: false,
  activeShortId: null,
  loading: false,
  error: null,
};

export const fetchShortComments = createAsyncThunk(
  "comments/fetch",
  async (shortId: string, { rejectWithValue }) => {
    try {
      const res = await apiFetch(`/shorts/${shortId}/comments`);
      return { shortId, comments: res.data.comments };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const postComment = createAsyncThunk(
  "comments/post",
  async (
    { shortId, content, parentCommentId }: { shortId: string; content: string; parentCommentId?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiFetch(`/shorts/${shortId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, parentCommentId }),
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/delete",
  async (commentId: string, { rejectWithValue }) => {
    try {
      await apiFetch(`/comments/${commentId}`, { method: "DELETE" });
      return commentId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    openCommentsDrawer: (state, action: PayloadAction<string>) => {
      state.isOpen = true;
      state.activeShortId = action.payload;
    },
    closeCommentsDrawer: (state) => {
      state.isOpen = false;
      state.activeShortId = null;
      state.comments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShortComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShortComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.comments;
      })
      .addCase(fetchShortComments.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(postComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        state.comments.unshift(action.payload);
      })
      .addCase(deleteComment.fulfilled, (state, action: PayloadAction<string>) => {
        state.comments = state.comments.filter((c) => c._id !== action.payload);
      });
  },
});

export const { openCommentsDrawer, closeCommentsDrawer } = commentsSlice.actions;
export default commentsSlice.reducer;
