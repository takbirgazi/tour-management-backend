import { Router } from "express";
import { UserRoutes } from "../modules/users/user.router";


export const router = Router();

const moduleRoute = [
    {
        path: "/user",
        route: UserRoutes
    },
];

moduleRoute.forEach((route) => {
    router.use(route.path, route.route);
});