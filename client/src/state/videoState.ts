import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const serverUrlBase = import.meta.env.VITE_SERVER_URL;

type TVideoError = {status: number, message: string} | null;

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
        setVideoError: (state, action: PayloadAction<{status: number, message: string} | null>) => {
            state.error = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getNewVideo.fulfilled, (state, action: PayloadAction<{id: string, filename: string} | undefined>) => {
            if (!action.payload) {
                return;
            }
            state.id = action.payload.id;
            state.filename = action.payload.filename;
            state.error = null;
            toast.success("Video loaded successfully!",  {position: 'top-center'});
        }).addCase(getNewVideo.rejected, (state, action): void => {
            //const errorPayload = action.payload as {status: number, message: string};
            if ((action.payload as TVideoError)?.status !== undefined) {
                const err: TVideoError = action.payload as TVideoError;
                state.error = err;
                toast.error(err?.message || "An error occurred while loading the video.", {position: 'top-center'});
            }
            // console.log("reducer getNewVideo rejected", action.error);
            // state.error = {status: action.payload?.status, message: action.payload?.message};
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
                //setError(() => {return {status: res.status, message: message}})
                //throw {status: res.status, message: message};
                return thunkAPI.rejectWithValue({status: res.status, message: message});
                //toast.error(message);
            }

            const jsonData = await res.json();

            if (res.status === 210) {
                console.log("210 only Pending videos available");
                console.log(jsonData)
                //setError(() => {return {status: res.status, message: jsonData.message}});
                //throw new Error(jsonData.message);
                throw {status: res.status, message: jsonData.message};
            } else if (res.status === 214) {
                //const data = await res.json();
                console.log("214", jsonData);
                // setError(() => {return {status: res.status, message: jsonData.message}});
                // throw new Error(jsonData.message);
                //throw {status: res.status, message: jsonData.message};
                return thunkAPI.rejectWithValue({status: res.status, message: jsonData.message});
                //setVideoName(data.videoName);
            }
            else if (res.status === 200) {
                //const data = await res.json();
                console.log("ok", jsonData);
                //setVideoName(() => jsonData.filename);
                //setVideoID(() => jsonData._id);
                // dispatch(setVideoID(jsonData._id));
                // dispatch(setVideoFilename(jsonData.filename));
                //setError(null);
                //setVideoName(data.videoName);
                return {id: jsonData._id, filename: jsonData.filename};
            }
        } catch (error) {
            return thunkAPI.rejectWithValue({status: 500, message: "An error occurred while loading the video."});
        }
        
    }
);

// async function getVideo() {
//     toast.promise(

//           fetch(serverUrlBase + "/api/v1/video")
//                 .then(async (res) => {
//                   if (!res.ok) {
//                     const message = `An error has occured: ${res.status}`;
//                     setError(() => {return {status: res.status, message: message}})
//                     //toast.error(message);
//                   }
        
//                   const jsonData = await res.json();
//                   if (res.status === 210) {
//                     console.log("210 Pending videos only");
//                     console.log(jsonData)
//                     setError(() => {return {status: res.status, message: jsonData.message}});
//                     throw new Error(jsonData.message);
//                   } else if (res.status === 214) {
//                     //const data = await res.json();
//                     console.log("214", jsonData);
//                     setError(() => {return {status: res.status, message: jsonData.message}});
//                     throw new Error(jsonData.message);
//                     //setVideoName(data.videoName);
//                   }
//                   else if (res.status === 200) {
//                     //const data = await res.json();
//                     console.log("ok", jsonData);
//                     //setVideoName(() => jsonData.filename);
//                     //setVideoID(() => jsonData._id);
//                     dispatch(setVideoID(jsonData._id));
//                     dispatch(setVideoFilename(jsonData.filename));
//                     setError(null);
//                     //setVideoName(data.videoName);
//                   }
//                 })
//                 // .catch((err) => {
//                 //   console.error(err);
//                 // })
//           , {
//             loading: "Loading...",
//             success: "Video loaded successfully!",
//             error: "An error occurred while loading the video.",
//           }, {position: 'top-center',});
//   }

export const { setVideoID, setVideoFilename, setVideoError } = videoSlice.actions;

export default videoSlice.reducer;
