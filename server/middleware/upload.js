import multer from "multer";
import path from "path";

// Set storage engine for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile_pictures"); // your folder path
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // file name with extension
  },
});

// File filter (optional): to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg","image/gif","image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, .png .gif .webp files are allowed"), false);
  }
};

const uploadProfile = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default uploadProfile;
