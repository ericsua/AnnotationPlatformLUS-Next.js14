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

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}


const ans = await askQuestion("\nAre you sure you want to reset the database? (yes/no) ");

if (ans !== "yes") {
    console.log("Exiting...");
    process.exit(0);
}

let DELETE_ANNOTATIONS = true;

const ans2 = await askQuestion("Do you want to delete all annotations? (yes/no) ");

if (ans2 === "no" || ans2 === "n") {
    DELETE_ANNOTATIONS = false;
}




const MONGO_URI = process.env.MONGO_URI || "error";

try {
    await mongoose.connect(MONGO_URI);
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
console.log("Database reset successfully");

db.close();

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) =>
    process.on(signal, () => {
        console.log(`Process ${process.pid} has been interrupted`);
        db.close();
        process.exit(0);
    })
);
