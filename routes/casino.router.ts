import express from "express";
import * as bodyParser from "body-parser";

import { get_user,getbalance, confirmbet, placeBet, profitloss, rollbackProfitloss } from "../src/controllers/Casino.controller";

import { casinoMiddleware } from "../src/middlewares/jwt.middleware";

let casino_router = express.Router();
let body_Parser = bodyParser.text({
    type: 'application/json'
  });

casino_router.post('/get-user', body_Parser, casinoMiddleware, get_user);
casino_router.post('/get-balance', body_Parser, casinoMiddleware, getbalance);
casino_router.post('/confirm-bet', body_Parser, casinoMiddleware, confirmbet);
casino_router.post('/place-bet', body_Parser, casinoMiddleware, placeBet);
casino_router.post('/profitloss', body_Parser, casinoMiddleware, profitloss);
casino_router.post('/rollback-profitloss', body_Parser, casinoMiddleware, rollbackProfitloss);

export {
    casino_router
};