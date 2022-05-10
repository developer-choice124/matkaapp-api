import { Request, Response, NextFunction } from "express";

import { Chart } from "../models/Chart";
import { Lottery } from "../models/Lottery";
import { validator } from "../helpers/validator.helper";
import {
    RFC,
    VALIDATION_ERROR,
    COMMON_SUCCESS, CHART_CREATED
} from "../../config/global";
import { successMsg, errorMsg } from "../helpers/formatter.helper";
import { ObjectId } from "mongodb";

export function get(req: Request, res: Response, next: NextFunction) {
    var where: any = {};
    if (req.body.bet_type) {
        where.bet_type = req.body.bet_type;
        
    }
    if (req.body.bedding_time) {
        where.bedding_time = req.body.bedding_time;
        
    }
    if(req.params.id){
        var id = req.params.id;
        where.lottery_id = new ObjectId(id);
    }
    
    let criteria: any;

    if (req.body) {
        criteria = req.body;
    } else {
        criteria = null
    }
    let query = [
        {
            $match: where
        },
        { $sort: { _id: -1 } },
    ]
    
    
    Chart.aggregateExtra(query, criteria).then((result: any) => {
        res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result.data, result.metadata));
    }).catch(error => {

        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
    // Chart.findAll({}).then((result: any) => {
    //     res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
    // }).catch(error => {

    //     res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    // });
}
export function getallbyLotteryId(req: Request, res: Response, next: NextFunction) {

    var id = req.params.id;
    var where:any = {};
     where.lottery_id = new ObjectId(id);
    
    if (req.body.bet_type) {
        where.bet_type = req.body.bet_type;

    }
    if (req.body.bedding_time) {
        where.bedding_time = req.body.bedding_time;

    }
    let criteria: any;

    if (req.body) {
        criteria = req.body;
    } else {
        criteria = null
    }
    let query = [
        {
            $match: where
        },
        { $sort: { _id: -1 } },
    ]
    
    Chart.aggregateExtra(query, criteria).then((result: any) => {
        res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result.data, result.metadata));
    }).catch(error => {

        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}
export function getOne(req: Request, res: Response, next: NextFunction) {

    var id = req.params.id;
    var where = { _id: new ObjectId(id) };

    Chart.findOne(where).then((result: any) => {
        res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
    }).catch(error => {

        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}
export function deleteOne(req: Request, res: Response, next: NextFunction) {

    var id = req.params.id;
    var where = { _id: new ObjectId(id) };

    Chart.deleteOne(where).then((result: any) => {
        res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
    }).catch(error => {

        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}

export function create(req: Request, res: Response, next: NextFunction) {

    const rules = {
        "lottery_id": "required",
        "bet_type": "required",
        "patti": "required"
    };

    validator(req.body, rules, {}, async (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body: any = req.body;
            body.lottery_id = new ObjectId(body.lottery_id);
            body.created_at = new Date();
            let is_Exist_where: any = {
                lottery_id: new ObjectId(body.lottery_id),
                created_at: new Date()
            };
            let is_exist: any = await Chart.findAll(is_Exist_where);
            if (is_exist.length > 0) {
                res.status(RFC.H400).send(errorMsg(VALIDATION_ERROR, "Already Exist !!"));
            } else {
                var where = { _id: new ObjectId(body.lottery_id) };

                var lotteryDetail = await Lottery.findOne(where);
                body.lotteryDetail = lotteryDetail;

                Chart.createOne(body).then((result: any) => {
                    res.status(RFC.H200).json(successMsg(CHART_CREATED, result));
                }).catch(error => {
                    res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
                });
            }
        }
    });
}

export function update(req: Request, res: Response, next: NextFunction) {

    const rules = {
        "lottery_id": "required",
        "bet_type": "required",
        "patti": "required"
    };

    validator(req.body, rules, {}, async (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            var newvalues: any = {
                lottery_id: new ObjectId(body.lottery_id),
                bet_type: body.bet_type,
                open: body.open,
                patti: body.patti,
                close: body.close,
                is_active:false,
            };
            if(body.close  && body.close !== ""){
                newvalues.is_active = true;
            }
            var wehere: any = {
                _id: new ObjectId(req.params.id)
            };
            var lotterywhere = { _id: new ObjectId(body.lottery_id) };

            var lotteryDetail = await Lottery.findOne(lotterywhere);
            newvalues.lotteryDetail = lotteryDetail;

            Chart.updateOne(wehere, { $set: newvalues }).then((result: any) => {
                res.status(RFC.H200).json(successMsg(CHART_CREATED, result));
            }).catch(error => {
                res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
            });
        }
    });
}
export function check(req: Request, res: Response, next: NextFunction) {

    const rules = {
        "lottery_id": "required",
        "bet_type": "required"
    };

    validator(req.body, rules, {}, async (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            var lotterywhere:any = { 
                    lottery_id: new ObjectId(body.lottery_id),
                    bet_type: body.bet_type,
                    // result show 11:59 pm
                    // created_at: { $gte: new Date(body.from + 'T00:00:00.000Z'), $lte: new Date(body.to+ 'T23:59:00.000Z') }
                    // result show 00:59 am
                    // created_at: { $gte: new Date(body.from + 'T00:00:00.000Z'), $lt: new Date(body.to+ 'T00:59:59.000Z') }
                    // result show 5:59 am
                    created_at: { $gte: new Date(body.from + 'T06:00:00.000Z'), $lt: new Date(body.to+ 'T05:59:59.000Z') }
                };
                if(body.bet_type === 'single-patti' || body.bet_type === 'double-patti' || body.bet_type === 'triple-patti'){
                    lotterywhere.bet_type = {
                        $nin : ['jodi','single']
                    }
                }
                if(body.open){
                    lotterywhere.open = body.open;
                }
                if(body.close){
                    lotterywhere.close = body.close;
                }
                
            var chart = await Chart.findOne(lotterywhere); 
            res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, chart));
        }
    });
}