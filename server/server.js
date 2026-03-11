require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./connectDB");
const errorHandler = require("./middlewares/errorHandler");
const http = require("http");
const { Server } = require("socket.io");

// Initialize Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_ORIGIN || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5176"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log(`[SOCKET] User connected: ${socket.id}`);
  socket.on("join_interview", (interviewId) => {
    socket.join(interviewId);
    console.log(`[SOCKET] User joined room: ${interviewId}`);
  });
  socket.on("disconnect", () => {
    console.log(`[SOCKET] User disconnected: ${socket.id}`);
  });
});

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Required for cross-origin images/videos
}));

app.use(cors({
  origin: [
    process.env.CLIENT_ORIGIN || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5176"
  ],
  credentials: true
}));

app.use(morgan("dev"));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use("/api/", limiter);

// Basic Route
app.get("/", (req, res) => {
  res.json({ message: "InterviewIQ Industry-Level API v1.2", secure: true });
});

// Production Routes
const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);

// Error Handling
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`[SERVER] Industry-ready node listening on port ${PORT}`);
});
