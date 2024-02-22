import React, { useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import "./VideoPlayer.css";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "./state/store";
import { useDispatch } from "react-redux";
import { getNewVideo } from "./state/videoState";


const serverUrlBase = import.meta.env.VITE_SERVER_URL;



// Render a YouTube video player
export default function VideoPlayer() {

  //const [error, setError] = useState<{status: number, message: string} | null>(null);

  const videoID = useSelector((state: RootState) => state.videoState.id);
  const videoFilename = useSelector((state: RootState) => state.videoState.filename);
  const error = useSelector((state: RootState) => state.videoState.error)
  const dispatch = useDispatch<AppDispatch>();


  const inititalized = useRef(false);

  useEffect(() => {
    if (!inititalized.current)
    {
      console.log("first run");
      dispatch(getNewVideo());
      inititalized.current = true;
      return;
    }
    
  }, []);


  return (
    <>
        {
          error !== null ? (
            <div className="player-wrapper player-wrapper-error">
              <p>{error.message}</p>
              {error.status === 210 && 
              <button className="btn" onClick={() => {
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


