import express, {Request, Response, NextFunction} from "express";

import { User } from "../models/User";
import { Chips } from "../models/Chips";
import { Rollbackpl } from "../models/Rollbackpl";
import { Thirdpartybetting } from "../models/Thirdpartybetting";
import { Thirdpartybettingplace } from "../models/Thirdpartybettingplace";
import { Casinoprofitloss } from "../models/Casinoprofitloss";
import { ProfitandLossForExternal } from "../models/ProfitandLossForExternal";
import { AccountstatementForExternal } from "../models/AccountstatementForExternal";
import { validator } from "../helpers/validator.helper";
import { successMsg, errorMsg } from "../helpers/formatter.helper";
import { RFC, VALIDATION_ERROR, COMMON_SUCCESS ,OPERATORID, USER_UPDATED, TRANSECTION_FAILED} from "../../config/global";
import { verifyToken, generateToken } from "../helpers/jwt.helper";
import { ObjectId, Timestamp } from "mongodb";

export function get_user(req: any, res: Response, next: NextFunction){
    req.body = JSON.parse(req.body);
    const rules = {
        "token":"required",
        "operatorId":"required",
    };
    validator(req.body, rules, {}, (err:any, status:any) => {
        if (!status) {
            res.status(RFC.H412).json(err.errors);
        } else {
            let body = req.body;
            if(Number(body.operatorId) === OPERATORID){
                
                verifyToken(body.token).then((result:any) => {
                    
                    let userData:any = result['data'];
                    var where :any = { _id: new ObjectId(userData._id),role:"user" };
                    User.findOne(where).then((resuserult:any) => {
                        
                        let ResponseDAta:any = {
                            operatorId: body.operatorId,
                            user_id: userData._id,
                            nickName: userData.name,
                            currency: "INR",
                            balance: resuserult.chips,
                            errorCode: 1,
                            errorDescription: "Success"
                        };
                        let token = generateToken({data:ResponseDAta});
                        var date:any = new Date();
                            date = date.getTime();
                        let DAta:any = {
                            operatorId: body.operatorId,
                            userId: userData._id,
                            nickName: userData.name,
                            currency: "INR",
                            playerTokenAtLaunch: body.token,
                            token: token.token,
                            balance: resuserult.chips,
                            errorCode: 1,
                            errorDescription: "Success",
                            timestamp: date
                        };

                        res.status(RFC.H200).json(DAta);
                    }).catch(error => {
                        res.status(RFC.H500).json(error);
                    });
                    
                }).catch(err => {
                    res.status(RFC.H401).json([err.name, err.message ]);
                });
            }else{
                res.status(RFC.H412).json(['Please Check Your Operator Id!!!!']);
            }
        }
    });
}

export function getbalance(req: any, res: Response, next: NextFunction){
    req.body = JSON.parse(req.body);
    const rules = {
        "token":"required",
        "operatorId":"required",
        "userId":"required",
        "nickName":"required",
        "currency":"required",
        "timestamp":"required",
    };
    validator(req.body, rules, {}, (err:any, status:any) => {
        if (!status) {
            res.status(RFC.H412).json(err);
        } else {
            let body = req.body;
            if(Number(body.operatorId) === OPERATORID){
                verifyToken(body.token).then((result:any) => {
                    
                    let userData:any = result['data'];
                    var where :any = { _id: new ObjectId(userData.user_id),role:"user" };
                    User.findOne(where).then((resuserult:any) => {
                        
                        var date:any = new Date();
                            date = date.getTime();
                            
                        let DAta:any = {
                            operatorId: body.operatorId,
                            token: body.token,
                            userId: userData.user_id,
                            nickName: userData.nickName,
                            balance: resuserult.chips,
                            currency: "INR",
                            errorCode: 1,
                            errorDescription: "Success",
                            timestamp: date
                        };
                        res.status(RFC.H200).json(DAta);
                        
                    });

                }).catch(err => {
                    
                    res.status(RFC.H401).json(err);
                });
            }

        }
    });

}
export function confirmbet(req: any, res: Response, next: NextFunction){
    req.body = JSON.parse(req.body);
    
    const rules = {
        "token":"required",
        "operatorId":"required",
        "requestId":"required",
        "userId":"required",
        "marketId":"required",
        "price":"required",
        "size":"required",
        "side":"required",
        "exposure":"required",
        "timestamp":"required",
    };
    validator(req.body, rules, {}, (err:any, status:any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            
            
            var Error:any = {
                token:body.token,
                operatorId:body.operatorId,
                requestId:body.requestId,
                userId:body.userId,
                exposure:body.exposure,
                errorCode: 2,
            };
            
            
            if(Number(body.operatorId) === OPERATORID){
                verifyToken(body.token).then(async(result:any) => {
                    let userData:any = result['data'];
                    
                    let CheckRequestIdwhere = { requestId: body.requestId };
                    
                    Thirdpartybetting.findAll(CheckRequestIdwhere).then((resuserult:any) => {
                        
                        

                        if(resuserult && resuserult.length >0){
                            
                            Error.errorDescription= "Request alreay processed";
                            res.status(RFC.H200).json(Error);
                        }else{
    
                            let bettingData = {
                                user_id:new ObjectId(body.userId),
                                game:"casino",
                                requestId:body.requestId,
                                data:body,
                                created_at:new Date()
                            };
                            Thirdpartybetting.createOne(bettingData);
    
                            var where :any = { _id: new ObjectId(userData.user_id),role:"user" };
                            
                            
                            
                            User.findOne(where).then((resuserult:any) => {
                                
                                if(resuserult.chips >= Math.abs(body.exposure)){
                                    var date:any = new Date();
                                        date = date.getTime();
            
                                    let DAta:any = {
                                        operatorId: body.operatorId,
                                        requestId: body.requestId,
                                        token: body.token,
                                        userId: userData.user_id,
                                        nickName: userData.nickName,
                                        marketId: body.marketId,
                                        balance: resuserult.chips,
                                        currency: "INR",
                                        errorCode: 1,
                                        errorDescription: "Success",
                                        timestamp: date
                                    };
                                    
                                    res.status(RFC.H200).json(DAta);
                                }else{
                                    
                                    Error.errorDescription= "Insufficient balance"; 
                                    res.status(RFC.H200).json(Error);
                                }
                                
                            }).catch(err => {       
                                res.status(RFC.H200).json(err);
                            });
                        }
                    }).catch(err => {
                        
                        res.status(RFC.H200).json(err);
                    });
                    
                    

                }).catch(err => {
                    res.status(RFC.H200).json(err);
                });
            }

        }
    });

}
export function placeBet(req: any, res: Response, next: NextFunction){
    req.body = JSON.parse(req.body);
    const rules = {
        "requestId":"required",
        "operatorId":"required",
        "token":"required",
        "marketId":"required",
        "timestamp":"required",
        "userId":"required",
        "exposure":"required"
        
    };
    validator(req.body, rules, {}, (err:any, status:any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            var Error:any = {
                errorCode: 2,
            };
            if(Number(body.operatorId) === OPERATORID){
                verifyToken(body.token).then(async(result:any) => {
                    let userData:any = result['data'];
                    
                    let CheckRequestIdwhere = { requestId: body.requestId };
                    
                    Thirdpartybettingplace.findAll(CheckRequestIdwhere).then((resuserult:any) => {

                        if(resuserult && resuserult.length >0){
                            Error.errorDescription= "Request alreay processed";
                            res.status(RFC.H401).json(Error);
                        }else{
                                let bettingData = {
                                    user_id:new ObjectId(body.userId),
                                    game:"casino",
                                    requestId:body.requestId,
                                    data:body,
                                    created_at:new Date()
                                };
                                
                                Thirdpartybettingplace.createOne(bettingData);
        
                                var where :any = { _id: new ObjectId(userData.user_id),role:"user" };
                                
                                User.findOne(where).then((resuserult:any) => {
                                    
                                    var date:any = new Date();
                                        date = date.getTime();
                                        
                                    let DAta:any = {
                                        operatorId: body.operatorId,
                                        userId: userData._id,
                                        token: body.token,
                                        currency: "INR",
                                        balance: resuserult.chips,
                                        errorCode: 1,
                                        errorDescription: "Success",
                                        timestamp: date
                                    };
                                    res.status(RFC.H200).json(DAta);
                                });
                        }
                    }).catch(err => {
                        res.status(RFC.H401).json(err);
                    });
                }).catch(err => {
                    res.status(RFC.H401).json(err);
                });
            }

        }
    });

}
export function profitloss(req: any, res: Response, next: NextFunction){
    req.body = JSON.parse(req.body);
    const rules = {
        "operatorId":"required",
        "requestId":"required",
        "marketId":"required",
        "marketName":"required",
        "winnerDescription":"required"
    };
    validator(req.body, rules, {}, async (err:any, status:any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            var Error:any = {
                errorCode: 2,
            };
            
            if(Number(body.operatorId) === OPERATORID){
                
                let CheckRequestIdwhere = { requestId: body.requestId };
                    
                Casinoprofitloss.findAll(CheckRequestIdwhere).then(async (resuserult:any) => {
                    if(resuserult && resuserult.length >0){

                        Error.errorDescription = "Request alreay processed";
                        
                        res.status(RFC.H200).json(Error);

                    }else{
                            body.game="casino";
                            body.created_at=new Date();
                            Casinoprofitloss.createOne(body);
                            
                            await body.profitLossDetails.map((userResponse:any) =>{
                                
                                User.findOneDetails([{
                                    $match: { '_id': new ObjectId(userResponse.userId),'is_active': true }
                                },{
                                    $lookup: {
                                        from: "users",
                                        localField: "parent_id",
                                        foreignField: "_id",
                                        as: "master",
                                    }
                                },{
                                    $lookup:{
                                        from: "users", 
                                        localField: "master.parent_id", 
                                        foreignField: "_id",
                                        as: "supermaster"
                                    }
                                },{
                                    $lookup:{
                                        from: "users", 
                                        localField: "supermaster.parent_id", 
                                        foreignField: "_id",
                                        as: "admin"
                                    }
                                }]).then((result:any)=> {
                                    
                                    result = result ? result[0]:null;
                                    
                                    let profitandLossData:any = [];
                                    let accountStatementData:any = [];
                                    
                                    if(result){
                                        
                                        var supermaster:any = {
                                                user_id:new ObjectId(result.supermaster[0]._id),
                                                username:result.supermaster[0].username,
                                                game:"casino",
                                                marketName:body.marketName,
                                                marketId:body.marketId,
                                                created_at:new Date(),
                                            },  
                                            admin:any = {
                                                user_id:new ObjectId(result.admin[0]._id),
                                                username:result.admin[0].username,
                                                game:"casino",
                                                marketName:body.marketName,
                                                marketId:body.marketId,
                                                created_at:new Date(),
                                            },
                                            master:any = {
                                                user_id:new ObjectId(result.master[0]._id),
                                                username:result.master[0].username,
                                                game:"casino",
                                                marketName:body.marketName,
                                                marketId:body.marketId,
                                                created_at:new Date(),
                                            },
                                            user:any = {
                                                user_id:new ObjectId(userResponse.userId),
                                                username:result.username,
                                                game:"casino",
                                                marketName:body.marketName,
                                                marketId:body.marketId,
                                                created_at:new Date(),
                                            };
                                            var admincommission = (Number(result.supermaster[0].commission) * Number(Math.abs(userResponse.pl)))/100;
                                            var supermastercommission = (Number(result.master[0].commission) * Number(Math.abs(userResponse.pl)))/100;
                                            var mastercommission = Number(Math.abs(userResponse.pl)) - Number(Math.abs(admincommission)) - Number(Math.abs(supermastercommission));
                                        
                                        if(Math.sign(userResponse.pl) > 0){
                                            
                                            var m_chip_where ={
                                                _id : new ObjectId(result.master[0]._id),
                                                is_active:true
                                            };

                                            var chip_where = {
                                                _id : new ObjectId(userResponse.userId),
                                                is_active:true
                                            };

                                            admin.profit = 0;
                                            admin.loss = admincommission;

                                            supermaster.profit = 0;
                                            supermaster.loss = supermastercommission;

                                            master.profit = 0;
                                            master.loss = mastercommission;

                                            user.profit = userResponse.pl;
                                            user.loss = 0;

                                        }else{
                                            
                                            var m_chip_where ={
                                                _id : new ObjectId(userResponse.userId),
                                                is_active:true
                                            };
                                            var chip_where = {
                                                _id : new ObjectId(result.master[0]._id),
                                                is_active:true
                                            };

                                            admin.profit = admincommission;
                                            admin.loss = 0;

                                            supermaster.profit = supermastercommission;
                                            supermaster.loss = 0;

                                            master.profit = mastercommission;
                                            master.loss = 0;

                                            user.profit = 0;
                                            user.loss = userResponse.pl;
                                        }
                                        profitandLossData.push(admin,supermaster,master,user);

                                        // minus chips
                                        User.findOne(m_chip_where).then((chipresult:any)=> {
                                            var minusbalance = 0;
                                                minusbalance = Number(chipresult.chips) - Number(Math.abs(userResponse.pl));
                                                var newvalues = { $set: {chips: minusbalance} };
                                            User.updateOne(m_chip_where,newvalues).then((senderResult:any) => {
                                                let chipsdata : any = {
                                                    user_id : new ObjectId(chipresult._id),
                                                    sender_id : new ObjectId(userResponse.userId),
                                                    credit : 0,
                                                    debit : Number(userResponse.pl),
                                                    balance : minusbalance,
                                                    created_at : new Date(),
                                                };
                                                // add chips
                                                User.findOne(chip_where).then((senderresult:any)=> {
                                                    chipsdata.description = 'to ' + result.username;
                                                    Chips.createOne(chipsdata);
                                                    var plusbalance =0 ;
                                                    plusbalance = Number(senderresult.chips) + Number(Math.abs(userResponse.pl));
                                                    var newvalues = { $set: {chips: plusbalance} };
                                                    
                                                    User.updateOne(chip_where,newvalues).then(addCoinResult => {
                                                        let reciverTransection : any = {
                                                            user_id : new ObjectId(senderresult._id),
                                                            sender_id : new ObjectId(userResponse.userId),
                                                            description : 'from ' + chipresult.username,
                                                            credit : userResponse.pl,
                                                            debit : 0,
                                                            balance : plusbalance,
                                                            created_at : new Date(),
                                                        };
                                                        
                                                        
                                                        
                                                        Chips.createOne(reciverTransection);
                                                        
                                                    });
                            
                                                });
                                            });
                                            
                                        });
                                        
                                        ProfitandLossForExternal.createMany(profitandLossData).catch(error => {
                                            res.status(RFC.H500).send(errorMsg("Profit And Loss Creation Error!!!", error));
                                        }); 
                                        
                                        if(Math.sign(userResponse.pl) > 0){
                                            master.sender_id = new ObjectId(result.supermaster[0]._id);
                                            master.sender_name = result.supermaster[0].username;
                                            master.amount = Number(supermastercommission) + Number(Math.abs(admincommission));
                                            master.status = "CREDIT";
                                            
                                            supermaster.sender_id = new ObjectId(result.admin[0]._id);
                                            supermaster.sender_name = result.admin[0].username;
                                            supermaster.amount = Number(admincommission);
                                            supermaster.status = "CREDIT";

                                            user.sender_id = new ObjectId(result.master[0]._id);
                                            user.sender_name = result.master[0].username;
                                            user.amount = Number(Math.abs(userResponse.pl));
                                            user.status = "SETTLED";

                                            accountStatementData.push(supermaster,master, user);
                                        }else{
                                            admin.sender_id = new ObjectId(result.supermaster[0]._id);
                                            admin.sender_name = result.supermaster[0].username;
                                            admin.amount =Number(admincommission);
                                            admin.status = "CREDIT";
                                            
                                            supermaster.sender_id = new ObjectId(result.master[0]._id);
                                            supermaster.sender_name = result.master[0].username;
                                            supermaster.amount = Number(supermastercommission) + Number(Math.abs(admincommission));
                                            supermaster.status = "CREDIT";

                                            master.sender_id = new ObjectId(userResponse.userId);
                                            master.sender_name = result.username;
                                            master.amount = Number(Math.abs(userResponse.pl));
                                            master.status = "SETTLED";

                                            accountStatementData.push(supermaster, admin, master);
                                        }
                                        
                                        
                                        AccountstatementForExternal.createMany(accountStatementData);

                                    }else{
                                        Error.errorDescription = "Request alreay processed";
                                        res.status(RFC.H200).json(Error);
                                    }
                                }).catch(err => {
                                    
                                    res.status(RFC.H401).json(err);
                                });
                                
                            });
                            
                            var date:any = new Date();
                                date = date.getTime();
    
                            let DAta:any = {
                                operatorId: body.operatorId,
                                marketId: body.marketId,
                                errorCode: 1,
                                errorDescription: "Success",
                                timestamp: date
                            };
                            
                            
                            res.status(RFC.H200).json(DAta);
                    }
                }).catch(err => {
                    res.status(RFC.H401).json(err);
                });                      
                   
            }else{
                
                Error.errorDescription = "Request alreay processed";
                res.status(RFC.H200).json(Error);
            }

        }
    });

}

export function rollbackProfitloss(req: any, res: Response, next: NextFunction){
    req.body = JSON.parse(req.body);
    const rules = {
        "operatorId":"required",
        "requestId":"required",
        "marketId":"required",
        "timestamp":"required",
         
    };
    validator(req.body, rules, {}, async (err:any, status:any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            var Error:any = {
                operatorId:body.operatorId,
                requestId:body.requestId,
                errorCode: 2,
            };
            if(Number(body.operatorId) === OPERATORID){
                    
                    let CheckRequestIdwhere = { requestId: body.requestId };
                    
                    Rollbackpl.findAll(CheckRequestIdwhere).then((resuserult:any) => {

                        if(resuserult && resuserult.length >0){
                            
                            Error.errorDescription= "Request alreay processed";
                            res.status(RFC.H200).json(Error);
                        }else{
                            let CheckRequestIdwhere = { marketId: body.marketId };
                            
                            body.game="casino";
                            body.created_at=new Date();
                            Rollbackpl.createOne(body);

                            Casinoprofitloss.deleteOne(CheckRequestIdwhere);
                            ProfitandLossForExternal.deleteOne(CheckRequestIdwhere);
                            AccountstatementForExternal.findAllList(CheckRequestIdwhere).then((result:any) => {
                                if(result){
                                    result.map((list:any) => {
                                        
                                        if(list.status === "SETTLED"){
                                            
                                            var sender_where = {
                                                _id : new ObjectId(list.user_id),
                                            };
                                            
                                            
                                            
                                            User.findOne(sender_where).then((checkUserCoin:any)=> {
                                                
                                                
                                                    // minus chips to sender
                                                    var newChipsvalues = { $set: {chips: Number(checkUserCoin.chips) - Number(Math.abs(list.amount))} };
                                            
                                                    User.updateOne(sender_where,newChipsvalues).then((senderResult:any) => {
                                                        
                                                        
                                                        let chipsdata : any = {
                                                            user_id : new ObjectId(list.user_id),
                                                            sender_id : new ObjectId(list.sender_id),
                                                            credit : 0,
                                                            debit : Number(list.amount),
                                                            balance : Number(checkUserCoin.chips) - Number(Math.abs(list.amount)),
                                                            created_at : new Date(),
                                                        };
                                                        var reciver_where = {
                                                            _id: new ObjectId(list.sender_id)
                                                        };
                                                        // add chips to reciver
                                                        User.findOne(reciver_where).then((userresult:any)=> {
                                                            
                                                            
                                                            chipsdata.description = 'to ' + checkUserCoin.username;
                                                            Chips.createOne(chipsdata);
                                        
                                                            var userData = { $set: {chips: Number(userresult.chips) + Number(Math.abs(list.amount))} };
                                
                                                            User.updateOne(reciver_where,userData).then(addCoinResult => {
                                                                let reciverTransection : any = {
                                                                    user_id : new ObjectId(list.sender_id),
                                                                    sender_id : new ObjectId(list.user_id),
                                                                    description : 'from ' + userresult.username,
                                                                    credit : list.amount,
                                                                    debit : 0,
                                                                    balance : Number(userresult.chips) + Number(Math.abs(list.amount)),
                                                                    created_at : new Date(),
                                                                };
                                                                
                                                                Chips.createOne(reciverTransection);
                                                                
                                                            });
                                                        });
                                                    }).catch(err => {
                                                        res.status(RFC.H401).json(errorMsg(TRANSECTION_FAILED, err));
                                                    });
                                            });
                                            
                                            var acWhare:any = {_id : new ObjectId(list._id)}
                                            AccountstatementForExternal.deleteOne(acWhare);
                                        }else{
                                            
                                            var acWhare:any = {_id : new ObjectId(list._id)}
                                            AccountstatementForExternal.deleteOne(acWhare);
                                        }
                                    });
                                }
                            })
                                                    
                            var date:any = new Date();
                                date = date.getTime();

                            let DAta:any = {
                                operatorId: body.operatorId,
                                marketId: body.marketId,
                                errorCode: 1,
                                errorDescription: "Success",
                                timestamp: date
                            };
                            res.status(RFC.H200).json(DAta);
                        }
                    });
            }else{
                
                Error.errorDescription= "Request alreay processed";
                res.status(RFC.H401).json(Error);
            }

        }
    });

}
