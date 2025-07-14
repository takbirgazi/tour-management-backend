import { Request, Response } from "express";
import httpStatusCode from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserServices.createUser(req.body);
    sendResponse(res, {
        statusCode: httpStatusCode.CREATED,
        success: true,
        message: "User Created Successfully!",
        data: user
    })
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
    const userId = await req.params.id;
    // const token = req.headers.authorization;
    // const decodedToken = verifyToken(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload;
    const decodedToken = req.user;
    const payload = req.body;

    const updateData = await UserServices.updateUser(userId, payload, decodedToken as JwtPayload);

    sendResponse(res, {
        statusCode: httpStatusCode.CREATED,
        success: true,
        message: "User Updated Successfully!",
        data: updateData
    })
});

const getAllUser = catchAsync(async (req: Request, res: Response) => {
    const users = await UserServices.getAllUser();
    sendResponse(res, {
        statusCode: httpStatusCode.OK,
        success: true,
        message: "User Retrieve Successfully!",
        meta: {
            total: users.meta.total
        },
        data: users.data,
    });
});

export const UserControllers = {
    createUser,
    getAllUser,
    updateUser,
};