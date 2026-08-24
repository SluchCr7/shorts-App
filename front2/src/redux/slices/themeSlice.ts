import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
  mode: "dark" | "light";
}

const getInitialTheme = (): "dark" | "light" => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
};

const initialState: ThemeState = {
  mode: "dark",
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<"dark" | "light">) => {
      state.mode = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
        if (action.payload === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    toggleTheme: (state) => {
      const nextMode = state.mode === "dark" ? "light" : "dark";
      state.mode = nextMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", nextMode);
        if (nextMode === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    initTheme: (state) => {
      const mode = getInitialTheme();
      state.mode = mode;
      if (typeof window !== "undefined") {
        if (mode === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
  },
});

export const { setThemeMode, toggleTheme, initTheme } = themeSlice.actions;
export default themeSlice.reducer;
