import express, { Express, Request, Response, Router } from "express";

import fs from "fs";
import path from "path";

const videoServer: Router = express.Router();

const videoFolder = "./videos";
const videoFiles = fs.readdirSync(videoFolder);

videoServer.get("/:filename", (req: Request, res: Response) => {
    const filename = req.params.filename;
    const videoPath = path.join(videoFolder, filename);
    if (fs.existsSync(videoPath)) {
        res.sendFile(videoPath);
    }
    else {
        res.status(404).json({ message: "Video not found" });
    }
});