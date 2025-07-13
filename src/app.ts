import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalError } from "./app/middlewares/globalErrorHandlers";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors())

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        "message": "Welcome to tour management"
    })
});


// Global Error Handle 
app.use(globalError);
// Not Found Route
app.use(notFound);

export default app;