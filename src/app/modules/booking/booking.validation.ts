import z from "zod";
import { BOOKING_STATUS } from "./booking.interface";

export const createBookingZodSchema = z.object({
    tour: z.string({ invalid_type_error: "tour must be string" }),
    gestCount: z.number({ invalid_type_error: "gestCount must be number" }).int().positive(),
});

export const updateBookingStatusZodSchema = z.object({
    status: z.enum(Object.values(BOOKING_STATUS) as [string])
})