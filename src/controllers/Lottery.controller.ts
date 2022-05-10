import { Request, Response, NextFunction } from "express";

import { Lottery } from "../models/Lottery";
import { validator } from "../helpers/validator.helper";
import { filter } from "../helpers/search.helper";
import { 
    RFC, 
    VALIDATION_ERROR, 
    LOTTERY_CREATED, 
    COMMON_SUCCESS, 
    LOTTERY_UPDATED, 
    LOTTERY_DELETED, 
    EXCEPTION_MSG,
    LOTTERY_FAILED
 } from "../../config/global";
import { successMsg, errorMsg } from "../helpers/formatter.helper";
import { NewLottery } from "../data-model/LotteryData";
import { ObjectId } from "mongodb";

export function create(req: Request, res: Response, next: NextFunction) {
    
    const rules = {
        "market_name": "required|is_exists:lottery,market_name",
        "start_date":"required",
        "open": "required",
        "close": "required"
    };

    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H409).send(errorMsg(VALIDATION_ERROR, ["Lottery "+err.errors]));
        } else {
            let body: NewLottery = req.body;
            // prepare body
            if(body.supermaster){
                body.supermaster = body.supermaster.map(function (id: string) {
                    return new ObjectId(id);
                });
            }else{
                body.supermaster = null;

            }
            body.created_at = new Date();
            body.updated_at = new Date();
            body.deleted_at = null;
            body.is_active = true;
            body.start_date = body.start_date;

            Lottery.createOne(body).then((result: any) => {
                res.status(RFC.H200).json(successMsg(LOTTERY_CREATED, result));
            }).catch(error => {
                res.status(RFC.H500).send(errorMsg(LOTTERY_FAILED, error));
            });
        }
    });
}

export async function update(req: Request, res: Response, next: NextFunction) {
    const rules = {
        "market_name": "required",
        "start_date": "required",
        "open": "required",
        "close": "required",
    };

    validator(req.body, rules, {}, async (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body: any = req.body;
            
            let newBody: any = {};
            // prepare body
            newBody.market_name = body.market_name;
            newBody.start_date = body.start_date;
            newBody.open = body.open;
            newBody.close = body.close;
            newBody.is_thirdpl = body.is_thirdpl;
            
            
            newBody.updated_at = new Date();
            var where = { _id: new ObjectId(req.params.id) };
            
            if(body.supermaster){
                
                var supermasterList = body.supermaster.map(function (id: string) {
                    return new ObjectId(id);
                });
                
                var getlottery:any = await Lottery.findOne(where).then((result: any) => {
                    return result;
                });
                
                if(getlottery.supermaster.length > 0){
                    supermasterList.map((superm:any) => {
                        if(!getlottery.supermaster.find((i:any)=>(String(i)===String(superm)))){
                            getlottery.supermaster.push(superm);
                        }
                       
                    })
                    newBody.supermaster = getlottery.supermaster;
                }else{
                    newBody.supermaster = supermasterList;
                    
                }
            }  
            Lottery.updateOne(where, { $set: newBody }).then((result: any) => {
                res.status(RFC.H200).json(successMsg(LOTTERY_UPDATED, result));
            }).catch((error) => {
                res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
            });

        }
    });
}

// export function get_lottery(req: Request, res: Response, next: NextFunction) {

//     var where = {};
//     where = {
//         _id: new ObjectId(req.params.id)
//     }

//     Lottery.findOne(where).then((result: any) => {
//         res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
//     }).catch(error => {
//         res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
//     });
// }

export function delete_lottery_market(req: Request, res: Response, next: NextFunction) {

    const rules = {
        "id": "required",
        "status": "required",
    };

    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            try {
                var $where = { _id: new ObjectId(req.body.id)};
                var $updateBody = {$set: {deleted_at: new Date(),is_active:req.body.status}};
                Lottery.updateOne($where, $updateBody).then(result => {
                    res.status(RFC.H200).json(successMsg(LOTTERY_DELETED, []));
                }).catch(error => {
                    res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
                });            
            } catch (error) {
                res.status(RFC.H500).send(errorMsg(EXCEPTION_MSG, [error]));
            }
        }
    });

}

export function all_list(req: any, res: Response, next: NextFunction) {
    
    
    var slug = req.params.slug;
    var isRole = "admin";
    var supermasterId = "";
    var where = {};
    
    if (slug && slug === "today") {
        var end = new Date();
        if(req.auth.role === "admin"){
            isRole = "admin";
        }else if(req.auth.role === "supermaster"){
            supermasterId =req.auth._id;
        }else if(req.auth.role === "master"){
            isRole = "master";
            supermasterId = req.auth.supermaster_id;
        }else if(req.auth.role === "user"){
            isRole = "user";
            supermasterId = req.auth.supermaster_id;
        }
        
        where = {
            start_date: { $lte: end.getFullYear() + "-" +('0' + (end.getMonth()+1)).slice(-2) + "-" + ("0" + end.getDate()).slice(-2) },
            is_active: true
        }
    }else if (slug && slug === "active") {
        where = {
            is_active: true
        }
    } else if (slug && slug === "deactive") {
        where = {
            is_active: false
        }
    }
    var totalCount = 0;
    var foundCount = 0;
    
    
    Lottery.findAll(where).then((results: any) => {
        
        if(isRole != "admin" && supermasterId != ""){
            
            var lotteryList:any = [];
            results.map((result:any) => {
                if(result.supermaster.length > 0){
                    result.supermaster.map((Idlist:any) => {
                        if(Idlist == supermasterId){
                            lotteryList.push(result);
                        }
                    });
                }else{
                    lotteryList.push(result);
                }
            });
            res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, lotteryList));
        }else{
            res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, results));
        }
        
    }).catch(error => {
        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}


export function get(req: Request, res: Response, next: NextFunction) {

    var where = { _id: new ObjectId(req.params.id) };

    Lottery.findOne(where).then((result: any) => {

        res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
    }).catch(error => {

        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}
export function remove_supermaster(req: Request, res: Response, next: NextFunction) {
    
    var where = { _id: new ObjectId(req.params.lottery_id) };

    Lottery.findOne(where).then((result: any) => {
        if(result.supermaster.length>0){
            result.supermaster.map((list:any,key:any) => {
                if(req.params.supermasterid === String(list)){
                    result.supermaster.splice(key, 1);
                }
            })
        }
        var $updateBody = {$set: {supermaster: result.supermaster}};
        Lottery.updateOne(where, $updateBody).then(updateresult => {
            res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result.supermaster));
        }).catch(error => {
            res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
        }); 

    }).catch(error => {

        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}