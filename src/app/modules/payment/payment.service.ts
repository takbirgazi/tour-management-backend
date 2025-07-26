/* eslint-disable @typescript-eslint/no-explicit-any */
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { generatePDF, IInvoiceData } from "../../utils/invoice";
import { sendEmail } from "../../utils/sendEmail";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { SSLService } from "../sslCommerz/sslcommerz.service";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import statusCode from "http-status-codes";


const initPayment = async (bookingId: string) => {

    const payment = await Payment.findOne({ booking: bookingId });
    if (!payment) {
        throw new AppError(statusCode.NOT_FOUND, "Booking Not Found")
    }

    const booking = await Booking.findById(payment.booking);

    const userAddress = (booking?.user as any).address
    const userEmail = (booking?.user as any).email
    const userName = (booking?.user as any).name
    const userPhone = (booking?.user as any).phone

    const sslPayment = await SSLService.sslPaymentInit({
        address: userAddress,
        amount: payment.amount,
        email: userEmail,
        name: userName,
        phoneNumber: userPhone,
        transactionId: payment.transactionId,
    });

    return {
        paymentUrl: sslPayment.GatewayPageURL
    }

};

const successPayment = async (query: Record<string, string>) => {

    const session = await Booking.startSession();
    session.startTransaction()

    try {

        const updatePayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.PAID
        }, { new: true, runValidators: true, session: session });

        const updateBooking = await Booking.findOneAndUpdate(
            updatePayment?.booking,
            {
                status: BOOKING_STATUS.COMPLETE
            },
            { new: true, runValidators: true, session: session })
            .populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment")

        if (!updateBooking) {
            throw new AppError(statusCode.NOT_FOUND, "Booking Not Found");
        }
        if (!updatePayment) {
            throw new AppError(statusCode.NOT_FOUND, "Payment Not Found");
        }

        const invoiceData: IInvoiceData = {
            bookingDate: updateBooking.createdAt as Date,
            guestCount: updateBooking.gestCount,
            totalAmount: updatePayment.amount,
            tourTitle: (updateBooking.tour as any).title,
            transactionId: updatePayment.transactionId,
            userName: (updateBooking.user as any).name,
        }

        const pdfBuffer = await generatePDF(invoiceData);
        const cloudinaryInvoice = await uploadBufferToCloudinary(pdfBuffer, "invoice");

        await Payment.findByIdAndUpdate(updatePayment._id, { invoiceUrl: cloudinaryInvoice?.secure_url }, { runValidators: true, session });

        await sendEmail({
            to: (updateBooking.user as any).email,
            subject: "Booking Invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [
                {
                    filename: "invoice.pdf",
                    content: pdfBuffer,
                    contentType: "application/pdf"
                }
            ]
        })

        await session.commitTransaction();
        session.endSession();
        return { success: true, message: "Payment Successful!" }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error
    }
};

const failPayment = async (query: Record<string, string>) => {

    const session = await Booking.startSession();
    session.startTransaction()

    try {

        const updatePayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.FAILED
        }, { runValidators: true, session: session });

        await Booking.findOneAndUpdate(
            updatePayment?.booking,
            {
                status: BOOKING_STATUS.FAILED
            },
            { runValidators: true, session: session })

        await session.commitTransaction();
        session.endSession();
        return { success: false, message: "Payment Failed!" }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error
    }
};

const cancelPayment = async (query: Record<string, string>) => {

    const session = await Booking.startSession();
    session.startTransaction()

    try {

        const updatePayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.CANCELLED
        }, { runValidators: true, session: session });

        await Booking.findOneAndUpdate(
            updatePayment?.booking,
            {
                status: BOOKING_STATUS.CANCEL
            },
            { runValidators: false, session: session })

        await session.commitTransaction();
        session.endSession();
        return { success: false, message: "Payment Canceled!" }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error
    }
};

const getInvoiceDownloadUrl = async (paymentId: string) => {
    const payment = await Payment.findById(paymentId)
        .select("invoiceUrl")

    if (!payment) {
        throw new AppError(401, "Payment not found")
    }

    if (!payment.invoiceUrl) {
        throw new AppError(401, "No invoice found")
    }

    return payment.invoiceUrl
};

export const PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl,
}