"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { toggleTheme } from "../../redux/slices/themeSlice";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2.5 rounded-full transition-all duration-200 hover:scale-105 bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm cursor-pointer"
      title={`Switch to ${mode === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle theme"
    >
      {mode === "dark" ? (
        <FiSun className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <FiMoon className="w-5 h-5 text-indigo-600 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
