import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { envVars } from "../../config/env";
import sendResponse from "../../utils/sendResponse";
import { SSLService } from "../sslCommerz/sslcommerz.service";

const initPayment = catchAsync(async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId;
    const result = await PaymentService.initPayment(bookingId as string);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Payment successfully!",
        data: result,
    });
});

const successPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await PaymentService.successPayment(query as Record<string, string>);

    if (result.success) {
        res.redirect(`${envVars.FRONTEND_URL}/payment/success?transactionId=${query.transactionId}&amount=${query.amount}&status=success`)
    }
});

const failPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await PaymentService.failPayment(query as Record<string, string>);

    if (!result.success) {
        res.redirect(`${envVars.FRONTEND_URL}/payment/fail?transactionId=${query.transactionId}&amount=${query.amount}&status=fail`)
    }
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await PaymentService.cancelPayment(query as Record<string, string>);

    if (!result.success) {
        res.redirect(`${envVars.FRONTEND_URL}/payment/cancel?transactionId=${query.transactionId}&amount=${query.amount}&status=cancel`)
    }
});

const getInvoiceDownloadUrl = catchAsync(
    async (req: Request, res: Response) => {
        const { paymentId } = req.params;
        const result = await PaymentService.getInvoiceDownloadUrl(paymentId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Invoice download URL retrieved successfully",
            data: result,
        });
    }
);

const validatePayment = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    await SSLService.validatePayment(payload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment validated successfully",
        data: null,
    });
});


export const PaymentController = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl,
    validatePayment,
}