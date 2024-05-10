import mongoose from "mongoose";
import dotenv from "dotenv";
import Video from "./models/video";
import Annotation from "./models/annotation";
import readline from "readline";

import { asyncExitHook } from "exit-hook";

// Script to reset the database

dotenv.config();

// function to ask a question in the console and wait for an answer
function askQuestion(query: string) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans);
        })
    );
}

// ask if user wants to use remote database
const ansDB = await askQuestion("Remote database? (yes/no) ");

const USE_REMOTE = ansDB === "yes" || ansDB === "y";

let DELETE_ANNOTATIONS = false;

// ask if user wants to delete also all annotations
const ansAnnots = await askQuestion(
    "Do you want to delete all annotations? (yes/no) "
);

if (ansAnnots === "yes" || ansAnnots === "y") {
    DELETE_ANNOTATIONS = true;
}

let DELETE_USERS = false;

// ask if user wants to delete all users
const ansUsers = await askQuestion(
    "Do you want to delete all users? (yes/no) "
);

if (ansUsers === "yes" || ansUsers === "y") {
    DELETE_USERS = true;
}

let DELETE_VIDEOS = false;

// ask if user wants to delete all videos from the database, not the files
const ansVideos = await askQuestion(
    "Do you want to delete all videos? (yes/no) "
);

if (ansVideos === "yes" || ansVideos === "y") {
    DELETE_VIDEOS = true;
}

// ask if user wants to reset the database
const ans = await askQuestion(
    "\nAre you sure you want to reset the " + (USE_REMOTE ? "REMOTE" : "LOCAL") + " database? (yes/no) "
);

if (ans !== "yes" && ans !== "y") {
    console.log("Exiting...");
    process.exit(0);
}

const MONGO_URI = process.env.MONGO_URI || "error";
const MONGO_URI_LOCAL = process.env.MONGO_URI_LOCAL || "error";

try {
    if (USE_REMOTE) {
        console.log("Connecting to REMOTE MongoDB");
        await mongoose.connect(MONGO_URI);
    } else {
        console.log("Connecting to LOCAL MongoDB");
        await mongoose.connect(MONGO_URI_LOCAL);
    }
} catch (error) {
    console.log("cannot connect to the database");
}
console.log("Connected to MongoDB 📗");

const db = mongoose.connection;

const videos = await Video.find({}).exec();

for (const video of videos) {
    video.status = "available";
    await video.save();
}

if (DELETE_ANNOTATIONS) {
    await Annotation.deleteMany({}).exec();
}

if (DELETE_USERS) {
    await mongoose.connection.dropCollection("users");
    await mongoose.connection.dropCollection("verificationTokens");
    await mongoose.connection.dropCollection("resetPasswordTokens");
}

if (DELETE_VIDEOS) {
    await Video.deleteMany({}).exec();
}

console.log("Database reset successfully");

db.close();

asyncExitHook(async (signal) => {
    // signals start from 128 (Node): 129 = SIGHUP, 130 = SIGINT, 133 = SIGQUIT, 143 = SIGTERM
    if (signal === 129 || signal === 130 || signal === 131 || signal === 143) {
        console.log(
            `\nReceived ${signal} signal, gracefully cleaning up before terminating... 📕`
        );

        db.close();
        console.log("Mongoose connection closed through app termination 📕");
    }
}, {wait: 5000});
