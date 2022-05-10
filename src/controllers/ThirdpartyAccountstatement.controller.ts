import express, {Request, Response, NextFunction} from "express";

import { AccountstatementForExternal } from "../models/AccountstatementForExternal";
import { User } from "../models/User";
import { Chips } from "../models/Chips";
import { validator } from "../helpers/validator.helper";
import { successMsg, errorMsg } from "../helpers/formatter.helper";
import { RFC, VALIDATION_ERROR, COMMON_SUCCESS,TRANSECTION_FAILED,TRANSECTION_SUCCESS } from "../../config/global";
import { ObjectId } from "mongodb";

export async function accountstatement(req: any, res: Response){

    var where :any = {
        game:req.body.game
    };
    
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
    let criteria:any;
    
        if(req.body){
            criteria = req.body;
        }else{
            criteria=null
        }

        let query=[
            {
                $match: where
            },
            { $sort: { _id: -1 } },
        ]

        AccountstatementForExternal.aggregateExtra(query,criteria)
        .then(result => {
                res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result.data,result.metadata));
        })
        .catch(err2 => {
                res.status(RFC.H401).json(errorMsg(VALIDATION_ERROR, err2));
        });
    
    // AccountstatementForExternal.findAllList(where).then((result:any) => {
        
    //     res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
    // }).catch(error => {
    //     res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
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
            AccountstatementForExternal.findAllList(where).then((result:any) => {
                if(result.length>0){
                    
                        var sender_where = {
                            _id : new ObjectId(body.sender_id),
                        };
                        User.findOne(sender_where).then((checkUserCoin:any)=> {
                            if(checkUserCoin._id){
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
                                                user_id : new ObjectId(userresult._id),
                                                sender_id : new ObjectId(checkUserCoin._id),
                                                description : 'from ' + checkUserCoin.username,
                                                credit : Number(body.chips),
                                                debit : 0,
                                                balance : Number(userresult.chips) + Number(body.chips),
                                                created_at : new Date(),
                                            };
                                            
                                            Chips.createOne(reciverTransection);
    
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
                                                
                                                AccountstatementForExternal.updateOne(where,{$set:newValues}).catch(error => {
                                                    res.status(RFC.H500).send(errorMsg("VALIDATION_ERROR", error));
                                                });
                                            });

                                            var accountStatementData:any = {};
                                                accountStatementData.user_id= new ObjectId(body.user_id);
                                                accountStatementData.username=result[0].username;
                                                accountStatementData.game='casino';
                                                accountStatementData.marketName=result[0].marketName;
                                                accountStatementData.profit=Math.abs(totalChips);
                                                accountStatementData.loss=0;
                                                accountStatementData.sender_id= new ObjectId(result[0].sender_id);
                                                accountStatementData.amount=0;
                                                accountStatementData.status="SETTLED";
                                                accountStatementData.created_at=new Date();

                                                AccountstatementForExternal.createOne(accountStatementData).catch(error => {
                                                    res.status(RFC.H500).send(errorMsg("Profit And Loss Creation Error!!!", error));
                                                });
                                            
                                            res.status(RFC.H201).json(successMsg(TRANSECTION_SUCCESS, SendCoinSuccess));
                                        });
                                    });
                                }).catch(err => {
                                    res.status(RFC.H401).json(errorMsg(TRANSECTION_FAILED, err));
                                });
                            }else{

                            }
                        });
                }
            }).catch(error => {
                res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
            });
        }
    });
}