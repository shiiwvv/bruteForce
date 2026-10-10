import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

const allowedOrigins = [
  "https://bruteforce-frontend.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS — must be the very first middleware so preflight OPTIONS requests
// are handled before any route or cookie logic runs.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isExactMatch = allowedOrigins.includes(origin) || origin.includes("localhost");

      const isVercelPreview = 
        origin.startsWith("https://bruteforce-frontend") && 
        origin.endsWith(".vercel.app");

      if (isExactMatch || isVercelPreview) {
        return callback(null, true);
      }
      
      return callback(new Error(`Blocked by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

app.options('/(.*)', cors());

// MiddleWares
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use(express.static("public"));

// Routes
import { userRouter } from "../src/routes/users.routes.js";
import { problemRouter } from "../src/routes/problems.routes.js";
import { listRouter } from "../src/routes/list.routes.js";
import { globalErrorHandler } from "../src/middlewares/error.middleware.js";

app.use('/api/v1/user', userRouter);
app.use('/api/v1/problem', problemRouter);
app.use('/api/v1/list', listRouter);

app.use(globalErrorHandler);

export { app };