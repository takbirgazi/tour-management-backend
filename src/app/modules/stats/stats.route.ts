import { Router } from "express";
import { StatsController } from "./stats.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../users/user.interface";


const router = Router();

router.get("/booking", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), StatsController.getBookingStats);
router.get("/payment", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), StatsController.getPaymentStats);
router.get("/user", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), StatsController.getUserStats);
router.get("/tour", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), StatsController.getTourStats);


export const StatRouters = router;