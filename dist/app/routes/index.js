"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_router_1 = require("../modules/users/user.router");
exports.router = (0, express_1.Router)();
const moduleRoute = [
    {
        path: "/user",
        route: user_router_1.UserRoutes
    },
];
moduleRoute.forEach((route) => {
    exports.router.use(route.path, route.route);
});
