import { Types } from "mongoose";

export enum BOOKING_STATUS {
    PENDING = "PENDING",
    COMPLETE = "COMPLETE",
    CANCEL = "CANCEL",
    FAILED = "FAILED"
}

export interface IBooking {
    user: Types.ObjectId,
    tour: Types.ObjectId,
    payment?: Types.ObjectId,
    gestCount: number,
    status: BOOKING_STATUS
}