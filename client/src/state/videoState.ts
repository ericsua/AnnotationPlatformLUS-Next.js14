import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const serverUrlBase = import.meta.env.VITE_SERVER_URL;

type TVideoError = { status: number; message: string } | null;

interface VideoState {
    id: string;
    filename: string;
    error: TVideoError;
}

const initialState: VideoState = {
    id: "",
    filename: "",
    error: null,
};

export const videoSlice = createSlice({
    name: "videoState",
    initialState,
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
    },
    extraReducers: (builder) => {
        builder
            .addCase(
                getNewVideo.fulfilled,
                (
                    state,
                    action: PayloadAction<
                        { id: string; filename: string } | undefined
                    >
                ) => {
                    document.body.classList.remove("overflow-hidden");
                    document.getElementById("blocker")?.classList.add("hidden");
                    if (!action.payload) {
                        return;
                    }
                    state.id = action.payload.id;
                    state.filename = action.payload.filename;
                    state.error = null;
                    toast.success("Video loaded successfully!", {
                        position: "top-center",
                    });
                }
            )
            .addCase(getNewVideo.rejected, (state, action): void => {
                console.log("getNewVideo.rejected", action);
                document.body.classList.remove("overflow-hidden");
                document.getElementById("blocker")?.classList.add("hidden");
                state.id = "";
                state.filename = "";
                if ((action.payload as TVideoError)?.status !== undefined) {
                    const err: TVideoError = action.payload as TVideoError;
                    state.error = err;
                    toast.error(
                        err?.message ||
                            "An error occurred while loading the video.",
                        { position: "top-center" }
                    );
                }
            })
            .addCase(getNewVideo.pending, (state, action) => {
                console.log("getNewVideo.pending", action);
                window.scrollTo({ top: 0, behavior: "smooth" });
                document.body.classList.add("overflow-hidden");
                document.getElementById("blocker")?.classList.remove("hidden");
            })
            .addDefaultCase((state, action) => {
                console.log("default case", action);
                document.body.classList.remove("overflow-hidden");
                document.getElementById("blocker")?.classList.add("hidden");
            });
    },
});

export const getNewVideo = createAsyncThunk(
    "videoState/getNewVideo",
    async (_, thunkAPI) => {
        try {
            const res = await fetch(serverUrlBase + "/api/v1/video");
            if (!res.ok) {
                const message = `An error has occured: ${res.status}`;
                return thunkAPI.rejectWithValue({
                    status: res.status,
                    message: message,
                });
            }
            //console.log("prova")
            const jsonData = await res.json();
            //console.log("prova2")
            if (res.status === 210) {
                console.log("210 only Pending videos available");
                console.log(jsonData);
                return thunkAPI.rejectWithValue({
                    status: res.status,
                    message: jsonData.message,
                });
            } else if (res.status === 214) {
                console.log("214", jsonData);
                return thunkAPI.rejectWithValue({
                    status: res.status,
                    message: jsonData.message,
                });
                //setVideoName(data.videoName);
            } else if (res.status === 200) {
                console.log("ok", jsonData);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const pSpinner = document.getElementById("p-spinner");
                if (pSpinner) {
                    pSpinner.innerText = "Loading next video...";
                }
                await new Promise((resolve) => setTimeout(resolve, 5000));
                return { id: jsonData._id, filename: jsonData.filename };
            }
        } catch (error) {
            console.log("error catched", error);

            return thunkAPI.rejectWithValue({
                status: 500,
                message: "An error occurred while loading the video.",
            });
        }
        
    }
);

export const { setVideoID, setVideoFilename, setVideoError } =
    videoSlice.actions;

export default videoSlice.reducer;
