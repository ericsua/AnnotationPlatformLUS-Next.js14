import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose, { connect } from "mongoose";

import videoRouter from "./routes/videoRouter";
import logger from "./logger";

import cors from "cors";

dotenv.config();

// MONGOOSE

const MONGO_URI = process.env.MONGO_URI || "error";
const MONGO_URI_LOCAL = process.env.MONGO_URI_LOCAL || "error";
const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function () {
    logger.info("Connected to MongoDB 📗");
});

try {
    // await connect(MONGO_URI);
    await connect(MONGO_URI_LOCAL);
} catch (err) {
    logger.error("Error connecting to MongoDB: ", err);
    process.exit(1);
}

// EXPRESS

const app: Express = express();
const port = process.env.PORT || 3000;

export const timeouts: { a: NodeJS.Timeout; b: () => void; id: string }[] = [];

app.use(cors());

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.use("/api/v1/video", videoRouter);

app.use(express.static("public"));

app.listen(port, () => {
    logger.info(`LUS server listening at http://localhost:${port}`);
});

app.use("*", (req: Request, res: Response) => {
    res.status(404).json({ message: "Not found" });
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
