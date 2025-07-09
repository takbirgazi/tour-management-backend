import { NextFunction, Request, Response } from "express";
import httpStatusCode from "http-status-codes";
import { UserServices } from "./user.service";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserServices.createUser(req.body)

        res.status(httpStatusCode.CREATED).json({
            "message": "User Created Successfully!",
            user
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        next(error)
    }
};

export const UserControllers = {
    createUser
}