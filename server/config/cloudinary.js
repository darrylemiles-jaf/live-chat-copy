import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on file mimetype
    let resourceType = 'auto';
    let folder = 'live-chat/attachments';

    if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
      folder = 'live-chat/images';
    } else if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
      folder = 'live-chat/videos';
    } else {
      resourceType = 'raw';
      folder = 'live-chat/files';
    }

    return {
      folder: folder,
      resource_type: resourceType,
      allowed_formats: [
        // Images
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
        // Documents
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv',
        // Videos
        'mp4', 'mov', 'avi', 'webm',
        // Audio
        'mp3', 'wav', 'ogg',
        // Archives
        'zip', 'rar', '7z'
      ],
      transformation: file.mimetype.startsWith('image/')
        ? [{ quality: 'auto', fetch_format: 'auto' }]
        : undefined
    };
  }
});

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
  // Max file size: 10MB
  const maxSize = 10 * 1024 * 1024;

  // Allowed mime types
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Videos
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not supported`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Export cloudinary instance for direct use if needed
export { cloudinary, upload };
export default upload;
