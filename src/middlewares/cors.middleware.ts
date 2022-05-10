import cors from "cors";
import express from "express";
import { config } from "../../config/config";

var corsMiddlewareRouter = express.Router();
const options: cors.CorsOptions = config.corsOptions;
corsMiddlewareRouter.use(cors(options));
corsMiddlewareRouter.options("*", cors(options));

export {
    corsMiddlewareRouter
};