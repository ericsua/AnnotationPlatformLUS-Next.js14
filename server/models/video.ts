import { Schema, model } from "mongoose";

// Schema for videos
const videoSchema = new Schema({
    title: String,
    description: String,
    filename: String,
    extension: String,
    status: {
        type: String,
        enum: ["available", "pending", "annotated"],
        default: "available",
    },
});

// create model
const Video = model("Videos", videoSchema);

export default Video;