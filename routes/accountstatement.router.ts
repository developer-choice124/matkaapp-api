import express from "express";
import * as bodyParser from "body-parser";

import { accountstatement,update } from "../src/controllers/Accountstatement.controller";
import { jwtMiddleware } from "../src/middlewares/jwt.middleware";

let accountstatement_router = express.Router();
let body_Parser = bodyParser.json();
accountstatement_router.use(jwtMiddleware);


accountstatement_router.post('/accountstatement/:id',body_Parser, accountstatement);
accountstatement_router.post('/accountstatement-update/',body_Parser, update);

export {
    accountstatement_router
};