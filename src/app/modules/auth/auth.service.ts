/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import statusCode from 'http-status-codes';
import { User } from "../users/user.model";
import bcrypt from "bcryptjs";
import { newAccessTokenByRefreshToken } from "../../utils/userTokens";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { IAuthProvider, IsActive } from "../users/user.interface";
import { sendEmail } from "../../utils/sendEmail";

/**
 * Its Handle by passport local
 * 
 const credentialLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;
    const isExistUser = await User.findOne({ email });

    if (!isExistUser) {
        throw new AppError(statusCode.BAD_REQUEST, "User doesn't Exist!");
    }

    const isPasswordMath = await bcrypt.compare(password as string, isExistUser.password as string);

    if (!isPasswordMath) {
        throw new AppError(statusCode.BAD_REQUEST, "Incorrect Password!");
    }

    const userToken = createUserTokens(isExistUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: noPass, ...rest } = isExistUser.toObject();

    return {
        accessToken: userToken.accessToken,
        refreshToken: userToken.refreshToken,
        user: rest
    }
};
 */

// Generate New Access Token by refresh token
const getNewAccessToken = async (refreshToken: string) => {

    const newAccessToken = await newAccessTokenByRefreshToken(refreshToken);

    return {
        accessToken: newAccessToken,
    }
};

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId);

    if (!user) {
        throw new AppError(statusCode.NOT_FOUND, "User not found");
    }

    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password as string);
    if (!isOldPasswordMatch) {
        throw new AppError(statusCode.UNAUTHORIZED, "Old Password does not match");
    }

    user.password = await bcrypt.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));

    await user.save();
}

const setPassword = async (userId: string, plainPassword: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    if (user.password && user.auths.some(providerObject => providerObject.provider === "google")) {
        throw new AppError(statusCode.BAD_REQUEST, "You have already set you password. Now you can change the password from your profile password update")
    }

    const hashedPassword = await bcrypt.hash(
        plainPassword,
        Number(envVars.BCRYPT_SALT_ROUND)
    )

    const credentialProvider: IAuthProvider = {
        provider: "credential",
        providerId: user.email
    }

    const auths: IAuthProvider[] = [...user.auths, credentialProvider]

    user.password = hashedPassword

    user.auths = auths

    await user.save()
}

const forgotPassword = async (email: string) => {
    const isUserExist = await User.findOne({ email });

    if (!isUserExist) {
        throw new AppError(statusCode.BAD_REQUEST, "User does not exist")
    }
    if (!isUserExist.isVerified) {
        throw new AppError(statusCode.BAD_REQUEST, "User is not verified")
    }
    if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
        throw new AppError(statusCode.BAD_REQUEST, `User is ${isUserExist.isActive}`)
    }
    if (isUserExist.isDeleted) {
        throw new AppError(statusCode.BAD_REQUEST, "User is deleted")
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
        expiresIn: "10m"
    })

    const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`

    sendEmail({
        to: isUserExist.email,
        subject: "Password Reset",
        templateName: "forgetPassword",
        templateData: {
            name: isUserExist.name,
            resetUILink
        }
    })

    /**
     * http://localhost:5173/reset-password?id=687f310c724151eb2fcf0c41&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODdmMzEwYzcyNDE1MWViMmZjZjBjNDEiLCJlbWFpbCI6InNhbWluaXNyYXI2QGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzUzMTY2MTM3LCJleHAiOjE3NTMxNjY3Mzd9.LQgXBmyBpEPpAQyPjDNPL4m2xLF4XomfUPfoxeG0MKg
     */
}

const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {
    if (payload.id != decodedToken.userId) {
        throw new AppError(401, "You can not reset your password")
    }

    const isUserExist = await User.findById(decodedToken.userId)
    if (!isUserExist) {
        throw new AppError(401, "User does not exist")
    }

    const hashedPassword = await bcrypt.hash(
        payload.newPassword,
        Number(envVars.BCRYPT_SALT_ROUND)
    )

    isUserExist.password = hashedPassword;

    await isUserExist.save()
}

export const AuthService = {
    getNewAccessToken,
    resetPassword,
    changePassword,
    setPassword,
    forgotPassword
}