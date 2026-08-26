const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const ApiError = require("../utils/ApiError");

// Optional: check if ffmpeg path is provided in env or ffmpeg-static
try {
  const ffmpegStatic = require("ffmpeg-static");
  if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
  }
} catch (e) {
  // Use system ffmpeg if ffmpeg-static is not installed
}

/**
 * Trims a video and scales it to 9:16 aspect ratio (720x1280).
 * @param {Object} params
 * @param {string} params.inputPath - Local path to input video file
 * @param {number} [params.startTime=0] - Start time in seconds
 * @param {number} [params.duration=60] - Max duration in seconds
 * @param {string} params.outputPath - Local path for output video file
 * @returns {Promise<string>} - Resolves with outputPath on completion
 */
const processVideo = ({ inputPath, startTime = 0, duration = 60, outputPath }) => {
  return new Promise((resolve, reject) => {
    if (!inputPath || !fs.existsSync(inputPath)) {
      return reject(new ApiError(400, "Valid input video file is required for processing"));
    }

    const command = ffmpeg(inputPath);

    const safeStart = Math.max(0, parseFloat(startTime) || 0);
    const safeDuration = Math.min(60, Math.max(1, parseFloat(duration) || 60));

    command
      .setStartTime(safeStart)
      .setDuration(safeDuration)
      .videoFilters([
        "scale=720:1280:force_original_aspect_ratio=decrease",
        "pad=720:1280:(ow-iw)/2:(oh-ih)/2",
        "setsar=1",
      ])
      .outputOptions([
        "-c:v libx264",
        "-crf 23",
        "-preset fast",
        "-c:a aac",
        "-b:a 128k",
        "-movflags +faststart",
      ])
      .output(outputPath)
      .on("start", (cmd) => {
        console.log("FFmpeg process started:", cmd);
      })
      .on("end", () => {
        console.log("FFmpeg process completed successfully:", outputPath);
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("FFmpeg processing error:", err);
        reject(new ApiError(500, `Video processing failed: ${err.message}`));
      });

    command.run();
  });
};

/**
 * Extracts a thumbnail image frame from video.
 * @param {Object} params
 * @param {string} params.inputPath
 * @param {number} [params.timestamp=0]
 * @param {string} params.outputPath
 * @returns {Promise<string>}
 */
const extractThumbnail = ({ inputPath, timestamp = 0, outputPath }) => {
  return new Promise((resolve, reject) => {
    if (!inputPath || !fs.existsSync(inputPath)) {
      return reject(new ApiError(400, "Valid input video file is required for thumbnail extraction"));
    }

    const folder = path.dirname(outputPath);
    const filename = path.basename(outputPath);
    const safeTimestamp = Math.max(0, parseFloat(timestamp) || 0);

    ffmpeg(inputPath)
      .screenshots({
        timestamps: [safeTimestamp],
        filename: filename,
        folder: folder,
        size: "720x1280",
      })
      .on("end", () => {
        console.log("Thumbnail extracted successfully:", outputPath);
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("Thumbnail extraction error:", err);
        reject(new ApiError(500, `Thumbnail extraction failed: ${err.message}`));
      });
  });
};

/**
 * Mixes or replaces video audio with a selected audio track.
 * @param {Object} params
 * @param {string} params.videoPath - Local path to input video file
 * @param {string} params.audioPath - Local path or URL to input audio file
 * @param {string} params.outputPath - Local path for output mixed video file
 * @returns {Promise<string>}
 */
const mixVideoAudio = ({ videoPath, audioPath, outputPath }) => {
  return new Promise((resolve, reject) => {
    if (!videoPath || !fs.existsSync(videoPath)) {
      return reject(new ApiError(400, "Valid input video file is required for audio mixing"));
    }
    if (!audioPath) {
      return reject(new ApiError(400, "Valid input audio file or URL is required"));
    }

    const command = ffmpeg().input(videoPath).input(audioPath);

    if (fs.existsSync(audioPath)) {
      command.inputOptions(["-stream_loop -1"]);
    }

    command
      .outputOptions([
        "-map 0:v:0",
        "-map 1:a:0",
        "-c:v libx264",
        "-crf 23",
        "-preset fast",
        "-c:a aac",
        "-b:a 128k",
        "-shortest",
        "-movflags +faststart",
      ])
      .output(outputPath)
      .on("start", (cmd) => {
        console.log("FFmpeg audio mixing process started:", cmd);
      })
      .on("end", () => {
        console.log("FFmpeg audio mixing completed successfully:", outputPath);
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("FFmpeg audio mixing error:", err);
        reject(new ApiError(500, `Audio mixing failed: ${err.message}`));
      });

    command.run();
  });
};

/**
 * Safely removes list of files from disk.
 * @param {Array<string>} filePaths
 */
const cleanupFiles = async (filePaths = []) => {
  for (const filePath of filePaths) {
    if (filePath && fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
        console.log(`Successfully cleaned up temp file: ${filePath}`);
      } catch (err) {
        console.warn(`Failed to delete temp file ${filePath}:`, err.message);
      }
    }
  }
};

module.exports = {
  processVideo,
  extractThumbnail,
  mixVideoAudio,
  cleanupFiles,
};
