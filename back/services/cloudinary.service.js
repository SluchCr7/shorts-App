const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");
const { Readable } = require("stream");

const uploadOnCloudinary = async (fileInput, folder = "shorts_platform", resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    if (!fileInput) {
      return reject(new ApiError(400, "File input is missing"));
    }

    if (typeof fileInput === "string") {
      cloudinary.uploader.upload(
        fileInput,
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary File Upload Error:", error);
            return reject(new ApiError(500, `Cloudinary Upload Error: ${error.message}`));
          }
          resolve(result);
        }
      );
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Buffer Upload Error:", error);
          if (resourceType === "image" || folder === "avatars" || folder === "covers") {
            const base64 = fileInput.toString("base64");
            return resolve({
              secure_url: `data:image/jpeg;base64,${base64}`,
              public_id: `local_${Date.now()}`,
            });
          }
          return reject(new ApiError(500, `Cloudinary Upload Error: ${error.message}`));
        }
        resolve(result);
      }
    );

    Readable.from(fileInput).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return response;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    return null;
  }
};

module.exports = {
  uploadOnCloudinary,
  deleteFromCloudinary,
};
