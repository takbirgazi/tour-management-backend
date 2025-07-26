import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createZodSchema = z.object({
    name: z.string({ invalid_type_error: "Name must be string" }).min(3, { message: "Name must be minimum 3 character" }),
    email: z.string({ invalid_type_error: "Email must be string" }).email({ message: "invalid email formate" }),
    password: z.string().min(8, { message: "Password must minimum 8 characters" }).regex(/^(?=.*[A-Z])/, { message: "Password must contain at least 1 uppercase letter" }).regex(/^(?=.*[!@#$%^&*])/, { message: "Password must contain at least 1 special character" }).regex(/^(?=.*\d)/, { message: "Password must contain at least 1 number" }),
    phone: z.string({ invalid_type_error: "Phone must be string" }).regex(/^(?:\+8801\d{9}|01\d{9})$/, { message: "Phone Number not valid" }).optional(),
    address: z.string({ invalid_type_error: "Address must be string" }).optional(),
});

export const updateZodSchema = z.object({
    name: z.string({ invalid_type_error: "Name must be string" }).min(3, { message: "Name must be minimum 3 character" }).optional(),
    // password: z.string().min(8, { message: "Password must minimum 8 characters" }).regex(/^(?=.*[A-Z])/, { message: "Password must contain at least 1 uppercase letter" }).regex(/^(?=.*[!@#$%^&*])/, { message: "Password must contain at least 1 special character" }).regex(/^(?=.*\d)/, { message: "Password must contain at least 1 number" }).optional(),
    role: z.enum(Object.values(Role) as [string]).optional(),
    isActive: z.enum(Object.values(IsActive) as [string]).optional(),
    isDeleted: z.boolean({ invalid_type_error: "isDeleted must be true or false" }).optional(),
    isVerified: z.boolean({ invalid_type_error: "isVerified must be true or false" }).optional(),
    phone: z.string({ invalid_type_error: "Phone must be string" }).regex(/^(?:\+8801\d{9}|01\d{9})$/, { message: "Phone Number not valid" }).optional(),
    address: z.string({ invalid_type_error: "Address must be string" }).optional(),
});