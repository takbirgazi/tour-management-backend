import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatusCode from 'http-status-codes';
import { AuthService } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserTokens } from "../../utils/userTokens";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";


const credentialLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.authenticate("local", async (err: any, user: any, info: any) => {

        if (err) {
            return next(new AppError(httpStatusCode.FORBIDDEN, err));
        }
        if (!user) {
            return next(new AppError(httpStatusCode.NOT_FOUND, info.message));
        }
        const userToken = await createUserTokens(user);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: noPass, ...rest } = user.toObject();

        // Set Cookies
        setAuthCookie(res, userToken);

        sendResponse(res, {
            statusCode: httpStatusCode.OK,
            success: true,
            message: "Log In Successfully!",
            data: {
                accessToken: userToken.accessToken,
                refreshToken: userToken.refreshToken,
                user: rest
            }
        })
    })(req, res, next)
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

const changePassword = catchAsync(async (req: Request, res: Response) => {

    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user

    await AuthService.changePassword(oldPassword, newPassword, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatusCode.OK,
        message: "Password Changed Successfully",
        data: null,
    })
})

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user
    await AuthService.resetPassword(req.body, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatusCode.OK,
        message: "Password Changed Successfully",
        data: null,
    })
});

const setPassword = catchAsync(async (req: Request, res: Response) => {

    const decodedToken = req.user as JwtPayload
    const { password } = req.body;

    await AuthService.setPassword(decodedToken.userId, password);

    sendResponse(res, {
        success: true,
        statusCode: httpStatusCode.OK,
        message: "Password Changed Successfully",
        data: null,
    })
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {


    const { email } = req.body;

    await AuthService.forgotPassword(email);

    sendResponse(res, {
        success: true,
        statusCode: httpStatusCode.OK,
        message: "Email Sent Successfully",
        data: null,
    })
})

const googleCallback = catchAsync(async (req: Request, res: Response) => {
    let redirectTo = req.query.state ? req.query.state as string : "";
    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1);
    }
    const user = req.user;
    if (!user) {
        throw new AppError(httpStatusCode.NOT_FOUND, "User Not Found")
    };

    const tokenInfo = createUserTokens(user);
    setAuthCookie(res, tokenInfo);

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
})

export const AuthControllers = {
    credentialLogin,
    getNewAccessToken,
    logOut,
    changePassword,
    resetPassword,
    setPassword,
    forgotPassword,
    googleCallback,
}