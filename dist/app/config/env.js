"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loadEnv = () => {
    const requireVar = ["PORT", "DB_URL", "NODE_ENV"];
    requireVar.forEach(key => {
        if (!process.env[key]) {
            throw Error(`Missing Environment Variable ${key}`);
        }
    });
    return {
        PORT: process.env.PORT,
        DB_URL: process.env.DB_URL,
        NODE_ENV: process.env.NODE_ENV,
    };
};
exports.envVars = loadEnv();
