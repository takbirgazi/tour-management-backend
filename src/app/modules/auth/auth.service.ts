import AppError from "../../errorHelpers/AppError";
import statusCode from 'http-status-codes';
import { User } from "../users/user.model";
import bcrypt from "bcryptjs";
import { newAccessTokenByRefreshToken } from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";

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

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user!.password as string);
    if (!isOldPasswordMatch) {
        throw new AppError(statusCode.UNAUTHORIZED, "Old Password Doesn't Match!")
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    user!.password = await bcrypt.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    user!.save();
};

export const AuthService = {
    getNewAccessToken,
    resetPassword,
}