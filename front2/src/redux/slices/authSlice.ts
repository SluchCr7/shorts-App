import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";
import { apiFetch } from "../api/apiConfig";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Check if user is authenticated (using HTTP-only cookie)
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const res = await apiFetch("/auth/me");
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Login Thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { emailOrUsername: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      return res.data.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Register Thunk
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: { username: string; email: string; password: string; fullName: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      return res.data.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Logout Thunk
export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
    return null;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Update Account Profile Thunk
export const updateAccountProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data: { fullName?: string; bio?: string; website?: string }, { rejectWithValue }) => {
    try {
      const res = await apiFetch("/users/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // updateAccountProfile
      .addCase(updateAccountProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
