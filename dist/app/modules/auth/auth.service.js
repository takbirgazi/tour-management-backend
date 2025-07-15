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
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = require("../users/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userTokens_1 = require("../../utils/userTokens");
const env_1 = require("../../config/env");
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
const resetPassword = (oldPassword, newPassword, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedToken.userId);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const isOldPasswordMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Old Password Doesn't Match!");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    user.password = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    user.save();
});
exports.AuthService = {
    getNewAccessToken,
    resetPassword,
};
