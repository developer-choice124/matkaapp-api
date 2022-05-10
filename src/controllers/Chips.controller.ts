import express, { Request, Response, NextFunction } from "express";

import { Chips } from "../models/Chips";
import { User } from "../models/User";
import { validator } from "../helpers/validator.helper";
import { successMsg, errorMsg } from "../helpers/formatter.helper";
import { RFC, VALIDATION_ERROR, COMMON_SUCCESS, INVALID_USER, USER_UPDATED, TRANSECTION_FAILED } from "../../config/global";
import { ObjectId } from "mongodb";

export function add(req: Request, res: Response) {
    const rules = {
        "sender_id": "required",
        "reciver_id": "required",
        "chips": "required"
    };
    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            let where = {
                _id: new ObjectId(body.sender_id),
                is_active: true
            };


            User.findOne(where).then((checkUserCoin: any) => {

                if (checkUserCoin.chips >= body.chips) {

                    // minus chips to sender
                    var newvalues = { $set: { chips: Number(checkUserCoin.chips) - Number(body.chips) } };

                    User.updateOne(where, newvalues).then((addCoinResult: any) => {

                        // create chip transection 
                        let chipsdata: any = {
                            user_id: new ObjectId(body.sender_id),
                            credit: 0,
                            debit: Number(body.chips),
                            balance: Number(checkUserCoin.chips) - Number(body.chips),
                            created_at: new Date(),
                        };
                        where = {
                            _id: new ObjectId(body.reciver_id),
                            is_active: true
                        };

                        // add chips to reciver
                        User.findOne(where).then((result: any) => {
                            chipsdata.description = 'to ' + result.username;
                            chipsdata.sender_id = new ObjectId(body.sender_id);
                            Chips.createOne(chipsdata);
                            newvalues = { $set: { chips: Number(result.chips) + Number(body.chips) } };

                            User.updateOne(where, newvalues).then(addCoinResult => {
                                let reciverTransection: any = {
                                    user_id: new ObjectId(body.reciver_id),
                                    sender_id: new ObjectId(body.sender_id),
                                    description: 'from ' + checkUserCoin.username,
                                    credit: body.chips,
                                    debit: 0,
                                    balance: Number(result.chips) + Number(body.chips),
                                    created_at: new Date(),
                                };
                                Chips.createOne(reciverTransection);

                                res.status(RFC.H200).json(successMsg(USER_UPDATED, addCoinResult));
                            }).catch(err => {
                                res.status(RFC.H401).json(errorMsg(INVALID_USER, err));
                            });

                        });


                    }).catch(err => {

                        res.status(RFC.H401).json(errorMsg(INVALID_USER, err));

                    });

                } else {
                    res.status(RFC.H401).json(errorMsg(TRANSECTION_FAILED, ["You Don't have Enough Coin."]));
                }

            }).catch(err => {
                res.status(RFC.H401).json(errorMsg(INVALID_USER, err));
            });
        }
    });

}
export function allListbyuserId(req: Request, res: Response) {

    var where: any = { user_id: new ObjectId(req.params.id) };
    let criteria: any;

    if (req.body) {
        criteria = req.body;
    } else {
        criteria = null
    }
    let query = [
        {
            $match: where
        }, {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "senderDetails",
            }
        },
        { $sort: { _id: -1 } },
    ]
    // Chips.aggregate([{
    //     $match: where
    // },{
    //     $lookup: {
    //         from: "users",
    //         localField: "user_id",
    //         foreignField: "_id",
    //         as: "senderDetails",
    //     }
    // }]).then((result:any) => {
    //     res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
    // }).catch(error => {
    //     res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    // });
    Chips.aggregateExtra(query, criteria)
        .then(result => {
            // console.log("allListbyuserId->",result.data)
            res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result.data, result.metadata));
        })
        .catch(err2 => {
            res.status(RFC.H401).json(errorMsg(VALIDATION_ERROR, err2));
        });

}
export function aggregateChilps(req: any, res: any) {
    var where = {}
    var body = req.params;
    if(body.sort === 'true'){
        where = { 
            user_id: new ObjectId(body._id),
            created_at: { $gte: new Date(body.from + 'T00:00:00.000Z'), $lt: new Date(body.to + 'T23:59:59.000Z') } 
        }
    } else {
         where = { user_id: new ObjectId(body._id) }
    }
    Chips.findAllByID(where)
        .then(result => {
            var all: { [key: string]: { balance?: number, credit?: number, debit?: number, created_at?: string } } = {}
            result.forEach((element: any) => {
                const key = new Date(element.created_at).toLocaleDateString();
                if (all[key] === undefined) {
                    all[key] = {}
                    all[key].balance = element.balance
                    all[key].debit = element.debit
                    all[key].credit = element.credit
                    all[key].created_at = key
                } else {
                    all[key].debit += element.debit;
                    all[key].credit += element.credit;
                }
            })
            const newEnteries = Object.entries(all);
            let page: any = req.params && req.params.page ? req.params.page : 1;
            const offset = 10;
            let maxPage = Math.ceil(newEnteries.length / offset);

            let endIndex = newEnteries.length > offset * page ? 10 : (newEnteries.length - offset * (page - 1));
            const NewPref = [];
            for (let i = (page - 1) * offset; i < (page - 1) * offset + endIndex; i++) {
                NewPref.push(newEnteries[i]);
            }
            res.status(200).json({ Metadata: {totalCount: newEnteries.length, foundCount: maxPage}, data: NewPref })
        })
        .catch(error => {
            res.status(500).json({ error: error })
        });
}

// get-Chips-Details-By-Date
export function getChipsDetailsByDate (req:any, res:any) {
    const body = req.params;
    const where = {
        user_id: new ObjectId(body.id),
        created_at: { $gte: new Date(body.from + 'T00:00:00.000Z'), $lt: new Date(body.to + 'T23:59:59.000Z') }
    };
    Chips.findAll(where)
    .then(result => {
        let page: any = req.params && req.params.page ? req.params.page : 1;
            const offset = 10;
            let maxPage = { "maxPage": Math.ceil(result.length / offset) }

            let endIndex = result.length > offset * page ? 10 : (result.length - offset * (page - 1));
            const NewPref = [];
            for (let i = (page - 1) * offset; i < (page - 1) * offset + endIndex; i++) {
                NewPref.push(result[i]);
            }
            res.status(200).json({ Metadata: {totalCount: result.length, foundCount: maxPage}, data: NewPref })
    })
    .catch(error => {
        res.status(500).json({error: error})
    })
}