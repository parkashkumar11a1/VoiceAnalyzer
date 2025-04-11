import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertRecordingSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Set up multer for file uploads
const storage_dir = path.join(process.cwd(), "dist/public/uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(storage_dir)) {
  fs.mkdirSync(storage_dir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, storage_dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      
      // Determine the proper extension based on mime type
      let extension = 'webm'; // Default
      
      if (file.mimetype === 'audio/mp3' || file.mimetype === 'audio/mpeg') {
        extension = 'mp3';
      } else if (file.mimetype === 'audio/ogg') {
        extension = 'ogg';
      } else if (file.mimetype === 'audio/wav' || file.mimetype === 'audio/x-wav' || file.mimetype === 'audio/wave') {
        extension = 'wav';
      } else if (file.mimetype === 'audio/mp4') {
        extension = 'mp3'; // Use mp3 instead of mp4 for better compatibility
      }
      
      cb(null, `recording-${uniqueSuffix}.${extension}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Accept common audio file types
    const allowedMimeTypes = [
      'audio/webm',
      'audio/ogg',
      'audio/mp3',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/wave'
    ];
    
    // Also accept any audio type as fallback
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      console.log(`Accepting file with MIME type: ${file.mimetype}`);
      cb(null, true);
    } else {
      console.log(`Rejecting file with MIME type: ${file.mimetype}`);
      cb(new Error('Only audio files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/recordings", async (req, res) => {
    try {
      const recordings = await storage.getAllRecordings();
      res.json(recordings);
    } catch (error) {
      console.error("Error fetching recordings:", error);
      res.status(500).json({ message: "Failed to fetch recordings" });
    }
  });

  app.post("/api/recordings", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file uploaded" });
      }

      const body = JSON.parse(req.body.data || '{}');
      
      const recordingData = insertRecordingSchema.parse({
        question: body.question,
        audioUrl: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        duration: body.duration || 0,
      });

      const recording = await storage.createRecording(recordingData);
      
      res.status(201).json(recording);
    } catch (error) {
      console.error("Error creating recording:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create recording" });
    }
  });

  app.delete("/api/recordings/:id", async (req, res) => {
    try {
      const idSchema = z.coerce.number().positive();
      const id = idSchema.parse(req.params.id);
      
      const recording = await storage.getRecording(id);
      
      if (!recording) {
        return res.status(404).json({ message: "Recording not found" });
      }
      
      // Delete the file before deleting the record
      const filePath = path.join(process.cwd(), "dist/public", recording.audioUrl);
      
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error("Error deleting file:", fileError);
        // Continue with deletion from storage even if file deletion fails
      }
      
      const success = await storage.deleteRecording(id);
      
      if (success) {
        res.status(200).json({ message: "Recording deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete recording" });
      }
    } catch (error) {
      console.error("Error deleting recording:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid recording ID" });
      }
      
      res.status(500).json({ message: "Failed to delete recording" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
