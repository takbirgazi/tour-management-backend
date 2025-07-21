/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export enum PAYMENT_STATUS {
    PAID = "PAID",
    UNPAID = "UNPAID",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED",
    REFUND = "REFUND"
}

export interface IPayment {
    booking: Types.ObjectId,
    transactionId: string,
    amount: number,
    paymentGetawayData?: any,
    invoiceUrl?: string,
    status: PAYMENT_STATUS
}