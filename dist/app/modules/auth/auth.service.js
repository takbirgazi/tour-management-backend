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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
const credentialLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const isExistUser = yield user_model_1.User.findOne({ email });
    if (!isExistUser) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User doesn't Exist!");
    }
    const isPasswordMath = yield bcryptjs_1.default.compare(password, isExistUser.password);
    if (!isPasswordMath) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Incorrect Password!");
    }
    const userToken = (0, userTokens_1.createUserTokens)(isExistUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = isExistUser.toObject(), { password: noPass } = _a, rest = __rest(_a, ["password"]);
    return {
        accessToken: userToken.accessToken,
        refreshToken: userToken.refreshToken,
        user: rest
    };
});
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
    if (isOldPasswordMatch) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Old Password Doesn't Match!");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    user.password = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    user.save();
});
exports.AuthService = {
    credentialLogin,
    getNewAccessToken,
    resetPassword,
};
