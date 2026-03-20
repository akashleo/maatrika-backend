import { 
  generateObjectName, 
  validateContentType, 
  validateFileSize,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_MB,
} from '../src/services/gcs.service.js';
import jest from 'jest';

// Mock the Google Cloud Storage
jest.mock('@google-cloud/storage', () => {
  return {
    Storage: jest.fn().mockImplementation(() => ({
      bucket: jest.fn().mockReturnValue({
        file: jest.fn().mockReturnValue({
          getSignedUrl: jest.fn().mockResolvedValue(['https://signed-url.example.com']),
          delete: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    })),
  };
});

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock-key-file')),
}));

describe('GCS Service', () => {
  beforeEach(() => {
    // Reset modules and environment variables before each test
    jest.resetModules();
    jest.clearAllMocks();
    
    // Set required environment variables
    process.env.GCP_BUCKET_JSON_PATH = '/path/to/key.json';
    process.env.GCP_BUCKET_NAME = 'test-bucket';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.GCP_BUCKET_JSON_PATH;
    delete process.env.GCP_BUCKET_NAME;
  });

  describe('generateObjectName', () => {
    it('should generate a unique object name with productId and timestamp', () => {
      const productId = 'prod-123';
      const fileName = 'image.jpg';
      
      const result = generateObjectName(productId, fileName);
      
      // Should start with products/{productId}/
      expect(result).toMatch(new RegExp(`^products/${productId}/\\d+-${fileName}$`));
    });

    it('should include timestamp in the generated name', () => {
      const productId = 'prod-456';
      const fileName = 'photo.png';
      
      const beforeTimestamp = Date.now();
      const result = generateObjectName(productId, fileName);
      const afterTimestamp = Date.now();
      
      // Extract timestamp from result
      const timestampMatch = result.match(/\/(\d+)-photo\.png$/);
      expect(timestampMatch).toBeTruthy();
      
      const timestamp = parseInt(timestampMatch![1], 10);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(timestamp).toBeLessThanOrEqual(afterTimestamp);
    });

    it('should sanitize invalid characters in filename', () => {
      const productId = 'prod-789';
      const fileName = 'my image<file>.jpg';
      
      const result = generateObjectName(productId, fileName);
      
      // Should replace invalid chars with hyphens
      expect(result).toContain('my-image-file-.jpg');
      // Should not contain the original special characters
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain(' ');
    });

    it('should truncate long filenames', () => {
      const productId = 'prod-000';
      const longFileName = 'a'.repeat(200) + '.jpg';
      
      const result = generateObjectName(productId, longFileName);
      
      // The filename part after timestamp should be truncated
      const filenamePart = result.split('-').pop();
      expect(filenamePart!.length).toBeLessThanOrEqual(100);
    });
  });

  describe('validateContentType', () => {
    it('should return true for allowed MIME types', () => {
      ALLOWED_MIME_TYPES.forEach(mimeType => {
        expect(validateContentType(mimeType)).toBe(true);
      });
    });

    it('should return false for disallowed MIME types', () => {
      const invalidTypes = [
        'image/gif',
        'image/bmp',
        'application/pdf',
        'text/plain',
        'application/json',
        'video/mp4',
      ];
      
      invalidTypes.forEach(mimeType => {
        expect(validateContentType(mimeType)).toBe(false);
      });
    });

    it('should be case-sensitive', () => {
      // MIME types are case-sensitive per RFC
      expect(validateContentType('IMAGE/JPEG')).toBe(false);
      expect(validateContentType('Image/Png')).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should return true when fileSize is undefined', () => {
      expect(validateFileSize(undefined)).toBe(true);
    });

    it('should return true for files under the max size', () => {
      const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
      
      expect(validateFileSize(1024)).toBe(true); // 1KB
      expect(validateFileSize(maxBytes - 1)).toBe(true);
      expect(validateFileSize(maxBytes)).toBe(true);
    });

    it('should return false for files over the max size', () => {
      const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
      
      expect(validateFileSize(maxBytes + 1)).toBe(false);
      expect(validateFileSize(maxBytes * 2)).toBe(false);
      expect(validateFileSize(maxBytes * 100)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateFileSize(0)).toBe(true); // Empty file
      expect(validateFileSize(1)).toBe(true); // 1 byte
    });
  });

  describe('Constants', () => {
    it('should have the correct allowed MIME types', () => {
      expect(ALLOWED_MIME_TYPES).toEqual([
        'image/png',
        'image/jpeg', 
        'image/webp'
      ]);
    });

    it('should have the correct max file size', () => {
      expect(MAX_FILE_SIZE_MB).toBe(10);
    });
  });
});
