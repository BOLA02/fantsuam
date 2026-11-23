import { Readable } from "stream";
import cloudinary from "../../config/cloudinary";

export type DocumentResourceType = "image" | "raw";

export interface StoredDocument {
  publicId: string;
  resourceType: DocumentResourceType;
  format: string;
  storageReference: string;
}

export async function uploadPrivateDocument(file: Express.Multer.File): Promise<StoredDocument> {
  const resourceType: DocumentResourceType = file.mimetype === "application/pdf" ? "raw" : "image";
  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "loan-documents", resource_type: resourceType, type: "authenticated" },
      (error, uploaded) => error || !uploaded ? reject(error ?? new Error("Upload failed")) : resolve(uploaded)
    );
    Readable.from(file.buffer).pipe(stream);
  });
  const format = String(result.format ?? (resourceType === "raw" ? "pdf" : ""));
  return {
    publicId: result.public_id,
    resourceType,
    format,
    storageReference: `cloudinary://authenticated/${resourceType}/${format}/${result.public_id}`,
  };
}

export async function deletePrivateDocument(asset: StoredDocument): Promise<void> {
  await cloudinary.uploader.destroy(asset.publicId, {
    resource_type: asset.resourceType,
    type: "authenticated",
    invalidate: true,
  });
}

export function privateDownloadUrl(asset: StoredDocument): string {
  return cloudinary.utils.private_download_url(asset.publicId, asset.format, {
    resource_type: asset.resourceType,
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 300,
    attachment: true,
  });
}

export function parseStorageReference(value: string): StoredDocument | undefined {
  const match = /^cloudinary:\/\/authenticated\/(image|raw)\/([^/]*)\/(.+)$/.exec(value);
  if (!match) return undefined;
  return { resourceType: match[1] as DocumentResourceType, format: match[2], publicId: match[3], storageReference: value };
}

export const documentStorage = {
  upload: uploadPrivateDocument,
  delete: deletePrivateDocument,
  downloadUrl: privateDownloadUrl,
};
