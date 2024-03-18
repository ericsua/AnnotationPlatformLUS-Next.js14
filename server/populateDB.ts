import mongoose, { Schema, model, connect } from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

import Video from "./models/video";
import Annotation from "./models/annotation";
import readline from "readline";

import * as glob from 'glob'

dotenv.config();
// connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "error";
const MONGO_URI_LOCAL = process.env.MONGO_URI_LOCAL || "error";
let UPDATE = true;

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


const ans = await askQuestion("\nRemote database? (yes/no) ");

if (ans !== "yes" && ans !== "y") {
    console.log("\nUsing local database");
}
const USE_REMOTE = ans === "yes" || ans === "y";

const ans2 = await askQuestion("Do you want to update existing videos? (yes/no) ");

if (ans2 === "no" || ans2 === "n") {
    console.log("Not updating existing videos");
    UPDATE = false;
}

// Check if connection is successful
const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function () {
    console.log("Connected to MongoDB");
});

try {
    await connect(USE_REMOTE ? MONGO_URI : MONGO_URI_LOCAL);
} catch (err) {
    console.log("Error connecting to MongoDB: ", err);
}

console.log(MONGO_URI_LOCAL);

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
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => process.on(signal, async () => {
    await mongoose.connection.close(true);
    
    console.log('\nMongoose connection closed through app termination 📕');
    process.exit(0);
}));


// close connection
try {
    await mongoose.connection.close();
} catch (err) {
    console.log("Error closing connection: ", err);
}
console.log("Mongoose connection closed");
