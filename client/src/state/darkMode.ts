import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface DarkModeState {
    value: boolean;
}

const initialState: DarkModeState = {
    value: window.localStorage.getItem("darkMode")?.toString() === "true",
};

export const darkModeSlice = createSlice({
    name: "darkMode",
    initialState,
    reducers: {
        setDarkMode: (state, action: PayloadAction<boolean>) => {
            state.value = action.payload;
        },
    },
});

export const { setDarkMode } = darkModeSlice.actions;

export default darkModeSlice.reducer;
