import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { RFC, VALIDATION_ERROR,COMMON_SUCCESS,LOTTERY_CREATED } from "../../config/global";

import { LotteryDataType } from "../data-model/LotteryData";
import { successMsg, errorMsg } from "../helpers/formatter.helper";
import { validator } from "../helpers/validator.helper";
import { LotteryType } from "../models/LotteryType";

export function create(req: Request, res: Response, next: NextFunction) {

    const rules = {
        "bet_type": "required",
        "min_stake": "required",
        "max_stake": "required",
        "rate": "required",
        "lottery_id": "required"
    };

    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body: LotteryDataType = req.body;
            body.lottery_id = new ObjectId(body.lottery_id);
            body.created_at = new Date();

            var where = { lottery_id: body.lottery_id,bet_type:body.bet_type };

            LotteryType.findOne(where).then((Exist: any) => {
                if(Exist.length>0){
                    res.status(RFC.H200).json(successMsg("Exist", Exist));
                }else{
                    LotteryType.createOne(body).then((result: any) => {
                        res.status(RFC.H200).json(successMsg(LOTTERY_CREATED, result));
                    }).catch(error => {
                        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
                    });
                }
            }).catch(error => {

                res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
            });
            
        }
    });
}

export function update(req: Request, res: Response, next: NextFunction) {

    const rules = {
        "_id": "required",
        "min_stake": "required",
        "max_stake": "required",
        "rate": "required"
    };

    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            var newvalues:any= {
                min_stake : body.min_stake,
                max_stake : body.max_stake,
                rate : body.rate
            };
            var wehere:any= {
                _id : new ObjectId(body._id)
            };

            LotteryType.updateOne(wehere,{ $set: newvalues }).then((result: any) => {
                res.status(RFC.H200).json(successMsg(LOTTERY_CREATED, result));
            }).catch(error => {
                res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
            });
        }
    });
}

export function readLotteryType(req: Request, res: Response, next: NextFunction){

    var where = { _id: new ObjectId(req.params.id) };

    LotteryType.findOne(where).then((result: any) => {

        res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
    }).catch(error => {

        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}
export function lotterytype_list(req: Request, res: Response, next: NextFunction) {

    const rules = {
        "lottery_id": "required"
    };

    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;

            var where:any = {};
            where.lottery_id= new ObjectId(body.lottery_id);
            
            LotteryType.findAll(where).then((result: any) => {
                res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
            }).catch(error => {
                res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
            });
        }
    });
}