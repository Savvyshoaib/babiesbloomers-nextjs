import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  id: string;
  email: string;
};

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

type AuthState = {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
};

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: false,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    setProfile(state, action: PayloadAction<UserProfile | null>) {
      state.profile = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.profile = null;
      state.loading = false;
    },
  },
});

export const { setUser, setProfile, setLoading, setInitialized, clearAuth } =
  authSlice.actions;

export default authSlice.reducer;
