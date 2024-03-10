import express, {
    Express,
    NextFunction,
    Request,
    Response,
    Router,
} from "express";
import Video from "../models/video";
import Annotation, { FormSchema } from "../models/annotation";
import mongoose, { Model } from "mongoose";
import { timeouts } from "../index";
import logger from "../logger";
import crypto from "crypto";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

const videoRouter: Router = express.Router();

let socketIO: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | null = null;

function initSocket(socket: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    socketIO = socket;
}

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
            logger.error(
                `[${method}] Error while saving ${whatIsBeingSaved}, bad request, input not valid: ${err}`
            );
            return {
                errorStatus: 400,
                message: `Error while saving ${whatIsBeingSaved}, bad request, input not valid`,
            };
        }
        if (err instanceof mongoose.Error.CastError) {
            logger.error(
                `[${method}] Error while saving ${whatIsBeingSaved}, bad request, cast error: ${err}`
            );
            return {
                errorStatus: 400,
                message: `Error while saving ${whatIsBeingSaved},  bad request, cast error`,
            };
        }
        if (err instanceof mongoose.Error) {
            logger.error(
                `[${method}] Error while saving ${whatIsBeingSaved}: ${err}, bad request`
            );
            return {
                errorStatus: 400,
                message: `Error while saving ${whatIsBeingSaved}, bad request`,
            };
        }
        logger.error(
            `[${method}] Internal error while saving ${whatIsBeingSaved}`,
            err
        );
        return {
            errorStatus: 500,
            message: `Internal error while saving ${whatIsBeingSaved}`,
        };
    }
    return { errorStatus: 0, message: "" };
}

async function handleNoAvailableVideos(
    session: mongoose.mongo.ClientSession,
    res: Response
): Promise<void> {
    const pendingVideos = await Video.countDocuments({ status: "pending" })
        .session(session)
        .exec(); // Count within transaction
    logger.info(`[GET] Number of pending videos: ${pendingVideos}`);

    if (pendingVideos === 0) {
        logger.info(
            "[GET] All videos are annotated, no available videos to send!"
        );
        res.status(214).json({
            message: "All videos are currently annotated.",
        });
    } else {
        logger.info(
            `[GET] ${pendingVideos} videos are pending, no available videos now.`
        );
        res.status(210).json({
            message: "No available videos for now, come back later.",
        });
    }
}

export async function getNumberAnnotatedVideos() {
    const annotatedVideos = await Video.countDocuments({ status: "annotated" });
    const totalVideos = await Video.countDocuments({});
    return {annotatedVideos, totalVideos};
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
        const videos = await Video.find({ status: "available" })
            .session(session)
            .exec();
        if (videos.length === 0) {
            logger.info(
                "[GET] All videos are pending or annotated, no available videos to send!"
            );
            await handleNoAvailableVideos(session, res);
            return;
        }

        const randomVideo = videos[Math.floor(Math.random() * videos.length)];

        randomVideo.status = "pending";
        const { errorStatus: errorStatusPending, message: messagePending } =
            await handleSave(
                randomVideo,
                res,
                "GET",
                "random video to pending"
            );
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
            // const updatedVideo = await Video.findByIdAndUpdate(
            //     randomVideo._id,
            //     { $set: { status: "available" } },
            //     { new: false, runValidators: true,  } // Return updated document
            // );

            // const updatedVideo = await Video.findOneAndUpdate(
            //     { _id: randomVideo._id, status: "pending" },
            //     { $set: { status: "available" } },
            //     { new: true, useFindAndModify: false, runValidators: true }, // Return updated document
            // ).exec()

            const updatedVideo = await Video.findById(randomVideo._id).exec();

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
                updatedVideo.status = "available";
                const {
                    errorStatus: errorStatusAvailable,
                    message: messageAvailable,
                } = await handleSave(
                    updatedVideo,
                    res,
                    "POST",
                    "pending video to available in timeout"
                );
                if (errorStatusAvailable !== 0) {
                    logger.error(
                        `[timeout] Error while saving video status to available: ${messageAvailable}`
                    );
                }
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
                timeouts.splice(
                    timeouts.findIndex((timeout) => timeout.id === id),
                    1
                );
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

videoRouter.put("/:id", async (req: Request, res: Response) => {
    const video = await Video.findById(req.params.id);
    if (video && video.status === "available") {
        video.status = "pending";
        if (!(await handleSave(video, res, "PUT", "video"))) {
            return;
        }
        logger.info(`[put] Video status updated to pending (id: ${video._id})`);
        res.status(200).json({ message: "Video status updated to pending" });
    } else {
        if (video && video.status === "pending") {
            logger.error(`[PUT] Video already pending (id: ${video._id})`);
            res.status(400).json({ message: "Video already pending" });
        } else if (video && video.status === "annotated") {
            logger.error(`[PUT] Video already annotated (id: ${video._id})`);
            res.status(400).json({ message: "Video already annotated" });
        }
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
            return;
        }
        if (
            video &&
            (video.status === "pending" ||
                video.status === "available" ||
                video.status === "annotated")
        ) {
            const {data: reqAnnotations, userID} = req.body;
            console.log("reqAnnotations", reqAnnotations, "userID", userID);
            const zodAnnotation = FormSchema.safeParse(reqAnnotations);
            if (!zodAnnotation.success) {
                logger.error(
                    `[POST] Error while validating annotations: ${zodAnnotation.error}`
                );
                let zodErrors = {};
                zodAnnotation.error.issues.forEach((issue) => {
                    //console.log(issue.path)
                    const fullPath = issue.path.join(".");
                    zodErrors = {...zodErrors, [fullPath]: issue.message};
                });
                res.status(455).json({ message: "Error while validating annotations", errors: zodErrors });
                return;
            }
            const annotation = new Annotation({
                videoId: req.params.id,
                annotations: zodAnnotation.data,
                userId: userID,
            });

            console.log("annotation to save with post", annotation);
            const {
                errorStatus: errorStatusAnnotation,
                message: messageAnnotation,
            } = await handleSave(annotation, res, "POST", "annotation");
            if (errorStatusAnnotation !== 0) {
                res.status(errorStatusAnnotation).json({
                    message: messageAnnotation,
                });
                return;
            }
            video.status = "annotated";
            const { errorStatus: errorStatusVideo, message: messageVideo } =
                await handleSave(
                    video,
                    res,
                    "POST",
                    "video status to annotated"
                );
            console.log("[POST] Video status updated to annotated", video);
            if (errorStatusVideo !== 0) {
                res.status(errorStatusVideo).json({ message: messageVideo });
                return;
            }
            res.status(201).json({
                id: annotation.videoId,
                message: "Annotation submitted successfully!",
            });
            const numAnnotatedVideosSocket = await getNumberAnnotatedVideos();
            console.log("numAnnotatedVideosSocket", numAnnotatedVideosSocket);
            socketIO?.emit("progressBarUpdate", numAnnotatedVideosSocket);
            return;
        } else {
            console.error(
                `[server]: [post] Video not found (id: ${req.params.id})`
            );
            res.status(404).json({ message: "Video not found" });
            return;
        }
    }
);

export {videoRouter, initSocket};
