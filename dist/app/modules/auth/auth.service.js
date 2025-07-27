"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = require("../users/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userTokens_1 = require("../../utils/userTokens");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const user_interface_1 = require("../users/user.interface");
const sendEmail_1 = require("../../utils/sendEmail");
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
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userTokens_1.newAccessTokenByRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken,
    };
});
const changePassword = (oldPassword, newPassword, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedToken.userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    const isOldPasswordMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Old Password does not match");
    }
    user.password = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    yield user.save();
});
const setPassword = (userId, plainPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(404, "User not found");
    }
    if (user.password && user.auths.some(providerObject => providerObject.provider === "google")) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You have already set you password. Now you can change the password from your profile password update");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(plainPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const credentialProvider = {
        provider: "credential",
        providerId: user.email
    };
    const auths = [...user.auths, credentialProvider];
    user.password = hashedPassword;
    user.auths = auths;
    yield user.save();
});
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User does not exist");
    }
    if (!isUserExist.isVerified) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is not verified");
    }
    if (isUserExist.isActive === user_interface_1.IsActive.BLOCKED || isUserExist.isActive === user_interface_1.IsActive.INACTIVE) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `User is ${isUserExist.isActive}`);
    }
    if (isUserExist.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is deleted");
    }
    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    };
    const resetToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.envVars.JWT_ACCESS_SECRET, {
        expiresIn: "10m"
    });
    const resetUILink = `${env_1.envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;
    (0, sendEmail_1.sendEmail)({
        to: isUserExist.email,
        subject: "Password Reset",
        templateName: "forgetPassword",
        templateData: {
            name: isUserExist.name,
            resetUILink
        }
    });
    /**
     * http://localhost:5173/reset-password?id=687f310c724151eb2fcf0c41&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODdmMzEwYzcyNDE1MWViMmZjZjBjNDEiLCJlbWFpbCI6InNhbWluaXNyYXI2QGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzUzMTY2MTM3LCJleHAiOjE3NTMxNjY3Mzd9.LQgXBmyBpEPpAQyPjDNPL4m2xLF4XomfUPfoxeG0MKg
     */
});
const resetPassword = (payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.id != decodedToken.userId) {
        throw new AppError_1.default(401, "You can not reset your password");
    }
    const isUserExist = yield user_model_1.User.findById(decodedToken.userId);
    if (!isUserExist) {
        throw new AppError_1.default(401, "User does not exist");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    isUserExist.password = hashedPassword;
    yield isUserExist.save();
});
exports.AuthService = {
    getNewAccessToken,
    resetPassword,
    changePassword,
    setPassword,
    forgotPassword
};
