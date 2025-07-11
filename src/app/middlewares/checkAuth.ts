import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { NextFunction, Request, Response } from "express";

;

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken) {
            throw new AppError(403, "No Access Token Found");
        }
        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;
        if (!verifiedToken) {
            throw new AppError(403, "You are not authorize!");
        }
        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "You can't access!");
        }

        req.user = verifiedToken;

        next();
    } catch (err) {
        next(err);
    }

}