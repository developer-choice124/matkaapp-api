import express from "express";
import * as bodyParser from "body-parser";

import { betPlaced, betAnnounce, get_betting, betresult, all_betting, get_books, get_live_books, get_lottery, betting_by_user,get_pl_by_digit, get_pl_by_suggestiondigit, betting_by_lotteryid, get_total, betting_by_digit } from "../src/controllers/Betting.controller";
import { jwtMiddleware } from "../src/middlewares/jwt.middleware";

let betting_router = express.Router();
let body_Parser = bodyParser.json();
betting_router.use(jwtMiddleware);

betting_router.post('/bet-placed', body_Parser, betPlaced);
betting_router.post('/bet-result', body_Parser, betresult);
betting_router.post('/bet-announce', body_Parser, betAnnounce);
betting_router.post('/get_betting/:id/:lottery_id', body_Parser, get_betting);
betting_router.post('/betting_by_user', body_Parser, betting_by_user);
betting_router.post('/betting_by_lotteryid', body_Parser, betting_by_lotteryid);
betting_router.post('/betting_by_digit', body_Parser, betting_by_digit);
betting_router.post('/all_betting/:slug', body_Parser, all_betting);
betting_router.post('/get_pl_by_digit', body_Parser, get_pl_by_digit);
betting_router.post('/get_pl_by_suggestiondigit', body_Parser, get_pl_by_suggestiondigit);
betting_router.get('/get_total/:role/:id', body_Parser, get_total);
betting_router.get('/get_books/:user_id/:lottery_id', body_Parser, get_books);
betting_router.get('/get_live_books/:lottery_id', body_Parser, get_live_books);
betting_router.get('/get_lottery/:lottery_id', body_Parser, get_lottery);
export {
    betting_router
};