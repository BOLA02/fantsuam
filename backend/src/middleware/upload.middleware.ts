// src/middleware/upload.middleware.ts

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => {
    return {
      folder: "loan-documents",
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    };
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});