// "use client"
// import { PayloadAction, createSlice } from "@reduxjs/toolkit";

// console.log("first render darkMode.ts");
// export interface DarkModeState {
//     value: boolean;
// }

// function getInitialDarkMode() {
//     if (typeof window !== "undefined") {
//         const darkModeLocalStorage = window.localStorage.getItem("darkMode");
//         if (darkModeLocalStorage !== null) {
//             console.log("found darkMode in localStorage", darkModeLocalStorage.toString() === "true")
//             return {value: darkModeLocalStorage.toString() === "true"}
//         }
//         const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
//         console.log("found darkMode in matchMedia", darkMode.matches)
//         return { value: darkMode.matches }
//     }
//     console.log("no window object: false")
//     return {value: false}
// }

// const initialState: DarkModeState = {
//     value: false//typeof window === "undefined" || window.localStorage.getItem("darkMode")?.toString() === "true"//getInitialDarkMode()
// };

// export const darkModeSlice = createSlice({
//     name: "darkMode",
//     // initialState: getInitialDarkMode(),
//     initialState,
//     reducers: {
//         setDarkMode: (state, action: PayloadAction<boolean>) => {
//             state.value = action.payload;
//         },
//     },
// });

// export const { setDarkMode } = darkModeSlice.actions;

// export default darkModeSlice.reducer;


// export const darkModeSliceDynamic = (initialState: DarkModeState) => createSlice(
//     {
//         name: "darkMode",
//         initialState: initialState,
//         reducers: {
//             setDarkMode: (state, action: PayloadAction<boolean>) => {
//                 state.value = action.payload;
//             },
//         },
//     }
// )

