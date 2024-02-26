import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface DarkModeState {
    value: boolean;
}

const initialState: DarkModeState = {
    value: true
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
