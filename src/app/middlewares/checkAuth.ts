import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { NextFunction, Request, Response } from "express";
import { User } from "../modules/users/user.model";
import statusCode from 'http-status-codes';
import { IsActive } from "../modules/users/user.interface";


export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken) {
            throw new AppError(403, "No Access Token Found");
        }
        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;

        const isExistUser = await User.findOne({ email: verifiedToken.email });

        if (!isExistUser) {
            throw new AppError(statusCode.BAD_REQUEST, "User doesn't Exist!");
        }
        if (isExistUser.isActive === IsActive.BLOCKED || isExistUser.isActive === IsActive.INACTIVE) {
            throw new AppError(statusCode.BAD_REQUEST, `User is ${isExistUser.isActive}`);
        }
        if (isExistUser.isDeleted) {
            throw new AppError(statusCode.BAD_REQUEST, "User is deleted");
        }

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