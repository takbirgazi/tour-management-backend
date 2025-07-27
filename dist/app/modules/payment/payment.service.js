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
exports.PaymentService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const cloudinary_config_1 = require("../../config/cloudinary.config");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const invoice_1 = require("../../utils/invoice");
const sendEmail_1 = require("../../utils/sendEmail");
const booking_interface_1 = require("../booking/booking.interface");
const booking_model_1 = require("../booking/booking.model");
const sslcommerz_service_1 = require("../sslCommerz/sslcommerz.service");
const payment_interface_1 = require("./payment.interface");
const payment_model_1 = require("./payment.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const initPayment = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findOne({ booking: bookingId });
    if (!payment) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking Not Found");
    }
    const booking = yield booking_model_1.Booking.findById(payment.booking);
    const userAddress = (booking === null || booking === void 0 ? void 0 : booking.user).address;
    const userEmail = (booking === null || booking === void 0 ? void 0 : booking.user).email;
    const userName = (booking === null || booking === void 0 ? void 0 : booking.user).name;
    const userPhone = (booking === null || booking === void 0 ? void 0 : booking.user).phone;
    const sslPayment = yield sslcommerz_service_1.SSLService.sslPaymentInit({
        address: userAddress,
        amount: payment.amount,
        email: userEmail,
        name: userName,
        phoneNumber: userPhone,
        transactionId: payment.transactionId,
    });
    return {
        paymentUrl: sslPayment.GatewayPageURL
    };
});
const successPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatePayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.PAID
        }, { new: true, runValidators: true, session: session });
        const updateBooking = yield booking_model_1.Booking.findOneAndUpdate(updatePayment === null || updatePayment === void 0 ? void 0 : updatePayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.COMPLETE
        }, { new: true, runValidators: true, session: session })
            .populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment");
        if (!updateBooking) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking Not Found");
        }
        if (!updatePayment) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Payment Not Found");
        }
        const invoiceData = {
            bookingDate: updateBooking.createdAt,
            guestCount: updateBooking.gestCount,
            totalAmount: updatePayment.amount,
            tourTitle: updateBooking.tour.title,
            transactionId: updatePayment.transactionId,
            userName: updateBooking.user.name,
        };
        const pdfBuffer = yield (0, invoice_1.generatePDF)(invoiceData);
        const cloudinaryInvoice = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(pdfBuffer, "invoice");
        yield payment_model_1.Payment.findByIdAndUpdate(updatePayment._id, { invoiceUrl: cloudinaryInvoice === null || cloudinaryInvoice === void 0 ? void 0 : cloudinaryInvoice.secure_url }, { runValidators: true, session });
        yield (0, sendEmail_1.sendEmail)({
            to: updateBooking.user.email,
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
        });
        yield session.commitTransaction();
        session.endSession();
        return { success: true, message: "Payment Successful!" };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const failPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatePayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.FAILED
        }, { runValidators: true, session: session });
        yield booking_model_1.Booking.findOneAndUpdate(updatePayment === null || updatePayment === void 0 ? void 0 : updatePayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.FAILED
        }, { runValidators: true, session: session });
        yield session.commitTransaction();
        session.endSession();
        return { success: false, message: "Payment Failed!" };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const cancelPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatePayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.CANCELLED
        }, { runValidators: true, session: session });
        yield booking_model_1.Booking.findOneAndUpdate(updatePayment === null || updatePayment === void 0 ? void 0 : updatePayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.CANCEL
        }, { runValidators: false, session: session });
        yield session.commitTransaction();
        session.endSession();
        return { success: false, message: "Payment Canceled!" };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getInvoiceDownloadUrl = (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findById(paymentId)
        .select("invoiceUrl");
    if (!payment) {
        throw new AppError_1.default(401, "Payment not found");
    }
    if (!payment.invoiceUrl) {
        throw new AppError_1.default(401, "No invoice found");
    }
    return payment.invoiceUrl;
});
exports.PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl,
};
