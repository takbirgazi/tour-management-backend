"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateZodSchema = exports.createZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createZodSchema = zod_1.default.object({
    name: zod_1.default.string({ invalid_type_error: "Name must be string" }).min(3, { message: "Name must be minimum 3 character" }),
    email: zod_1.default.string({ invalid_type_error: "Email must be string" }).email({ message: "invalid email formate" }),
    password: zod_1.default.string().min(8, { message: "Password must minimum 8 characters" }).regex(/^(?=.*[A-Z])/, { message: "Password must contain at least 1 uppercase letter" }).regex(/^(?=.*[!@#$%^&*])/, { message: "Password must contain at least 1 special character" }).regex(/^(?=.*\d)/, { message: "Password must contain at least 1 number" }),
    phone: zod_1.default.string({ invalid_type_error: "Phone must be string" }).regex(/^(?:\+8801\d{9}|01\d{9})$/, { message: "Phone Number not valid" }).optional(),
    address: zod_1.default.string({ invalid_type_error: "Address must be string" }).optional(),
});
exports.updateZodSchema = zod_1.default.object({
    name: zod_1.default.string({ invalid_type_error: "Name must be string" }).min(3, { message: "Name must be minimum 3 character" }).optional(),
    password: zod_1.default.string().min(8, { message: "Password must minimum 8 characters" }).regex(/^(?=.*[A-Z])/, { message: "Password must contain at least 1 uppercase letter" }).regex(/^(?=.*[!@#$%^&*])/, { message: "Password must contain at least 1 special character" }).regex(/^(?=.*\d)/, { message: "Password must contain at least 1 number" }).optional(),
    role: zod_1.default.enum(Object.values(user_interface_1.Role)).optional(),
    isActive: zod_1.default.enum(Object.values(user_interface_1.IsActive)).optional(),
    isDeleted: zod_1.default.boolean({ invalid_type_error: "isDeleted must be true or false" }).optional(),
    isVerified: zod_1.default.boolean({ invalid_type_error: "isVerified must be true or false" }).optional(),
    phone: zod_1.default.string({ invalid_type_error: "Phone must be string" }).regex(/^(?:\+8801\d{9}|01\d{9})$/, { message: "Phone Number not valid" }).optional(),
    address: zod_1.default.string({ invalid_type_error: "Address must be string" }).optional(),
});
