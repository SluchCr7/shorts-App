import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  feedType: "for-you" | "following";
  activeShortId: string | null;
  isUploadOpen: boolean;
  isCommentsOpen: boolean;
  commentsShortId: string | null;
  isAuthModalOpen: boolean;
  authModalAction: string;
}

const initialState: UiState = {
  feedType: "for-you",
  activeShortId: null,
  isUploadOpen: false,
  isCommentsOpen: false,
  commentsShortId: null,
  isAuthModalOpen: false,
  authModalAction: "interact with shorts",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setFeedType: (state, action: PayloadAction<"for-you" | "following">) => {
      state.feedType = action.payload;
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
    openCommentsDrawer: (state, action: PayloadAction<string>) => {
      state.isCommentsOpen = true;
      state.commentsShortId = action.payload;
    },
    closeCommentsDrawer: (state) => {
      state.isCommentsOpen = false;
      state.commentsShortId = null;
    },
    openAuthModal: (state, action: PayloadAction<string | undefined>) => {
      state.isAuthModalOpen = true;
      state.authModalAction = action.payload || "interact with shorts";
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.authModalAction = "interact with shorts";
    },
  },
});

export const {
  setFeedType,
  setActiveShortId,
  openUploadModal,
  closeUploadModal,
  openCommentsDrawer,
  closeCommentsDrawer,
  openAuthModal,
  closeAuthModal,
} = uiSlice.actions;

export default uiSlice.reducer;
