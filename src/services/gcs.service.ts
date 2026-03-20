import { Storage } from '@google-cloud/storage';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Allowed MIME types for product images
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;
const SIGNED_URL_EXPIRATION_MINUTES = 10;

let storage: Storage | null = null;
let bucketName: string | null = null;

/**
 * Initialize GCS Storage client
 * Uses GCP_BUCKET_JSON_PATH from env for key file path
 * Uses GCP_BUCKET_NAME from env for bucket name
 */
export const initializeStorage = (): Storage => {
  if (storage) {
    return storage;
  }

  const keyFilePath = process.env.GCP_BUCKET_JSON_PATH;
  const bucket = process.env.GCP_BUCKET_NAME;

  if (!keyFilePath) {
    throw new Error('GCP_BUCKET_JSON_PATH environment variable is required');
  }

  if (!bucket) {
    throw new Error('GCP_BUCKET_NAME environment variable is required');
  }

  try {
    // Resolve path (supports both absolute and relative)
    const resolvedPath = resolve(keyFilePath);
    
    // Verify the key file exists and is readable
    readFileSync(resolvedPath);

    storage = new Storage({
      keyFilename: resolvedPath,
    });

    bucketName = bucket;

    return storage;
  } catch (error) {
    throw new Error(`Failed to initialize GCS storage: ${(error as Error).message}`);
  }
};

/**
 * Get the configured bucket name
 */
export const getBucketName = (): string => {
  if (!bucketName) {
    initializeStorage();
  }
  return bucketName!;
};

/**
 * Get the Storage instance
 */
export const getStorage = (): Storage => {
  if (!storage) {
    return initializeStorage();
  }
  return storage;
};

/**
 * Generate a unique object name for GCS
 * Format: products/{productId}/{timestamp}-{filename}
 */
export const generateObjectName = (productId: string, fileName: string): string => {
  const timestamp = Date.now();
  // Sanitize filename - remove any path traversal attempts and invalid chars
  const sanitizedFilename = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
  
  return `products/${productId}/${timestamp}-${sanitizedFilename}`;
};

/**
 * Validate content type against allowed MIME types
 */
export const validateContentType = (contentType: string): boolean => {
  return ALLOWED_MIME_TYPES.includes(contentType);
};

/**
 * Validate file size (in bytes) against max limit
 */
export const validateFileSize = (fileSizeBytes: number | undefined): boolean => {
  if (!fileSizeBytes) return true; // Skip if not provided
  const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  return fileSizeBytes <= maxSizeBytes;
};

/**
 * Interface for signed URL generation parameters
 */
export interface GetSignedUrlParams {
  fileName: string;
  contentType: string;
  productId: string;
  fileSize?: number;
}

/**
 * Interface for signed URL response
 */
export interface SignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  expiresAt: string;
}

/**
 * Generate a signed upload URL for GCS
 * Returns both the signed URL for upload and the public URL for access
 */
export const getSignedUploadUrl = async (params: GetSignedUrlParams): Promise<SignedUrlResponse> => {
  const { fileName, contentType, productId, fileSize } = params;

  // Validate content type
  if (!validateContentType(contentType)) {
    throw new Error(`Invalid content type: ${contentType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  // Validate file size if provided
  if (fileSize !== undefined && !validateFileSize(fileSize)) {
    throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE_MB}MB`);
  }

  const storageClient = getStorage();
  const bucket = storageClient.bucket(getBucketName());
  
  // Generate unique object name
  const objectName = generateObjectName(productId, fileName);
  const file = bucket.file(objectName);

  // Generate signed URL for PUT upload
  const expiresAt = Date.now() + SIGNED_URL_EXPIRATION_MINUTES * 60 * 1000;
  
  const [uploadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: expiresAt,
    contentType: contentType,
    virtualHostedStyle: true,
  });

  // Generate public URL (assuming uniform bucket access with public read)
  const publicUrl = `https://storage.googleapis.com/${getBucketName()}/${objectName}`;

  return {
    uploadUrl,
    publicUrl,
    expiresAt: new Date(expiresAt).toISOString(),
  };
};

/**
 * Delete an object from GCS
 */
export const deleteObject = async (objectName: string): Promise<void> => {
  const storageClient = getStorage();
  const bucket = storageClient.bucket(getBucketName());
  const file = bucket.file(objectName);

  try {
    await file.delete();
  } catch (error) {
    // Ignore 404 errors - object already deleted or doesn't exist
    if ((error as any).code !== 404) {
      throw error;
    }
  }
};

export {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_MB,
  SIGNED_URL_EXPIRATION_MINUTES,
};
