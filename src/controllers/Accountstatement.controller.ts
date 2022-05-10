import express, {Request, Response, NextFunction} from "express";

import { Accountstatement } from "../models/Accountstatement";
import { User } from "../models/User";
import { Chips } from "../models/Chips";
import { validator } from "../helpers/validator.helper";
import { successMsg, errorMsg } from "../helpers/formatter.helper";
import { RFC, VALIDATION_ERROR, COMMON_SUCCESS,TRANSECTION_FAILED,TRANSECTION_SUCCESS } from "../../config/global";
import { ObjectId } from "mongodb";

export async function accountstatement(req: any, res: Response){

    var where :any = {};
    
    if(req.body.type=="ALL") {
        where.user_id= new ObjectId(req.params.id);
    }
    if(req.body.type=="CREDIT") {
        where.status= req.body.type;
        where.user_id= new ObjectId(req.params.id);
    }
    if(req.body.type=="DEBIT") {
        where.status= "CREDIT";
        where.sender_id= new ObjectId(req.params.id);
    }

        let query=[
            {
                $match: where
            },{
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "userDetails",
                }
            },{
                $lookup: {
                    from: "users",
                    localField: "sender_id",
                    foreignField: "_id",
                    as: "senderDetails",
                }
            },
            { $sort: { _id: -1 } },
        ]
    
    Accountstatement.findAll(query).then((result:any) => {
        
        res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result, ""));
    }).catch(error => {
        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
    

    // Accountstatement.aggregateExtra(query,criteria)
    // .then(result => {
    //         res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result.data,result.metadata));
    // })
    // .catch(err2 => {
    //         res.status(RFC.H401).json(errorMsg(VALIDATION_ERROR, err2));
    // });
}
export async function update(req: any, res: Response){
    const rules = {
        "user_id":"required",
        "sender_id":"required",
        "chips":"required"
    };
    validator(req.body, rules, {}, (err:any, status:any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            
            
            var where ={
                user_id: new ObjectId(body.user_id),
                sender_id: new ObjectId(body.sender_id),
                status: 'CREDIT'
            }
            
            var totalChips = body.chips;
            Accountstatement.findAllList(where).then((result:any) => {
                
                result.map((statement:any) => {
                    var newValues:any = {};
                    if(totalChips >= statement.amount){
                        totalChips = Number(totalChips) - Number(statement.amount);
                        if(totalChips >= 0){
                            newValues.amount =0;
                            newValues.status = "SETTLED";
                        }
                    }else{
                        newValues.amount = Number(statement.amount) - totalChips;
                    }
                    newValues.discription = body.discription;
                    
                    Accountstatement.updateOne(where,{$set:newValues}).catch(error => {
                        res.status(RFC.H500).send(errorMsg("VALIDATION_ERROR", error));
                    });
                });
                if(result.length>0){
                    var accountStatementData:any = {};
                        accountStatementData.user_id= new ObjectId(body.user_id);
                        accountStatementData.lottery_id=new ObjectId(result[0].lottery_id);
                        accountStatementData.market_name=result[0].market_name;
                        accountStatementData.betting_time=result[0].betting_time;
                        accountStatementData.bet_type=result[0].bet_type;
                        accountStatementData.sender_id= new ObjectId(result[0].sender_id);
                        accountStatementData.profit=Math.abs(totalChips);
                        accountStatementData.loss=0;
                        accountStatementData.amount=0;
                        accountStatementData.status="SETTLED";
                        accountStatementData.created_at=new Date();

                        Accountstatement.createOne(accountStatementData).catch(error => {
                            res.status(RFC.H500).send(errorMsg("Profit And Loss Creation Error!!!", error));
                        });

                        var sender_where = {
                            _id : new ObjectId(body.sender_id),
                        };
                        
                        User.findOne(sender_where).then((checkUserCoin:any)=> {
                            if(checkUserCoin.chips >= body.chips){
                                // minus chips to sender
                                var newChipsvalues = { $set: {chips: Number(checkUserCoin.chips) - Number(body.chips)} };
                        
                                User.updateOne(sender_where,newChipsvalues).then((senderResult:any) => {
                                    
                                    let senderTransection : any = {
                                        user_id : new ObjectId(checkUserCoin._id),
                                        credit : 0,
                                        debit : Number(body.chips),
                                        balance : Number(checkUserCoin.chips) - Number(body.chips),
                                        created_at : new Date(),
                                    };
                                    var reciver_where = {
                                        _id: new ObjectId(body.user_id)
                                    };
                                    // add chips to reciver
                                    User.findOne(reciver_where).then((userresult:any)=> {
                                        senderTransection.description = 'to ' + userresult.username;
                                        senderTransection.sender_id = new ObjectId(userresult._id);
                                        
                                        Chips.createOne(senderTransection);

                                        var userData = { $set: {chips: Number(userresult.chips) + Number(body.chips)} };
            
                                        User.updateOne(reciver_where,userData).then((SendCoinSuccess:any) => {
                                            let reciverTransection : any = {
                                                sender_id : new ObjectId(checkUserCoin._id),
                                                user_id : new ObjectId(userresult._id),
                                                description : 'from ' + checkUserCoin.username,
                                                credit : Number(body.chips),
                                                debit : 0,
                                                balance : Number(userresult.chips) + Number(body.chips),
                                                created_at : new Date(),
                                            };
                                            
                                            Chips.createOne(reciverTransection);
                                            res.status(RFC.H201).json(successMsg(TRANSECTION_SUCCESS, SendCoinSuccess));
                                        });
                                    });
                                }).catch(err => {
                                    res.status(RFC.H401).json(errorMsg(TRANSECTION_FAILED, err));
                                });
                            }else{
                                res.status(RFC.H401).json(errorMsg(TRANSECTION_FAILED, err));
                            }
                        });
                }
            }).catch(error => {
                res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
            });
        }
    });
}