import express from "express";
import * as bodyParser from "body-parser";

import { accountstatement,update } from "../src/controllers/ThirdpartyAccountstatement.controller";
import { jwtMiddleware } from "../src/middlewares/jwt.middleware";

let thirdparty_accountstatement_router = express.Router();
let body_Parser = bodyParser.json();
thirdparty_accountstatement_router.use(jwtMiddleware);

thirdparty_accountstatement_router.post('/accountstatement_otherplateform/:id', body_Parser, accountstatement);
thirdparty_accountstatement_router.post('/accountstatement_otherplateform-update/', body_Parser, update);

export {
    thirdparty_accountstatement_router
};