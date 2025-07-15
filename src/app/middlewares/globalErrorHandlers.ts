import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleCastError } from "../helpers/handleCastError";
import { handleZodError } from "../helpers/handelZodError";
import { handelValidationError } from "../helpers/handleValidationError";
import { TErrorSources } from "../interfaces/error.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export const globalError = (err: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode = 500;
    let message = `Something Went Wrong`
    let errorsSources: TErrorSources[] = [];

    // Mongoose duplicate error
    if (err.code === 11000) {
        const simplifiedError = handleDuplicateError(err)
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message
    }
    // Mongoose Object Id cast error
    else if (err.name === "CastError") {
        const simplifiedError = handleCastError(err)
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message
    }
    // Zod Validation Error 
    else if (err.name === "ZodError") {
        const simplifiedError = handleZodError(err)
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message
        errorsSources = simplifiedError.errorSources as TErrorSources[]
    }
    // Mongoose Validation Error 
    else if (err.name === "ValidationError") {
        const simplifiedError = handelValidationError(err)
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorsSources = simplifiedError.errorSources as TErrorSources[]
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        statusCode = 500;
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorsSources,
        err: envVars.NODE_ENV === "development" ? err : null,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}