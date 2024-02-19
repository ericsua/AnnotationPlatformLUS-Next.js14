import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose, { connect } from "mongoose";

import videoRouter from "./routes/videoRouter";

dotenv.config();

// MONGOOSE

const MONGO_URI = process.env.MONGO_URI || "error";
const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function () {
    console.log("Connected to MongoDB");
});

try {
    await connect(MONGO_URI);
} catch (err) {
    console.log("Error connecting to MongoDB: ", err);
}

// EXPRESS

const app: Express = express();
const port = process.env.PORT || 3000;

export const timeouts: NodeJS.Timeout[] = [];


app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.use("/api/v1/video", videoRouter);

app.use(express.static("public"));

app.listen(port, () => {
    console.log(`[server]: LUS server listening at http://localhost:${port}`);
});

// Close the connection when the application stops
["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) =>
    process.on(signal, async () => {
        await mongoose.connection.close(true);

        console.log("\nMongoose connection closed through app termination 📕");

        timeouts.forEach((timeout) => clearTimeout(timeout));
        console.log("\nTimeouts cleared 📕");

        process.exit(0);
    })
);
