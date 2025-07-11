import AppError from "../../errorHelpers/AppError";
import { IUser } from "../users/user.interface";
import statusCode from 'http-status-codes';
import { User } from "../users/user.model";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/jwt";
import { envVars } from "../../config/env";

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
    const jwtPayload = {
        userId: isExistUser._id,
        email: isExistUser.email,
        role: isExistUser.role,
    };

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);

    return {
        accessToken
    }

};

export const AuthService = {
    credentialLogin,
}