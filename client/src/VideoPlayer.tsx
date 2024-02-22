import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import toast, { Toaster } from "react-hot-toast";
import "./VideoPlayer.css";
import { get } from "react-hook-form";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "./state/store";
import { useDispatch } from "react-redux";
import { getNewVideo, setVideoFilename, setVideoID } from "./state/videoState";

type VideoPlayerProps = {
  videoName: string;
  setVideoName: React.Dispatch<React.SetStateAction<string>>;
  videoID?: string;
  setVideoID?: React.Dispatch<React.SetStateAction<string>>;
  changeVideo?: boolean;
  setChangeVideo?: React.Dispatch<React.SetStateAction<boolean>>;
};

const serverUrlBase = import.meta.env.VITE_SERVER_URL;



// Render a YouTube video player
export default function VideoPlayer() {

  const [error, setError] = useState<{status: number, message: string} | null>(null);

  const videoID = useSelector((state: RootState) => state.videoState.id);
  const videoFilename = useSelector((state: RootState) => state.videoState.filename);
  const dispatch = useDispatch<AppDispatch>();


  const inititalized = useRef(false);

  // async function getVideo() {
  //   toast.promise(

  //         fetch(serverUrlBase + "/api/v1/video")
  //               .then(async (res) => {
  //                 if (!res.ok) {
  //                   const message = `An error has occured: ${res.status}`;
  //                   setError(() => {return {status: res.status, message: message}})
  //                   //toast.error(message);
  //                 }
        
  //                 const jsonData = await res.json();
  //                 if (res.status === 210) {
  //                   console.log("210 Pending videos only");
  //                   console.log(jsonData)
  //                   setError(() => {return {status: res.status, message: jsonData.message}});
  //                   throw new Error(jsonData.message);
  //                 } else if (res.status === 214) {
  //                   //const data = await res.json();
  //                   console.log("214", jsonData);
  //                   setError(() => {return {status: res.status, message: jsonData.message}});
  //                   throw new Error(jsonData.message);
  //                   //setVideoName(data.videoName);
  //                 }
  //                 else if (res.status === 200) {
  //                   //const data = await res.json();
  //                   console.log("ok", jsonData);
  //                   //setVideoName(() => jsonData.filename);
  //                   //setVideoID(() => jsonData._id);
  //                   dispatch(setVideoID(jsonData._id));
  //                   dispatch(setVideoFilename(jsonData.filename));
  //                   setError(null);
  //                   //setVideoName(data.videoName);
  //                 }
  //               })
  //               // .catch((err) => {
  //               //   console.error(err);
  //               // })
  //         , {
  //           loading: "Loading...",
  //           success: "Video loaded successfully!",
  //           error: "An error occurred while loading the video.",
  //         }, {position: 'top-center',});
  // }

  useEffect(() => {
    if (!inititalized.current)
    {
      console.log("first run")
      // getVideo();
      dispatch(getNewVideo());
      inititalized.current = true;
      return;
    }
    // if (videoID === "reload") {
    //   console.log("reload")
    //   getVideo();
    // }
    
  }, []);


  return (
    <>
        {
          error !== null ? (
            <div className="player-wrapper player-wrapper-error">
              <p>{error.message}</p>
              {error.status === 210 && 
              <button onClick={() => {
                //getVideo();
                dispatch(getNewVideo());
              }}>Retry</button> }
            </div>
          ) : (
            <div className="player-wrapper">
            <ReactPlayer
              className="react-player"
              url={videoFilename !== "" ? serverUrlBase + "/videos/" + videoFilename : ""}
              //url={"http://localhost:3000/videos/Cov_combatting_Image1.mp4"}
              // url={"src/assets/clip.mp4"}
              controls={true}
              loop={true}
              width="100%"
              height="100%"
            />
          </div>

          )
        }
    </>
  );
}


