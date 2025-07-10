import { Request, Response } from "express";
import httpStatusCode from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserServices.createUser(req.body);
    sendResponse(res, {
        statusCode: httpStatusCode.CREATED,
        success: true,
        message: "User Created Successfully!",
        data: user
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
};