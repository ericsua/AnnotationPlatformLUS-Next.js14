"use client";
import { fetchGetNewVideo } from "@/actions/videos";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type TVideoError = { status: number; message: string } | null;

export interface VideoState {
    id: string;
    filename: string;
    error: TVideoError;
    status: "idle" | "pending" | "fulfilled" | "rejected";
}

const initialState: VideoState = {
    id: "",
    filename: "",
    error: null,
    status: "idle",
};

export const videoSlice = createSlice({
    name: "videoState",
    initialState,
    // reducers are functions that take the current state and an action, and handle the action by returning a new state (in a pure way, without mutating the state)
    reducers: {
        setVideoID: (state, action: PayloadAction<string>) => {
            state.id = action.payload;
        },
        setVideoFilename: (state, action: PayloadAction<string>) => {
            state.filename = action.payload;
        },
        setVideoError: (
            state,
            action: PayloadAction<{ status: number; message: string } | null>
        ) => {
            state.error = action.payload;
        },
        resetVideoStatus(state) {
            state.status = "idle";
        },
    },
    // needed to handle async actions with createAsyncThunk (like get some data from an API)
    extraReducers: (builder) => {
        // builder is a callback that adds cases to a reducer
        builder
            .addCase(
                // if the promise is fulfilled, the state is updated with the payload
                // i.e. set the new id and filename of the video in the state
                getNewVideo.fulfilled,
                (
                    state,
                    action: PayloadAction<
                        { id: string; filename: string } | undefined
                    >
                ) => {
                    state.status = "fulfilled";
                    //document.body.classList.remove("overflow-hidden");
                    //document.getElementById("blocker")?.classList.add("hidden");
                    if (!action.payload) {
                        return;
                    }
                    state.id = action.payload.id;
                    state.filename = action.payload.filename;
                    state.error = null;
                    // toast.success("Video loaded successfully!", {
                    //     position: "top-center",
                    // });
                }
            )
            .addCase(getNewVideo.rejected, (state, action): void => {
                // if the promise is rejected, set the error in the state (it will be displayed in the UI as a toast message)
                state.status = "rejected";
                // console.log("getNewVideo.rejected", action);
                // document.body.classList.remove("overflow-hidden");
                // document.getElementById("blocker")?.classList.add("hidden");
                state.id = "";
                state.filename = "";
                if ((action.payload as TVideoError)?.status !== undefined) {
                    const err: TVideoError = action.payload as TVideoError;
                    state.error = err;
                    // toast.error(
                    //     err?.message ||
                    //         "An error occurred while loading the video.",
                    //     { position: "top-center" }
                    // );
                }
            })
            .addCase(getNewVideo.pending, (state, action) => {
                // while the promise is pending, set the status in the state (it will be displayed in the UI as a spinner in 
                // a toast message)
                state.status = "pending";
                // console.log("getNewVideo.pending", action);
                // window.scrollTo({ top: 0, behavior: "smooth" });
                // document.body.classList.add("overflow-hidden");
                // document.getElementById("blocker")?.classList.remove("hidden");
            });
        // .addDefaultCase((state, action) => {
        //     console.log("default case", action);
        //     document.body.classList.remove("overflow-hidden");
        //     document.getElementById("blocker")?.classList.add("hidden");
        // });
    },
});

export const getNewVideo = createAsyncThunk(
    "videoState/getNewVideo",
    async (_, thunkAPI) => {
        try {
            // fetch the new video from the server
            const { jsonData, status, errorFetch } = await fetchGetNewVideo();
            if (errorFetch != "") {
                const message = `An error has occured: ${status}`;
                return thunkAPI.rejectWithValue({
                    status: status,
                    message: message,
                });
            }
            //console.log("prova")
            //const jsonData = await res.json();
            //console.log("prova2")

            // status 210 means that there are only pending videos available, meaning that there are no videos to annotate at the moment,
            //      but some users could not finish the annotation and after some amount of time those videos will be available again
            // status 214 means that all videos are already annotated
            // status 200 means that the video is available to be annotated
            if (status === 210) {
                // console.log("210 only Pending videos available");
                // console.log(jsonData);

                // rejectWithValue is a function that allows to reject the promise with a specific value
                return thunkAPI.rejectWithValue({
                    status: status,
                    message: jsonData.message,
                });
            } else if (status === 214) {
                console.log("214", jsonData);
                return thunkAPI.rejectWithValue({
                    status: status,
                    message: jsonData.message,
                });
                //setVideoName(data.videoName);
            } else if (status === 200) {
                // console.log("ok", jsonData);

                // artificial delay to show the spinner for a while
                await new Promise((resolve) => setTimeout(resolve, 500));
                const pSpinner = document.getElementById("p-spinner");
                if (pSpinner) {
                    pSpinner.innerText = "Loading next video...";
                }
                await new Promise((resolve) => setTimeout(resolve, 500));
                return { id: jsonData._id, filename: jsonData.filename };
            }
        } catch (error) {
            // console.log("error catched", error);

            return thunkAPI.rejectWithValue({
                status: 500,
                message: "An error occurred while loading the video.",
            });
        }
    }
);

export const { setVideoID, setVideoFilename, setVideoError, resetVideoStatus } =
    videoSlice.actions;

export default videoSlice.reducer;
