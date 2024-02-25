import { configureStore } from "@reduxjs/toolkit";
import videoReducer from "./videoState";
import darkModeReducer from "./darkMode";

export const store = configureStore({
    reducer: {
        videoState: videoReducer,
        darkMode: darkModeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
