// src/redux/store.ts

import { configureStore } from "@reduxjs/toolkit";
import storeReducer from "./slices/storeSlice";

export const store = configureStore({
  reducer: {
    store: storeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
