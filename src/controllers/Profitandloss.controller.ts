import express, { Request, Response, NextFunction } from "express";

import { ProfitandLoss } from "../models/ProfitandLoss";
import { successMsg, errorMsg } from "../helpers/formatter.helper";
import { RFC, VALIDATION_ERROR, COMMON_SUCCESS } from "../../config/global";
import { ObjectId } from "mongodb";

export function profitandloss(req: any, res: Response) {

    var where: any = {};
    where.user_id = new ObjectId(req.params.id);
    let criteria: any;


    if (req.body.bet_type) {
        where.bet_type = req.body.bet_type;

    }
    if (req.body.betting_time) {
        where.betting_time = req.body.betting_time;

    }
    if (req.body) {
        criteria = req.body;
    } else {
        criteria = null
    }
    let query = [
        {
            $match: where
        },
        { $sort: { user_id: -1 } },
    ]

    // ProfitandLoss.findAll(where).then((result:any) => {
    //     res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
    // }).catch(error => {
    //     res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    // });

    ProfitandLoss.aggregateExtra(query, criteria)
        .then(result => {

            res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result.data, result.metadata));
        })
        .catch(err2 => {
            res.status(RFC.H401).json(errorMsg(VALIDATION_ERROR, err2));
        });
}


export function get_total(req: any, res: Response, next: NextFunction) {
    var where: any = [];

    if (req.params.slug === "profit") {
        where = [
            {
                $match: { 'user_id': new ObjectId(req.params.id) }
            }, {
                $group:
                {
                    _id: "$user_id",
                    totalprofit: { $sum: "$profit" }
                }
            }
        ];
    } else if (req.params.slug === "loss") {
        where = [
            {
                $match: { 'user_id': new ObjectId(req.params.id) }
            }, {
                $group:
                {
                    _id: "$user_id",
                    totalloss: { $sum: "$loss" }
                }
            }
        ];
    }

    ProfitandLoss.aggregate(where).then((result: any) => {
        res.status(RFC.H200).json(successMsg("Get Total Profit And Loss ", result));

    });
}