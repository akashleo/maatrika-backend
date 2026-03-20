import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { 
  getSignedUploadUrl, 
  GetSignedUrlParams,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_MB,
} from '../src/services/gcs.service.js';

/**
 * Interface for the request body to generate a signed upload URL
 */
interface GenerateUploadUrlBody {
  fileName: string;
  contentType: string;
  productId: string;
}

/**
 * Validate the request body for generating upload URL
 */
const validateUploadUrlBody = (body: Record<string, any>): { isValid: boolean; error?: string } => {
  const { fileName, contentType, productId } = body;

  if (!fileName || typeof fileName !== 'string' || fileName.trim().length === 0) {
    return { isValid: false, error: 'fileName is required and must be a non-empty string' };
  }

  if (!contentType || typeof contentType !== 'string') {
    return { isValid: false, error: 'contentType is required and must be a string' };
  }

  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    return { isValid: false, error: `contentType must be one of: ${ALLOWED_MIME_TYPES.join(', ')}` };
  }

  if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
    return { isValid: false, error: 'productId is required and must be a non-empty string' };
  }

  return { isValid: true };
};

/**
 * Parse file size from request headers
 * Checks x-file-size header or content-length header
 */
const getFileSizeFromHeaders = (headers: Record<string, any>): number | undefined => {
  const fileSizeHeader = headers['x-file-size'] || headers['x-filesize'];
  if (fileSizeHeader) {
    const parsed = parseInt(fileSizeHeader as string, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

/**
 * [ADMIN/USER] Generate a signed URL for uploading a product image
 * POST /api/uploads/product-image
 */
export const generateProductImageUploadUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validation = validateUploadUrlBody(req.body);
    if (!validation.isValid) {
      res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        error: validation.error 
      });
      return;
    }

    const { fileName, contentType, productId } = req.body as GenerateUploadUrlBody;

    // Check for file size from headers
    const fileSize = getFileSizeFromHeaders(req.headers);
    
    if (fileSize !== undefined) {
      const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
      if (fileSize > maxSizeBytes) {
        res.status(400).json({
          success: false,
          message: 'File too large',
          error: `Maximum file size is ${MAX_FILE_SIZE_MB}MB`,
        });
        return;
      }
    }

    // Generate signed URL
    const params: GetSignedUrlParams = {
      fileName: fileName.trim(),
      contentType,
      productId: productId.trim(),
      fileSize,
    };

    const { uploadUrl, publicUrl, expiresAt } = await getSignedUploadUrl(params);

    res.status(200).json({
      success: true,
      data: {
        uploadUrl,
        publicUrl,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Error generating signed upload URL:', error);
    
    // Determine appropriate status code based on error type
    const errorMessage = (error as Error).message;
    
    if (errorMessage.includes('Invalid content type')) {
      res.status(400).json({
        success: false,
        message: 'Invalid content type',
        error: errorMessage,
      });
      return;
    }
    
    if (errorMessage.includes('File size exceeds')) {
      res.status(400).json({
        success: false,
        message: 'File too large',
        error: errorMessage,
      });
      return;
    }
    
    if (errorMessage.includes('environment variable')) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error',
        error: 'Upload service is not properly configured',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error generating upload URL',
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
    });
  }
};
