import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatusCode from 'http-status-codes';
import { AuthService } from "./auth.service";


const credentialLogin = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.credentialLogin(req.body);

    sendResponse(res, {
        statusCode: httpStatusCode.OK,
        success: true,
        message: "Log In Successfully!",
        data: user
    })
});


export const AuthControllers = {
    credentialLogin,
}