import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  member: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.token = action.payload.token;
      state.member = action.payload.member;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.token = null;
      state.member = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;