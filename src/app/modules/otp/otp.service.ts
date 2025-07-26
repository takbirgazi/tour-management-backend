import crypto from "crypto";
import AppError from "../../errorHelpers/AppError";
import { User } from "../users/user.model";
import { redisClient } from "../../config/redis.config";
import { sendEmail } from "../../utils/sendEmail";
import statusCode from "http-status-codes";



const OTP_EXPIRATION = 2 * 60 // 2minute

const generateOtp = (length = 6) => {
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
    return otp;
};

const sendOTP = async (email: string, name: string) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(statusCode.NOT_FOUND, "User Not Found")
    }

    if (user.isVerified) {
        throw new AppError(statusCode.BAD_REQUEST, "You are already verified")
    }

    const otp = generateOtp();
    const redisKey = `otp:${email}`

    await redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION
        }
    });

    await sendEmail({
        to: email,
        subject: "OTP for Verification",
        templateName: `otp`,
        templateData: {
            name,
            otp
        }
    })

};

const verifyOTP = async (email: string, otp: string) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(statusCode.NOT_FOUND, "User Not Found")
    }

    if (user.isVerified) {
        throw new AppError(statusCode.BAD_REQUEST, "You are already verified")
    }

    const redisKey = `otp:${email}`
    const savedOtp = await redisClient.get(redisKey);
    if (!savedOtp) {
        throw new AppError(statusCode.NOT_FOUND, "OTP not found or expired");
    }

    if (savedOtp !== otp) {
        throw new AppError(statusCode.NOT_FOUND, "OTP not valid");
    }

    await Promise.all([
        User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
        redisClient.del([redisKey]),
    ])
};

export const OTPService = {
    sendOTP,
    verifyOTP
}