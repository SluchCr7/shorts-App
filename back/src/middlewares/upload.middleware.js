const multer = require("multer");
const ApiError = require("../utils/ApiError");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "video") {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Invalid file format. Only video files are allowed for video upload."), false);
    }
  } else if (file.fieldname === "thumbnail" || file.fieldname === "avatar" || file.fieldname === "coverImage") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Invalid file format. Only image files are allowed."), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Max 100MB
  },
  fileFilter,
});

module.exports = upload;
