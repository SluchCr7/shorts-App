"use client";

import { Provider } from "react-redux";
import { store, useAppDispatch } from "./store";
import { useEffect } from "react";
import { initTheme } from "./slices/themeSlice";
import { useCheckAuthQuery } from "./api/authApi";

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  // Fetch & cache current user session using RTK Query
  useCheckAuthQuery();

  useEffect(() => {
    dispatch(initTheme());
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  );
}
