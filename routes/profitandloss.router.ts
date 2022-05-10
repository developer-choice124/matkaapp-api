import express from "express";
import * as bodyParser from "body-parser";

import { profitandloss,get_total } from "../src/controllers/Profitandloss.controller";
import { jwtMiddleware } from "../src/middlewares/jwt.middleware";

let profitandloss_router = express.Router();
let body_Parser = bodyParser.json();
profitandloss_router.use(jwtMiddleware);

profitandloss_router.post('/profitandloss/:id',body_Parser, profitandloss);
profitandloss_router.get('/get_total_profitloss/:slug/:id',body_Parser, get_total);

export {
    profitandloss_router
};