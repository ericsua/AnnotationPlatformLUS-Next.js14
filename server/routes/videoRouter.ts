import express, { Express, Request, Response, Router } from "express";
import Video from "../models/video";
import Annotation from "../models/annotation";
import mongoose, { Model } from "mongoose";
import { timeouts } from "../index";

const videoRouter: Router = express.Router();

async function handleSave(doc: mongoose.Document, res: Response) {
    try {
        await doc.save();
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            console.error(`[server]: [post] Error saving annotation, bad request, annotation is not valid: ${err}`);
            res.status(400).json({ message: "Error saving annotation, not valid" });
            return false;
        }
        if (err instanceof mongoose.Error.CastError) {
            console.error(`[server]: [post] Error saving annotation, bad request, video id is not valid: ${err}`);
            res.status(400).json({ message: "Error saving annotation, " });
            return false;
        }
        if (err instanceof mongoose.Error) {
            console.error(`[server]: [post] Error saving annotation: ${err}`);
            res.status(400).json({ message: "Error saving annotation" });
            return false;
        }
        console.error("[server]: [post] Internal error saving annotation: ", err);
        res.status(500).json({ message: "Internal error while saving annotation" });
        return false;
    }
    return true;
}

videoRouter.get("/", async (req: Request, res: Response) => {
    const videos = await Video.find({ status: "available" });
    //console.log(videos);
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    //console.log("random", randomVideo);
    randomVideo.status = "pending";
    //await randomVideo.save();
    if (!handleSave(randomVideo, res)) {
        return;
    }
    const refTimeout = setTimeout(async () => {
        const randomVideoToUpdate = await Video.findById(randomVideo._id).exec();
        if (randomVideoToUpdate === null) {
            console.error(`[server]: [timeout] Video not found in timeout function (id: ${randomVideo._id})`);
            return;
        }
        const oldStatus = randomVideoToUpdate.status;
        if (randomVideoToUpdate.status === "pending") {
            randomVideoToUpdate.status = "available";
            await randomVideoToUpdate.save();
            console.info(`[server]: [timeout] Video status updated from ${oldStatus} to available (id: ${randomVideoToUpdate._id})`);
        } else if (randomVideoToUpdate.status === "annotated") {
            console.info(`[server]: [timeout] Video status is already annotated (id: ${randomVideoToUpdate._id}), timeout function not executed`);
        } else if (randomVideoToUpdate.status === "available") {
            console.error(`[server]: [timeout] Video status is already available (id: ${randomVideoToUpdate._id}), timeout function not executed`);
        }
    }, 20000);//*60);
    timeouts.push(refTimeout);
    console.info(`[server]: [get] Random video id: ${randomVideo._id}, status: ${randomVideo.status}`);
    res.json(randomVideo);
});

videoRouter.put("/:id", async (req: Request, res: Response) => {
    const video = await Video.findById(req.params.id);
    if (video && video.status === "available") {
        video.status = "pending";
        //await video.save();
        if (!handleSave(video, res)) {
            return;
        }
        console.info(`[server]: [put] Video status updated to pending (id: ${video._id})`);
        res.status(200).json({ message: "Video status updated to pending" });
        //res.json(video);
    } else {
        if (video && video.status === "pending") {
            console.error(`[server]: [put] Video already pending (id: ${video._id})`);
            res.status(400).json({ message: "Video already pending" });
        } else if (video && video.status === "annotated") {
            console.error(`[server]: [put] Video already annotated (id: ${video._id})`);
            res.status(400).json({ message: "Video already annotated" });
        }
        console.error(`[server]: [put] Video not found (id: ${req.params.id})`);
        res.status(404).json({ message: "Video not found" });
    }
});

videoRouter.post("/:id", async (req: Request, res: Response) => {
    const video = await Video.findById(req.params.id);
    if (video && (video.status === "pending" || video.status === "available" || video.status === "annotated")) {
        video.status = "annotated";
        try {

            await video.save();
        }
        catch (err) {
            console.error(`[server]: [post] Error saving video status to annotated: ${err}`);
            res.status(400).json({ message: "Error saving video status to annotated" });
            return;
        }
        //res.status(200).json({ message: "Video status updated to annotated" });
        //res.json(video);
        const reqAnotations = req.body.annotations;
        const annotation = new Annotation({
            videoId: req.params.id,
            annotations: reqAnotations,
        });
        if (!handleSave(annotation, res)) {
            return;
        }
            // console.error(`[server]: [post] Error saving annotation: ${err}`);
            // res.status(400).json({ message: "Error saving annotation" });

    } else {
        // if (video && video.status === "available") {
        //     res.status(400).json({ message: "Video not pending" });
        // } else if (video && video.status === "annotated") {
        //     res.status(400).json({ message: "Video already annotated" });
        // }
        console.error(`[server]: [post] Video not found (id: ${req.params.id})`);
        res.status(404).json({ message: "Video not found" });
    }
});

export default videoRouter;
