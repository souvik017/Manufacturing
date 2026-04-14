// features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Helper to load initial state from localStorage
const loadInitialState = () => {
  try {
    const token = localStorage.getItem("authToken");
    const member = localStorage.getItem("authMember");
    if (token && member) {
      return {
        token,
        member: JSON.parse(member),
        isAuthenticated: true,
      };
    }
  } catch (e) {
    console.error("Failed to load auth from localStorage", e);
  }
  return {
    token: null,
    member: null,
    isAuthenticated: false,
  };
};

const initialState = loadInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, member } = action.payload;
      state.token = token;
      state.member = member;
      state.isAuthenticated = true;

      // Persist to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("authMember", JSON.stringify(member));
    },

    logout: (state) => {
      state.token = null;
      state.member = null;
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("authMember");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;