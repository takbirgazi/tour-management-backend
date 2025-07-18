import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import statusCode from "http-status-codes";
import bcryptjs from "bcryptjs"
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";


const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    const isExistUser = await User.findOne({ email });

    if (isExistUser) {
        throw new AppError(statusCode.BAD_REQUEST, "User Already Exist");
    }

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));

    const authProvider: IAuthProvider = { provider: "credential", providerId: email as string }

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    });
    return user
};

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    const ifUserExist = await User.findById(userId);
    if (!ifUserExist) {
        throw new AppError(statusCode.NOT_FOUND, "User Not Found!")
    }
    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(statusCode.FORBIDDEN, "You are not authorize!")
        }
    }
    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
        throw new AppError(statusCode.FORBIDDEN, "You are not authorize!")
    }
    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(statusCode.FORBIDDEN, "You are not authorize!")
        }
    }
    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND));
    }

    const newUpdateUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });

    return newUpdateUser;
};

const getAllUser = async () => {
    const user = await User.find({});
    const totalUsers = await User.countDocuments();
    return {
        data: user,
        meta: {
            total: totalUsers
        }
    }
};



export const UserServices = {
    createUser,
    getAllUser,
    updateUser,
}