import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose, { connect } from "mongoose";

import { Server } from "socket.io";
import { createServer } from "http";

import {videoRouter, initSocket, getNumberAnnotatedVideos} from "./routes/videoRouter";
import logger from "./logger";

import cors from "cors";

dotenv.config();

// MONGOOSE

const MONGO_URI = process.env.MONGO_URI || "error";
const MONGO_URI_LOCAL = process.env.MONGO_URI_LOCAL || "error";
const db = mongoose.connection;
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

try {
    await connect(MONGO_URI);
    //await connect(MONGO_URI_LOCAL);
} catch (err) {
    logger.error("Error connecting to MongoDB: ", err);
    process.exit(0);
}

// EXPRESS

const app: Express = express();
const port = process.env.PORT || 3000;

// SOCKET.IO

app.use(cors( { origin: "http://localhost:5174" } ));

app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" }, path: "/socketIO" });
io.on("connection", async (socket) => {
    const {annotatedVideos, totalVideos} = await getNumberAnnotatedVideos();
    socket.emit("progressBarUpdate", {annotatedVideos, totalVideos});
    logger.info("a user connected " + socket.id + " init progress: " + annotatedVideos + " total videos: " + totalVideos);
    socket.on("disconnect", () => {
        logger.info("user disconnected");
    });
});

export const timeouts: { a: NodeJS.Timeout; b: () => void; id: string }[] = [];


app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.get("/api", (req: Request, res: Response) => {
    res.send("Hello World API!");
});

initSocket(io);
app.use("/api/v1/video", videoRouter);

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


// Close the connection when the application stops
["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) =>
    process.on(signal, async () => {
        console.log(
            `\nReceived ${signal} signal, gracefully cleaning up before terminating... 📕`
        );

        for (let timeout of timeouts) {
            clearTimeout(timeout.a);
            await timeout.b();
        }

        await mongoose.connection.close(true);
        logger.info("Mongoose connection closed through app termination 📕");

        logger.info("Timeouts cleared 📕");

        process.exit(0);
    })
);

// setInterval(() => {
//     timeouts.forEach((timeout) => console.log(timeout.id));
// }, 5000);
