import express from "express";
import * as bodyParser from "body-parser";

import { profitandloss,get_total ,BetHistory} from "../src/controllers/ThirdpartyProfitandloss.controller";
import { jwtMiddleware } from "../src/middlewares/jwt.middleware";

let thirdparty_profitandloss_router = express.Router();
let body_Parser = bodyParser.json();
thirdparty_profitandloss_router.use(jwtMiddleware);

thirdparty_profitandloss_router.post('/profitandloss_otherplateform/', body_Parser, profitandloss);
thirdparty_profitandloss_router.post('/getcasinoBetHistory/',body_Parser, BetHistory);
// thirdparty_profitandloss_router.get('/get_total_profitloss/:slug/:id', get_total);

export {
    thirdparty_profitandloss_router
};