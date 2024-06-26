import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose, { connect } from "mongoose";

import { Server } from "socket.io";
import { createServer } from "http";

import {videoRouter, initSocket, getNumberAnnotatedVideos} from "./routes/videoRouter";
import logger from "./logger";

import cors from "cors";

import { asyncExitHook } from 'exit-hook';

dotenv.config();

// MONGOOSE
const USE_REMOTE_DB = process.env.USE_REMOTE_DB || "false";
const MONGO_URI = process.env.MONGO_URI || "error";
const MONGO_URI_LOCAL = process.env.MONGO_URI_LOCAL || "error";
const db = mongoose.connection;
// Mongoose connection events
db.on("error", () => {
    logger.error("Error connecting to MongoDB 📕");
});
db.on("timeout", () => {
    logger.error("Connection Timeout with MongoDB server 📕");
});
db.once("open", function () {
    logger.info("Connected to MongoDB 📗");
});
db.on("disconnected", function () {
    logger.error("Disconnected from MongoDB server 📕");
});
db.on("reconnected", function () {
    logger.info("Reconnected to MongoDB 📗");
});

// Connect to MongoDB
try {
    // decide to which database to connect (local or remote mongoDB)
    if (USE_REMOTE_DB === "true") {
        logger.info("Connecting to REMOTE MongoDB 🟢");
        await connect(MONGO_URI);
    } else {
        logger.info("Connecting to LOCAL MongoDB 🟢");
        await connect(MONGO_URI_LOCAL);
    }
    //await connect(MONGO_URI);
    //await connect(MONGO_URI_LOCAL);
} catch (err) {
    logger.error("Error connecting to MongoDB: ", err);
    process.exit(0);
}

// EXPRESS

const app: Express = express();
const port = process.env.PORT || 3000;

// SOCKET.IO
// allow cors only for the frontend
app.use(cors( { origin: "http://localhost:5174" } ));

app.use(express.json());

// create http server for socket.io
const httpServer = createServer(app);
// allow cors for everyone for the socket.io server
const io = new Server(httpServer, { cors: { origin: "*" }, path: "/socketIO" });

// when a user connects, send the current progress of the progress bar with socket.io
io.on("connection", async (socket) => {
    const {annotatedVideos, totalVideos} = await getNumberAnnotatedVideos();
    socket.emit("progressBarUpdate", {annotatedVideos, totalVideos});
    logger.info("a user connected " + socket.id + " init progress: " + annotatedVideos + " total videos: " + totalVideos);
    socket.on("disconnect", () => {
        logger.info("user disconnected");
    });
});

// timeouts array to store all timeouts (users' video reservations) and clear them when the application stops if they didn't finish naturally
export const timeouts: { a: NodeJS.Timeout; b: () => void; id: string }[] = [];


app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.get("/api", (req: Request, res: Response) => {
    res.send("Hello World API!");
});

initSocket(io);
app.use("/api/v1/video", videoRouter);

// Serve static files (shouldn't be needed since Next.js will handle this, but just in case)
app.use(express.static("public"));

// app.listen(port, () => {
//     logger.info(`LUS server listening at http://localhost:${port}`);
// });


// app.use("*", (req: Request, res: Response) => {
//     res.status(404).json({ message: "Not found" });
// });

httpServer.listen(port, () => {
    logger.info(`LUS server listening at http://localhost:${port}`);
});


// Close the connection when the application stops (keyboard interrupt events)
asyncExitHook(async (signal) => {
    // signals start from 128 (Node): 129 = SIGHUP, 130 = SIGINT, 133 = SIGQUIT, 143 = SIGTERM
    if (signal === 129 || signal === 130 || signal === 131 || signal === 143) {
        console.log(
            `\nReceived ${signal} signal, gracefully cleaning up before terminating... 📕`
        );

        for (let timeout of timeouts) {
            clearTimeout(timeout.a);
            await timeout.b();
        }

        mongoose.connection.close(true);
        logger.info("Mongoose connection closed through app termination 📕");

        logger.info("Timeouts cleared 📕");
    }
}, {wait: 5000});
