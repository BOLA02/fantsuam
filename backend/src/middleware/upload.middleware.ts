import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "../utils/AppError";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const parser = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
    fields: 8,
    parts: 9,
    fieldNameSize: 100,
    fieldSize: 16 * 1024,
  },
});

export function detectedMime(buffer: Buffer): string | undefined {
  if (
    buffer.length >= 4 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff &&
    buffer.at(-2) === 0xff &&
    buffer.at(-1) === 0xd9
  ) return "image/jpeg";

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const pngEnd = Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
  if (buffer.length >= 24 && buffer.subarray(0, 8).equals(pngSignature) && buffer.subarray(-8).equals(pngEnd)) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 5).toString("ascii") === "%PDF-" &&
    buffer.subarray(Math.max(0, buffer.length - 1024)).includes(Buffer.from("%%EOF"))
  ) return "application/pdf";

  return undefined;
}

export function parseDocumentUpload(req: Request, res: Response, next: NextFunction) {
  parser.single("file")(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "File exceeds the 10 MB limit"
        : "Invalid multipart upload";
      return next(new AppError(400, message));
    }
    if (error) return next(new AppError(400, "Invalid multipart upload"));
    next();
  });
}

export function validateDocumentFile(req: Request, _res: Response, next: NextFunction) {
  if (!req.file) return next(new AppError(400, "No file uploaded"));
  const mime = detectedMime(req.file.buffer);
  if (!mime) return next(new AppError(400, "Only valid JPEG, PNG, and PDF files are supported"));
  req.file.mimetype = mime;
  next();
}

export const uploadLimits = { MAX_FILE_SIZE };
