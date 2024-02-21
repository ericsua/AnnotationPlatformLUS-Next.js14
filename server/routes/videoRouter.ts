import express, {
    Express,
    NextFunction,
    Request,
    Response,
    Router,
} from "express";
import Video from "../models/video";
import Annotation from "../models/annotation";
import mongoose, { Model } from "mongoose";
import { timeouts } from "../index";
import logger from "../logger";
import crypto from "crypto";

const videoRouter: Router = express.Router();

async function handleSave(
    doc: mongoose.Document,
    res: Response,
    method: string,
    whatIsBeingSaved: string
) {
    try {
        await doc.save();
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            //console.error(`[server]: [post] Error saving annotation, bad request, annotation is not valid: ${err}`);
            logger.error(
                `[${method}] Error while saving ${whatIsBeingSaved}, bad request, input not valid: ${err}`
            );
            //res.status(400).json({ message: `Error while saving ${whatIsBeingSaved}, bad request, input not valid` });
            return {
                errorStatus: 400,
                message: `Error while saving ${whatIsBeingSaved}, bad request, input not valid`,
            };
        }
        if (err instanceof mongoose.Error.CastError) {
            //console.error(`[server]: [post] Error while saving, bad request, video id is not valid: ${err}`);
            logger.error(
                `[${method}] Error while saving ${whatIsBeingSaved}, bad request, cast error: ${err}`
            );
            //res.status(400).json({ message: `Error while saving ${whatIsBeingSaved},  bad request, cast error` });
            return {
                errorStatus: 400,
                message: `Error while saving ${whatIsBeingSaved},  bad request, cast error`,
            };
        }
        if (err instanceof mongoose.Error) {
            //console.error(`[server]: [post] Error while saving: ${err}`);
            logger.error(
                `[${method}] Error while saving ${whatIsBeingSaved}: ${err}, bad request`
            );
            //res.status(400).json({ message: `Error while saving ${whatIsBeingSaved}, bad request` });
            return {
                errorStatus: 400,
                message: `Error while saving ${whatIsBeingSaved}, bad request`,
            };
        }
        //console.error("[server]: [post] Internal error while saving: ", err);
        logger.error(
            `[${method}] Internal error while saving ${whatIsBeingSaved}`,
            err
        );
        //res.status(500).json({ message: `Internal error while saving ${whatIsBeingSaved}` });
        return {
            errorStatus: 500,
            message: `Internal error while saving ${whatIsBeingSaved}`,
        };
    }
    return { errorStatus: 0, message: "" };
}

async function handleNoAvailableVideos(session: mongoose.mongo.ClientSession, res: Response): Promise<void> {
    const pendingVideos = await Video.countDocuments({ status: "pending" }).session(session).exec(); // Count within transaction
    logger.info(`[GET] Number of pending videos: ${pendingVideos}`);

    if (pendingVideos === 0) {
        logger.info("[GET] All videos are annotated, no available videos to send!");
        res.status(204).json({ message: "All videos are currently annotated." });
    } else {
        logger.info(`[GET] ${pendingVideos} videos are pending, no available videos now.`);
        res.status(210).json({ message: "No available videos for now, come back later." });
    }
}

videoRouter.get("/", async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();
        // Use atomic `findOneAndUpdate` for video selection:
        // const randomVideo = await Video.findOneAndUpdate(
        //     { status: "available" },
        //     { $set: { status: "pending" } },
        //     { session, new: true, useFindAndModify: false, runValidators: true }, // Return updated document
        // ).exec()
        const videos = await Video.find({ status: "available" }).session(session).exec();
        if (videos.length === 0) {
            logger.info("[GET] All videos are pending or annotated, no available videos to send!");
            await handleNoAvailableVideos(session, res);
            return;
        }

        const randomVideo = videos[Math.floor(Math.random() * videos.length)];

        randomVideo.status = "pending";
        const { errorStatus: errorStatusPending, message: messagePending } = await handleSave(randomVideo, res, "GET", "random video to pending");
        if (errorStatusPending !== 0) {
            res.status(errorStatusPending).json({ messagePending });
            return;
        }

        // if (!randomVideo) {
        //     // No available videos, handle gracefully:
        //     logger.info("[GET] All videos are pending or annotated, no available videos to send!");
        //     await handleNoAvailableVideos(session, res);
        //     return;
        // }

        //await randomVideo.save(); // Save updated status

        const callbackTimeout = async (id?: string) => {
            const updatedVideo = await Video.findByIdAndUpdate(
                randomVideo._id,
                { $set: { status: "available" } },
                { new: false } // Return updated document
            );

            if (!updatedVideo) {
                console.error(
                    `[server]: [timeout] Video not found in timeout function (id: ${randomVideo._id})`
                );
                return;
            }

            if (updatedVideo.status === "pending") {
                // Video hasn't been annotated yet, update status:
                logger.info(
                    `[timeout] Video status updated from pending to available (id: ${updatedVideo._id})`
                );
            } else if (updatedVideo.status === "annotated") {
                // Video has been annotated, no need to update:
                logger.info(
                    `[timeout] Video status is already annotated (id: ${updatedVideo._id}), timeout function not executed`
                );
            } else {
                // Should not happen due to atomicity, log for investigation:
                console.error(
                    `[server]: [timeout] Unexpected video status: ${updatedVideo.status} (id: ${updatedVideo._id})`
                );
            }

            if (id) {
                timeouts.splice(timeouts.findIndex((timeout) => timeout.id === id), 1);
            }
        };

        const randomID = crypto.randomUUID();
        const refTimeout = setTimeout(callbackTimeout, 20000, randomID); //*60);
        timeouts.push({ a: refTimeout, b: callbackTimeout, id: randomID });

        logger.info(
            `[get] Random video id: ${randomVideo._id}, status: ${randomVideo.status}`
        );
        await session.commitTransaction();
        res.status(200).json(randomVideo);
    } catch (err) {
        await session.abortTransaction();
        console.error(err); // Log errors for debugging
        res.status(500).json({ message: "Internal server error" }); // Handle unexpected errors gracefully
    } finally {
        await session.endSession();
    }
});
// videoRouter.get("/", async (req: Request, res: Response) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         const videos = await Video.find({ session, status: "available" });
//         if (videos.length === 0) {
//             //console.error("[server]: [get] No available videos");
//             logger.info(
//                 "[GET] All videos are pending or annotated, no available videos to send!"
//             );
//             const videosPending = await Video.find({ status: "pending" });
//             if (videosPending.length === 0) {
//                 logger.info(`   No pending videos available`);
//                 res.status(214).json({
//                     message:
//                         "No available videos, every video has been annotated!",
//                 });
//             }
//             logger.info(`   Pending videos available: ${videosPending.length}`);
//             res.status(210).json({
//                 message: "No available videos for now, come back later",
//             });
//             return;
//         }
//         //console.log(videos);
//         const randomVideo = videos[Math.floor(Math.random() * videos.length)];
//         //console.log("random", randomVideo);
//         randomVideo.status = "pending";
//         //await randomVideo.save();
//         if (!handleSave(randomVideo, res, "GET", "random video")) {
//             return;
//         }
//         const callbackTimeout = async (id?: string) => {
//             const randomVideoToUpdate = await Video.findById(
//                 randomVideo._id
//             ).exec();
//             if (randomVideoToUpdate === null) {
//                 console.error(
//                     `[server]: [timeout] Video not found in timeout function (id: ${randomVideo._id})`
//                 );
//                 return;
//             }
//             const oldStatus = randomVideoToUpdate.status;
//             if (randomVideoToUpdate.status === "pending") {
//                 randomVideoToUpdate.status = "available";
//                 await randomVideoToUpdate.save();
//                 //console.info(`[server]: [timeout] Video status updated from ${oldStatus} to available (id: ${randomVideoToUpdate._id})`);
//                 logger.info(
//                     `[timeout] Video status updated from ${oldStatus} to available (id: ${randomVideoToUpdate._id})`
//                 );
//             } else if (randomVideoToUpdate.status === "annotated") {
//                 //console.info(`[server]: [timeout] Video status is already annotated (id: ${randomVideoToUpdate._id}), timeout function not executed`);
//                 logger.info(
//                     `[timeout] Video status is already annotated (id: ${randomVideoToUpdate._id}), timeout function not executed`
//                 );
//             } else if (randomVideoToUpdate.status === "available") {
//                 //console.error(`[server]: [timeout] Video status is already available (id: ${randomVideoToUpdate._id}), timeout function not executed`);
//                 logger.error(
//                     `[timeout] Video status is already available (id: ${randomVideoToUpdate._id}), timeout function not executed`
//                 );
//             }
//             if (id) {
//                 timeouts.splice(
//                     timeouts.findIndex((timeout) => timeout.id === id),
//                     1
//                 );
//             }
//         };
//         const randomID = crypto.randomUUID();
//         const refTimeout = setTimeout(callbackTimeout, 20000, randomID); //*60);
//         timeouts.push({ a: refTimeout, b: callbackTimeout, id: randomID });
//         //console.info(`[server]: [get] Random video id: ${randomVideo._id}, status: ${randomVideo.status}`);
//         logger.info(
//             `[get] Random video id: ${randomVideo._id}, status: ${randomVideo.status}`
//         );
//         res.json(randomVideo);
//     } catch (err) {
//         console.error(err); // Log errors for debugging
//         res.status(500).json({ message: 'Internal server error' }); // Handle unexpected errors gracefully
//     } finally {
//         session.endSession();
//     }
// });

videoRouter.put("/:id", async (req: Request, res: Response) => {
    const video = await Video.findById(req.params.id);
    if (video && video.status === "available") {
        video.status = "pending";
        //await video.save();
        if (!(await handleSave(video, res, "PUT", "video"))) {
            return;
        }
        //console.info(`[server]: [put] Video status updated to pending (id: ${video._id})`);
        logger.info(`[put] Video status updated to pending (id: ${video._id})`);
        res.status(200).json({ message: "Video status updated to pending" });
        //res.json(video);
    } else {
        if (video && video.status === "pending") {
            //console.error(`[server]: [put] Video already pending (id: ${video._id})`);
            logger.error(`[PUT] Video already pending (id: ${video._id})`);
            res.status(400).json({ message: "Video already pending" });
        } else if (video && video.status === "annotated") {
            //console.error(`[server]: [PUT] Video already annotated (id: ${video._id})`);
            logger.error(`[PUT] Video already annotated (id: ${video._id})`);
            res.status(400).json({ message: "Video already annotated" });
        }
        //console.error(`[server]: [PUT] Video not found (id: ${req.params.id})`);
        logger.error(`[PUT] Video not found (id: ${req.params.id})`);
        res.status(404).json({ message: "Video not found" });
    }
});

videoRouter.post(
    "/:id",
    async (req: Request, res: Response, next: NextFunction) => {
        let video;
        try {
            video = await Video.findById(req.params.id).exec();
        } catch (err) {
            logger.error(`[POST] Error finding video: ${err}`);
            res.status(400).json({ message: "Error finding video" });
            // next();
            return;
        }
        //console.log("should have found id", req.params.id);
        if (
            video &&
            (video.status === "pending" ||
                video.status === "available" ||
                video.status === "annotated")
        ) {
            //res.status(200).json({ message: "Video status updated to annotated" });
            //res.json(video);
            const reqAnotations = req.body;
            //console.log("reqAnotations", reqAnotations);
            const annotation = new Annotation({
                videoId: req.params.id,
                annotations: reqAnotations,
            });
            // } catch (error) {
            //     logger.error(`[POST] Error creating annotation: ${error}`);
            //     res.status(400).json({ message: "Error creating annotation" });
            // next();
            // }

            console.log("annotation to save with post", annotation);
            const {
                errorStatus: errorStatusAnnotation,
                message: messageAnnotation,
            } = await handleSave(annotation, res, "POST", "annotation");
            if (errorStatusAnnotation !== 0) {
                //console.log("should exit after this");
                res.status(errorStatusAnnotation).json({
                    message: messageAnnotation,
                });
                // next();
                return;
            }
            //console.log("doing annotated");
            video.status = "annotated";
            // try {

            //     await video.save();
            // }
            // catch (err) {
            //     //console.error(`[server]: [post] Error saving video status to annotated: ${err}`);
            //     logger.error(`[POST] Error saving video status to annotated: ${err}`);
            //     res.status(400).json({ message: "Error saving video status to annotated" });
            // next();
            // }
            const { errorStatus: errorStatusVideo, message: messageVideo } =
                await handleSave(
                    video,
                    res,
                    "POST",
                    "video status to annotated"
                );
            if (errorStatusVideo !== 0) {
                res.status(errorStatusVideo).json({ message: messageVideo });
                // next();
                return;
            }
            // console.error(`[server]: [post] Error saving annotation: ${err}`);
            // res.status(400).json({ message: "Error saving annotation" });
            res.status(201).json({
                id: annotation.videoId,
                message: "Annotation submitted successfully!",
            });
            // next();
            return;
        } else {
            // if (video && video.status === "available") {
            //     res.status(400).json({ message: "Video not pending" });
            // } else if (video && video.status === "annotated") {
            //     res.status(400).json({ message: "Video already annotated" });
            // }
            console.error(
                `[server]: [post] Video not found (id: ${req.params.id})`
            );
            res.status(404).json({ message: "Video not found" });
            // next();
            return;
        }
    }
);

export default videoRouter;
