import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatusCode from 'http-status-codes';
import { AuthService } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";


const credentialLogin = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.credentialLogin(req.body);

    // Set Cookies
    setAuthCookie(res, user);

    sendResponse(res, {
        statusCode: httpStatusCode.OK,
        success: true,
        message: "Log In Successfully!",
        data: user
    })
});

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(httpStatusCode.BAD_REQUEST, "No Refresh token get from cookies!")
    }
    const tokenInfo = await AuthService.getNewAccessToken(refreshToken);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        statusCode: httpStatusCode.OK,
        success: true,
        message: "Get Token Successfully!",
        data: tokenInfo
    })
});

const logOut = catchAsync(async (req: Request, res: Response) => {

    // destroy cookies
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    sendResponse(res, {
        statusCode: httpStatusCode.OK,
        success: true,
        message: "Log Out Successfully!",
        data: null
    })
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {

    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword;
    const decodedToken = req.user;
    await AuthService.resetPassword(oldPassword, newPassword, decodedToken);


    sendResponse(res, {
        statusCode: httpStatusCode.OK,
        success: true,
        message: "Password Changed Successfully!",
        data: null
    })
});

export const AuthControllers = {
    credentialLogin,
    getNewAccessToken,
    logOut,
    resetPassword,
}