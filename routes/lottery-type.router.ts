import express from "express";
import * as bodyParser from "body-parser";

import { create, update , readLotteryType, lotterytype_list } from "../src/controllers/LotteryType.controller";
import { jwtMiddleware } from "../src/middlewares/jwt.middleware";

let lottery_type_router = express.Router();
let body_Parser = bodyParser.json();

lottery_type_router.use(jwtMiddleware);

lottery_type_router.post('/lottery-type/list', body_Parser, lotterytype_list);
lottery_type_router.get('/lottery-type/:id', body_Parser, readLotteryType);
lottery_type_router.post('/lottery-type', body_Parser, create);
lottery_type_router.put('/lottery-type', body_Parser, update);
// lottery_type_router.delete('/lottery-type/:id', deleteLotteryType);

export {
    lottery_type_router
};