import express, {Request, Response, NextFunction} from "express";

import { ProfitandLossForExternal } from "../models/ProfitandLossForExternal";
import { Casinoprofitloss } from "../models/Casinoprofitloss";
import { successMsg, errorMsg } from "../helpers/formatter.helper";
import { RFC, VALIDATION_ERROR, COMMON_SUCCESS } from "../../config/global";
import { ObjectId } from "mongodb";

export function profitandloss(req: any, res: Response){

    var where :any = {};    
    
    where.game= req.body.game;
    where.user_id= new ObjectId(req.body.id);
    
                                                        
    ProfitandLossForExternal.findAll(where).then((result:any) => {
        
        res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
    }).catch(error => {
        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}
export function BetHistory(req: any, res: Response){

    var where :any = {};    
    
    where.game= req.body.game;
    // where.user_id= new ObjectId(req.body.id);

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
        Casinoprofitloss.aggregateExtra(query,criteria)
        .then(result => {
            var data:any = [];
                result.data.map((list:any) => {

                    if(list.profitLossDetails.length > 0){
                        list.profitLossDetails.map((plList:any) => {
                            
                            if(String(plList.userId) === String(req.body.id)){
                                plList.marketName = list.marketName;
                                data.push(plList);
                            }
                        });
                    }
                });
                res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, data,result.metadata));
        })
        .catch(err2 => {
                res.status(RFC.H401).json(errorMsg(VALIDATION_ERROR, err2));
        });
                                                        
    // Casinoprofitloss.findAll(where).then((result:any) => {
    //     var data:any = [];
    //     result.map((list:any) => {

    //         if(list.profitLossDetails.length > 0){
    //             list.profitLossDetails.map((plList:any) => {
                    
    //                 if(String(plList.userId) === String(req.body.id)){
    //                     plList.marketName = list.marketName;
    //                     data.push(plList);
    //                 }
    //             });
    //         }
    //     });
        
    //     res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, data));
    // }).catch(error => {
    //     res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    // });
}


export function get_total(req: any, res: Response, next: NextFunction) {
    var where:any = [];
    
    if(req.params.slug === "profit"){
        where = [
            {
            $match: { 'user_id': new ObjectId(req.params.id) }
            },{
              $group:
                {
                  _id:"$user_id",
                  totalprofit: { $sum: "$profit" }
                }
            }
        ];
    }else if(req.params.slug === "loss"){
        where = [
            {
            $match: { 'user_id': new ObjectId(req.params.id) }
            },{
              $group:
                {
                  _id:"$user_id",
                  totalloss: { $sum: "$loss" }
                }
            }
        ];
    }

    ProfitandLossForExternal.aggregate(where).then((result:any) => {
        res.status(RFC.H200).json(successMsg("Get Total Profit And Loss ", result));
        
    });
}