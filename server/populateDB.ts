import mongoose, { connect } from "mongoose";
import dotenv from "dotenv";
import path from "path";

import Video from "./models/video";
import readline from "readline";

import * as glob from 'glob'

import { asyncExitHook } from "exit-hook";

// Script to populate the database with videos from the /videos folder

dotenv.config();
// connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "error";
const MONGO_URI_LOCAL = process.env.MONGO_URI_LOCAL || "error";
let UPDATE = true;

// function to ask a question in the console and wait for an answer
function askQuestion(query: string) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

// ask if user wants to use remote database
const ans = await askQuestion("\nRemote database? (yes/no) ");

if (ans !== "yes" && ans !== "y") {
    console.log("\nUsing local database");
}
const USE_REMOTE = ans === "yes" || ans === "y";

// ask if user wants to update existing videos (in case a video was already in the db and one wants to update its information)
const ans2 = await askQuestion("Do you want to update existing videos? (yes/no) ");

if (ans2 === "no" || ans2 === "n") {
    console.log("Not updating existing videos");
    UPDATE = false;
}

// ask if user wants to reset the database
const ans3 = await askQuestion(
    "\nAre you sure you want to update the " + (USE_REMOTE ? "REMOTE" : "LOCAL") + " database? (yes/no) "
);

if (ans3 !== "yes" && ans3 !== "y") {
    console.log("Exiting...");
    process.exit(0);
}

// Check if connection is successful
const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function () {
    console.log("Connected to MongoDB");
});

try {
    if (USE_REMOTE) {
        console.log("Connecting to REMOTE MongoDB");
        await connect(MONGO_URI);
    }
    else {
        console.log("Connecting to LOCAL MongoDB");
        await connect(MONGO_URI_LOCAL);
    }
} catch (err) {
    console.log("Error connecting to MongoDB: ", err);
}

// console.log(MONGO_URI_LOCAL);

// print available collections
const collections = await mongoose.connection.db.listCollections().toArray();
console.log(collections);

// end connect to MongoDB

// get list of videos from folder
const videoFolder = "../client/public/videos/**/*.{mp4,avi,flv,wmv,mov}";
// const videoFiles = fs.readdirSync(videoFolder);
const videoFiles = glob.sync(videoFolder);

videoFiles.forEach((file: string) => {
    console.log(file);
});



for (const [index, file] of videoFiles.entries()) {

    // create empty video object
    const video = new Video({
        title: path.basename(file, path.extname(file)),
        description: "",
        // filename from /videos/ folder
        filename: file.split("public")[1],
        extension: path.extname(file) !== null && path.extname(file).slice(1),
        status: "available",
    });

    // check if video already exists
    const videoExists = await Video.findOne({ filename: file });
    if (videoExists) {
        console.log(`Video ${index} already exists: ${file} with id ${videoExists._id}`);
        // update video if necessary
        if (UPDATE) {
            console.log("\tUpdating video " + index + ": ", file);
            try {
                const oldAnnotated = videoExists.status;
                videoExists.overwrite(video);
                if (oldAnnotated !== "available" )
                    videoExists.status = oldAnnotated;
                await videoExists.save();
            } catch (err) {
                console.log("Error updating video: ", err);
            }
        }
        continue;
    }
    try {
        await video.save();
    } catch (err) {
        console.log("Error saving video: ", err);
    }
    console.log("Successfully saved video " + index + ": ", file);
}

// Close the connection when the application stops
asyncExitHook(async (signal) => {
    // signals start from 128 (Node): 129 = SIGHUP, 130 = SIGINT, 133 = SIGQUIT, 143 = SIGTERM
    if (signal === 129 || signal === 130 || signal === 131 || signal === 143) {
        console.log(
            `\nReceived ${signal} signal, gracefully cleaning up before terminating... 📕`
        );

        await mongoose.connection.close(true);
        console.log("Mongoose connection closed through app termination 📕");
    }
}, {wait: 5000});


// close connection
try {
    await mongoose.connection.close();
} catch (err) {
    console.log("Error closing connection: ", err);
}
console.log("Mongoose connection closed");
