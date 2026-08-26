import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Sound } from "../../types";

interface UiState {
  feedType: "for-you" | "following";
  activeShortId: string | null;
  isUploadOpen: boolean;
  preselectedSound: Sound | null;
  isCommentsOpen: boolean;
  commentsShortId: string | null;
  isAuthModalOpen: boolean;
  authModalAction: string;
  isSidebarOpen: boolean;
}

const initialState: UiState = {
  feedType: "for-you",
  activeShortId: null,
  isUploadOpen: false,
  preselectedSound: null,
  isCommentsOpen: false,
  commentsShortId: null,
  isAuthModalOpen: false,
  authModalAction: "interact with shorts",
  isSidebarOpen: false,
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
    openUploadModalWithSound: (state, action: PayloadAction<Sound>) => {
      state.isUploadOpen = true;
      state.preselectedSound = action.payload;
    },
    closeUploadModal: (state) => {
      state.isUploadOpen = false;
      state.preselectedSound = null;
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
    openSidebar: (state) => {
      state.isSidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
  },
});

export const {
  setFeedType,
  setActiveShortId,
  openUploadModal,
  openUploadModalWithSound,
  closeUploadModal,
  openCommentsDrawer,
  closeCommentsDrawer,
  openAuthModal,
  closeAuthModal,
  openSidebar,
  closeSidebar,
  toggleSidebar,
} = uiSlice.actions;

export default uiSlice.reducer;
