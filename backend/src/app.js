import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

// CORS — must be the very first middleware so preflight OPTIONS requests
// are handled before any route or cookie logic runs.
// credentials: true is required for the browser to send/receive
// HTTP-only cookies (accessToken, refreshToken).
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

//MiddleWares
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use(express.static("public"));


//routes
import { userRouter } from "../src/routes/users.routes.js"
import { problemRouter } from "../src/routes/problems.routes.js";
import { listRouter } from "../src/routes/list.routes.js";
import { globalErrorHandler } from "../src/middlewares/error.middleware.js"

app.use('/api/v1/user', userRouter);
app.use('/api/v1/problem', problemRouter);
app.use('/api/v1/list', listRouter);

app.use(globalErrorHandler);

export { app };