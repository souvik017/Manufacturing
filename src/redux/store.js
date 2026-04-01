import { configureStore } from "@reduxjs/toolkit";
import ordersReducer from "./Slices/orderSlice";     
import authReducer from "./slices/authSlice";         // ✅ ensure this file exists

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    auth: authReducer,
  },
});