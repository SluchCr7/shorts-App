require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const connectDB = require("./config/db");
const apiRouter = require("./routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middlewares
app.use(helmet());

// CORS Setup (allow credentials for HTTP-only cookies across domains)
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, origin || true);
      }
    },
    credentials: true,
  })
);

// Standard Body & Cookie Parsing Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Serverless DB Auto-Connect Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    // Continue even if DB fails so health check / errors can be rendered
    next();
  }
});

// Health check endpoints
app.get(["/health", "/"], (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Register API Routes (support /api/v1, /api, and root prefix)
app.use("/api/v1", apiRouter);
app.use("/api", apiRouter);
app.use("/", apiRouter);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    statusCode: 404,
    message: `Route not found - ${req.originalUrl}`,
    success: false,
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server for local development
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`=================================`);
        console.log(`🚀 Video Shorts API Server running on port ${PORT}`);
        console.log(`🌐 Base URL: http://localhost:${PORT}/api/v1`);
        console.log(`=================================`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
    }
  };
  startServer();
}

module.exports = app;
