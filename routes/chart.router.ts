import express from "express";
import * as bodyParser from "body-parser";

import { get,create,getOne,update , check, deleteOne} from "../src/controllers/Chart.controller";
import { jwtMiddleware } from "../src/middlewares/jwt.middleware";

let chart_router = express.Router();
let body_Parser = bodyParser.json();
chart_router.use(jwtMiddleware);

chart_router.post('/get-chart', body_Parser, get);
chart_router.post('/check-chart', body_Parser, check);
chart_router.get('/get-chart/:id', body_Parser, getOne);
chart_router.get('/delete-chart/:id', body_Parser, deleteOne);
chart_router.post('/get-chart-lottery-id/:id', body_Parser, get);
chart_router.post('/add-chart', body_Parser, create);
chart_router.post('/update-chart/:id', body_Parser, update);

export {
    chart_router
};