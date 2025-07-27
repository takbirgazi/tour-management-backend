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
exports.cloudinaryUpload = exports.deleteImageFromCloudinary = exports.uploadBufferToCloudinary = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const stream_1 = __importDefault(require("stream"));
cloudinary_1.v2.config({
    cloud_name: env_1.envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: env_1.envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: env_1.envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});
const uploadBufferToCloudinary = (buffer, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return new Promise((resolve, reject) => {
            const public_id = `pdf/${fileName}-${Date.now()}`;
            const bufferStream = new stream_1.default.PassThrough();
            bufferStream.end(buffer);
            cloudinary_1.v2.uploader.upload_stream({
                resource_type: "auto",
                public_id: public_id,
                folder: "pdf"
            }, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }).end(buffer);
        });
    }
    catch (error) {
        throw new AppError_1.default(401, "Cloudinary PDF Upload failed", error.message);
    }
});
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
const deleteImageFromCloudinary = (imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //https://res.cloudinary.com/djzppynpk/image/upload/v1753126572/ay9roxiv8ue-1753126570086-download-2-jpg.jpg.jpg
        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
        const match = imageUrl.match(regex);
        if (match && match[1]) {
            const public_id = match[1];
            yield cloudinary_1.v2.uploader.destroy(public_id);
        }
    }
    catch (error) {
        throw new AppError_1.default(401, "Cloudinary image deletion failed", error.message);
    }
});
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
exports.cloudinaryUpload = cloudinary_1.v2;
