import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { Role } from "../users/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";



const router = Router();

router.post("/init-payment/:bookingId", PaymentController.initPayment);
router.post("/success", PaymentController.successPayment);
router.post("/fail", PaymentController.failPayment);
router.post("/cancel", PaymentController.cancelPayment);
router.get("/invoice/:paymentId", checkAuth(...Object.values(Role)), PaymentController.getInvoiceDownloadUrl);


export const PaymentRoutes = router;