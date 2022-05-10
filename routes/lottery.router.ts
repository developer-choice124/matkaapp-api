import express from "express";
import * as bodyParser from "body-parser";

import { create, update, all_list, delete_lottery_market,get,remove_supermaster } from "../src/controllers/Lottery.controller";
import { jwtMiddleware } from "../src/middlewares/jwt.middleware";

let lottery_router = express.Router();
let body_Parser = bodyParser.json();
lottery_router.use(jwtMiddleware);

// Lottery CRUD Operation
lottery_router.post('/lottery', body_Parser, create);
lottery_router.get('/lottery/:id', body_Parser, get);
lottery_router.get('/remove-supermaster/:lottery_id/:supermasterid', body_Parser, remove_supermaster);
lottery_router.post('/delete-lottery/:id', body_Parser, delete_lottery_market);

// Update
lottery_router.post('/all-lottery',body_Parser, jwtMiddleware , all_list);
lottery_router.post('/all-lottery/:slug',body_Parser, jwtMiddleware , all_list);
lottery_router.post('/update-lottery/:id',body_Parser, jwtMiddleware , update);

export {
    lottery_router
};