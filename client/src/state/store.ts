import { configureStore } from "@reduxjs/toolkit";
import videoReducer from "./videoState";

export const store = configureStore({
    reducer: {
        videoState: videoReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
