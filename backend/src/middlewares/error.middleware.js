import { ApiError } from "../utils/apiError.js";

export const globalErrorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Something went wrong on the server";
        error = new ApiError(statusCode, message, error?.stack);
    }
    console.log("error obj = ", err);
    console.log("global error handler");
    console.log("error.message: ", error.message);

    return res
        .status(error.statusCode)
        .json({
            success: false,
            statusCode: error.statusCode,
            message: error.message,
            errors: error.errors || [],
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
};