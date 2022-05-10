import express from "express";
import * as bodyParser from "body-parser";

import { add, allListbyuserId, aggregateChilps, getChipsDetailsByDate } from "../src/controllers/Chips.controller";
import { jwtMiddleware } from "../src/middlewares/jwt.middleware";

let chips_router = express.Router();
let body_Parser = bodyParser.json();
chips_router.use(jwtMiddleware);

chips_router.post('/add-chips', body_Parser, add);
chips_router.post('/add-chips-request', body_Parser, add);
chips_router.post('/chip-history-by-userId/:id', body_Parser, allListbyuserId);
chips_router.get("/chips/:_id/:page", body_Parser, aggregateChilps);
chips_router.get("/chips/:_id/:sort/:from/:to", body_Parser, aggregateChilps);
chips_router.get("/chipsbydate/:id/:from/:to/:page", getChipsDetailsByDate)
export {
    chips_router
};