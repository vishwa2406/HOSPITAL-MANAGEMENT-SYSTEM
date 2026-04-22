import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Ensure local profile folder exists
const uploadDir = 'uploads/profile';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CL_CLOUD_NAME,
  api_key: process.env.CL_API_KEY,
  api_secret: process.env.CL_API_SECRET,
  secure: true
});

const useCloudinary = !!process.env.CL_CLOUD_NAME;


const localDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Robust PDF detection
    const isPdf = file.mimetype === 'application/pdf' || 
                  file.originalname.toLowerCase().endsWith('.pdf');
    
    const timestamp = Date.now();
    const cleanName = file.originalname
      .replace(/\.[^/.]+$/, "") // Remove original extension
      .replace(/[^a-zA-Z0-9]/g, '-') // Replace non-alphanumeric with dash
      .replace(/-+/g, '-'); // Remove double dashes

    return {
      folder: 'care-companion/uploads',
      resource_type: isPdf ? 'raw' : 'auto',
      public_id: `${timestamp}-${cleanName}${isPdf ? '.pdf' : ''}`,
      allowed_formats: isPdf ? undefined : ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'webm', 'mov'],
    };
  }
});

const storage = useCloudinary ? cloudinaryStorage : localDiskStorage;

// File Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'application/pdf',
    'video/mp4', 'video/webm', 'video/quicktime'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and videos are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Increased to 50MB for video/pdf support
  }
});

export default upload;
