import mongoose from "mongoose";
import dotenv from "dotenv";

// Script to test connection to local MongoDB

dotenv.config({ path: "./.env.mongo" });

const DB_USER = process.env.MONGODB_USERNAME;
const DB_PASSWORD = process.env.MONGODB_PASSWORD;

// console.log(DB_USER, DB_PASSWORD);
try {
    await mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@localhost:27017/thesis`);
    // await mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@localhost:2717`);
    console.log("Connected to MongoDB 📗");
} catch (error) {
    console.error("Error connecting to MongoDB: ", error);
}
const videos = await mongoose.connection.listCollections();

console.log(videos);

const found: any = await mongoose.connection.collection("videos").find().toArray();

console.log(found);

mongoose.connection.close();