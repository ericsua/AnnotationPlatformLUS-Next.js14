import React, { useEffect, useState } from "react";
import "./App.css";
import Form from "./Form";
import VideoPlayer from "./VideoPlayer";


function App() {
  
  const [videoID, setVideoID] = useState("")
  const [videoName, setVideoName] = useState("");
  const [changeVideo, setChangeVideo] = useState(false);

  useEffect(() => {
    window.onbeforeunload = () => true;
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  return (
    <>
      <VideoPlayer videoName={videoName} videoID={videoID} setVideoID={setVideoID} setVideoName={setVideoName}/>
      <Form videoID={videoID} setVideoID={setVideoID} />
    </>
  );
}

export default App;
