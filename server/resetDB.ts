import mongoose from "mongoose";
import dotenv from "dotenv";
import Video from "./models/video";
import Annotation from "./models/annotation";
import readline from "readline";

dotenv.config();

// ask for confirmation before resetting the database
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

const ans = await askQuestion(
    "\nAre you sure you want to reset the database? (yes/no) "
);

if (ans !== "yes" && ans !== "y") {
    console.log("Exiting...");
    process.exit(0);
}

const ansDB = await askQuestion("Remote database? (yes/no) ");

const USE_REMOTE = ansDB === "yes" || ansDB === "y";

let DELETE_ANNOTATIONS = false;

const ansAnnots = await askQuestion(
    "Do you want to delete all annotations? (yes/no) "
);

if (ansAnnots === "yes" || ansAnnots === "y") {
    DELETE_ANNOTATIONS = true;
}

let DELETE_USERS = false;

const ansUsers = await askQuestion(
    "Do you want to delete all users? (yes/no) "
);

if (ansUsers === "yes" || ansUsers === "y") {
    DELETE_USERS = true;
}

let DELETE_VIDEOS = false;

const ansVideos = await askQuestion(
    "Do you want to delete all videos? (yes/no) "
);

if (ansVideos === "yes" || ansVideos === "y") {
    DELETE_VIDEOS = true;
}

const MONGO_URI = process.env.MONGO_URI || "error";
const MONGO_URI_LOCAL = process.env.MONGO_URI_LOCAL || "error";

try {
    await mongoose.connect(USE_REMOTE ? MONGO_URI : MONGO_URI_LOCAL);
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

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) =>
    process.on(signal, () => {
        console.log(`Process ${process.pid} has been interrupted`);
        db.close();
        process.exit(0);
    })
);
