import express, { Request, Response, NextFunction } from "express";


import { validator } from "../helpers/validator.helper";
import { successMsg, errorMsg } from "../helpers/formatter.helper";
import { BettingData, BettingAnnounceData } from "../data-model/BettingData";

import { User } from "../models/User";
import { Chart } from "../models/Chart";
import { Chips } from "../models/Chips";
import { Betting } from "../models/Betting";
import { Lottery } from "../models/Lottery";
import { ProfitandLoss } from "../models/ProfitandLoss";
import { Accountstatement } from "../models/Accountstatement";

import { RFC, VALIDATION_ERROR, INVALID_USER, BET_NOT_ALLOWED, single, singlepatti, doublepatti, tripalpatti, jodi } from "../../config/global";
import { ObjectId } from "mongodb";

export function betPlaced(req: any, res: Response, next: NextFunction) {

    const rules = {
        "market_name": "required",
        "bet_type": "required",
        "betting_time": "required",
        "rate": "required",
        "user_id": "required",
        "lottery_id": "required",

    };

    // check user role before place bet
    if (req.auth.role !== "user") {
        return res.status(RFC.H403).send(errorMsg(BET_NOT_ALLOWED, []));
    }

    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            return res.status(RFC.H409).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {

            let body: BettingData = req.body;
            var userData: any = [];
            var totalchips = 0;
            var enoughMoney: number = 0;

            // Calculate Total Coin
            body.digitlist.map((list: any) => {
                totalchips = Number(totalchips) + Number(list.amount);
            });

            // get parents detalil & Check User Have Chips or not
            var masterData: any = { _id: { $in: [new ObjectId(body.user_id), new ObjectId(req.auth.supermaster_id), new ObjectId(req.auth.parent_id)] } };

            User.findAll(masterData).then((userDetailsResult: any) => {

                userDetailsResult.map((userDetail: any) => {

                    if (userDetail.role == "master") {
                        userData['master'] = userDetail;
                    }

                    if (userDetail.role == "supermaster") {
                        userData['supermaster'] = userDetail;
                    }

                    if (userDetail.role == "user") {
                        if (userDetail._id == body.user_id && userDetail.chips >= totalchips) {
                            enoughMoney = userDetail.chips;
                            let where = {
                                _id: new ObjectId(userDetail._id),
                                is_active: true
                            };
                            var newvalues = { $set: { chips: Number(userDetail.chips) - Number(totalchips) } };

                            User.updateOne(where, newvalues).then((addCoinResult: any) => {

                                userData['user'] = userDetail;
                                let reciverTransection: any = {
                                    user_id: new ObjectId(userDetail._id),
                                    description: 'betting to ' + body.market_name,
                                    sender_id: new ObjectId(userDetail.parent_id),
                                    credit: 0,
                                    debit: Number(totalchips),
                                    balance: Number(userDetail.chips) - Number(totalchips),
                                    created_at: new Date(),
                                };
                                Chips.createOne(reciverTransection);
                            }).catch(err => {

                                return res.status(RFC.H401).json(errorMsg(INVALID_USER, err));

                            });
                        } else {
                            return res.status(RFC.H401).json(errorMsg("You Don't Have Enough Coins.", { body, 'error': err }));
                        }
                    }
                });

                if (userData.master != "" && userData.supermaster != "" && userData.user != "" && enoughMoney > 0) {
                    let battingData: any = [];
                    body.digitlist.map((betcreate: any) => {

                        // var admincommission = (Number(userData.supermaster.commission) * Number(betcreate.amount))/100;
                        // var supermastercommission = (Number(userData.master.commission) * Number(betcreate.amount))/100;
                        // var mastercommission = Number(betcreate.amount) - Number(admincommission) - Number(supermastercommission);

                        let Data: any = {};
                        Data.market_name = body.market_name;
                        Data.lottery_id = new ObjectId(body.lottery_id);
                        Data.bet_type = body.bet_type;
                        Data.betting_time = body.betting_time;
                        Data.rate = body.rate;
                        Data.digit = betcreate.digit;
                        Data.bet_amount = betcreate.amount;
                        Data.user_id = new ObjectId(body.user_id);
                        Data.commission = [{
                            master: {
                                _id: new ObjectId(req.auth.parent_id),
                                commissioninpercent: 0
                            },
                            supermaster: {
                                _id: new ObjectId(req.auth.supermaster_id),
                                commissioninpercent: userData.master.commission
                            },
                            admin: {
                                _id: new ObjectId(req.auth.admin_id),
                                commissioninpercent: userData.supermaster.commission

                            }
                        }];
                        Data.status = "PENDING";
                        Data.is_active = true;
                        Data.amount = 0;
                        Data.created_at = new Date();
                        battingData.push(Data);

                    });

                    if (battingData.length > 0) {
                        Betting.createMany(battingData).then((result: any) => {
                            return res.status(RFC.H201).json(successMsg("Successfully placed betting", result));
                        }).catch(error => {
                            return res.status(RFC.H500).send(errorMsg("Betting Error!!!", error));
                        });
                    } else {
                        return res.status(RFC.H401).json(errorMsg("Can't placed betting.", { 'error': err }));
                    }

                } else {
                    return res.status(RFC.H401).json(errorMsg("You don't have enough coins.", { 'error': err }));
                }

            }).catch(err => {
                return res.status(RFC.H401).json(errorMsg(VALIDATION_ERROR, { 'error': err }));
            });
        }
    });
}

export function betAnnounce(req: any, res: Response, next: NextFunction) {

    const rules = {
        "lottery_id": "required",
        "bet_type": "required",
        "betting_time": "required",
        "digit": "required",
    };

    validator(req.body, rules, {}, async (err: any, status: any) => {
        if (!status) {
            return res.status(RFC.H409).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {

            let body: BettingAnnounceData = req.body;
            // check lottery already announced or not

            let checkWhere = {
                lottery_id: new ObjectId(body.lottery_id),
                created_at: { $gte: new Date(body.min_date + 'T00:00:00.000Z'), $lt: new Date(body.min_date + 'T23:59:00.000Z') }
            };

            var chartRes: any = await Chart.findOne(checkWhere);

            
            if (!chartRes || chartRes.is_active === undefined || !chartRes.is_active || body.bet_type === 'single' || body.bet_type === 'jodi') {
                var chartWhere = { _id: new ObjectId(body.lottery_id) };

                var lotteryDetail = await Lottery.findOne(chartWhere);
                var chartData: any = {
                    lottery_id: new ObjectId(body.lottery_id),
                    bet_type: body.bet_type,
                    lotteryDetail: lotteryDetail,
                };
                if (body.betting_time === 'open') {
                    chartData.open = body.digit;
                } else if (body.betting_time === 'close') {
                    chartData.close = body.digit;
                }

                if (body.bet_type !== 'single' && body.bet_type !== 'jodi') {

                    if (chartRes) {
                        chartData.patti = String(chartRes.patti) + String(body.patti);
                        chartData.updated_at = new Date();
                        chartData.is_active = true;
                        Chart.updateOne({ _id: new ObjectId(chartRes._id) }, { $set: chartData });
                    } else {
                        chartData.is_active = false;
                        chartData.patti = body.patti;
                        chartData.created_at = new Date(body.min_date);
                        Chart.createOne(chartData);
                    }
                }
                

                // get all betting

                let where = {
                    lottery_id: new ObjectId(body.lottery_id),
                    bet_type: body.bet_type,
                    betting_time: body.betting_time,
                    is_active: true,
                    status: "PENDING",
                    created_at: { $gte: new Date(body.min_date + 'T00:00:00.000Z'), $lt: new Date(body.min_date + 'T23:59:00.000Z') }
                };
                if (body.bet_type === 'single-patti' || body.bet_type === 'double-patti' || body.bet_type === 'triple-patti') {
                    where.bet_type = {
                        $nin: ['jodi', 'single']
                    }
                }               

                Betting.findAllforAnnounce(where).then(async (result: any) => {

                    let profitandLossarray: any = [];
                    var profitandLossData: any = [];

                    result.map((lottery: any) => {


                        let battingwhere = { _id: new ObjectId(lottery._id) },
                            newvalues = {},
                            userData = {},
                            masterData = {},
                            supermasterData = {},
                            userprofit = {},
                            adminData = {};

                        var profitandLoss: any = {};

                        let userDetails = lottery.commission ? lottery.commission[0] : null;

                        // check Win or Loss and calculate user profit and loss 
                        if (lottery.digit != body.digit) {
                            newvalues = {
                                $set: {
                                    status: "LOSS", amount: {
                                        win: 0,
                                        loss: lottery.bet_amount
                                    }
                                }
                            };
                            userData = {
                                user_id: new ObjectId(lottery.user_id),
                                profit: 0,
                                loss: lottery.bet_amount
                            }
                            userprofit = {
                                user_id: new ObjectId(lottery.user_id),
                                market_name: lottery.market_name,
                                lottery_id: new ObjectId(lottery_id),
                                betting_time: lottery.betting_time,
                                bet_type: lottery.bet_type,
                                profit: 0,
                                loss: Math.abs(lottery.bet_amount),
                                created_at: new Date()
                            }
                        } else {
                            newvalues = {
                                $set: {
                                    status: "WIN", amount: {
                                        win: lottery.bet_amount * lottery.rate,
                                        loss: 0
                                    }
                                }
                            };
                            userData = {
                                user_id: new ObjectId(lottery.user_id),
                                profit: lottery.bet_amount * lottery.rate,
                                loss: 0
                            }
                            userprofit = {
                                user_id: new ObjectId(lottery.user_id),
                                market_name: lottery.market_name,
                                lottery_id: new ObjectId(lottery_id),
                                betting_time: lottery.betting_time,
                                bet_type: lottery.bet_type,
                                profit: Math.abs(lottery.bet_amount * lottery.rate),
                                loss: 0,
                                created_at: new Date()
                            }

                            var chip_where = {
                                _id: new ObjectId(lottery.user_id),
                                is_active: true
                            };

                            // add chips to user
                            User.findOne(chip_where).then((chipresult: any) => {

                                newvalues = { $set: { chips: Number(chipresult.chips) + Math.abs(lottery.bet_amount * lottery.rate) } };

                                User.updateOne(chip_where, newvalues);
                                let reciverTransection: any = {
                                    user_id: new ObjectId(lottery.user_id),
                                    sender_id: new ObjectId(chipresult.parent_id),
                                    description: 'Win in' + lottery.market_name,
                                    credit: Math.abs(lottery.bet_amount * lottery.rate),
                                    debit: 0,
                                    balance: Number(chipresult.chips) + Math.abs(lottery.bet_amount * lottery.rate),
                                    created_at: new Date(),
                                };
                                Chips.createOne(reciverTransection);

                            });
                        }
                        profitandLossData.push(userprofit);
                        masterData = {
                            user_id: new ObjectId(userDetails.master._id),
                            commissioninpercent: 0
                        }
                        supermasterData = {
                            user_id: new ObjectId(userDetails.supermaster._id),
                            commissioninpercent: userDetails.supermaster.commissioninpercent
                        }
                        adminData = {
                            user_id: new ObjectId(userDetails.admin._id),
                            commissioninpercent: userDetails.admin.commissioninpercent,
                        }

                        profitandLoss.lottery_id = new ObjectId(body.lottery_id);
                        profitandLoss.market_name = lottery.market_name;
                        profitandLoss.user_id = lottery.user_id;
                        profitandLoss.bet_type = body.bet_type;
                        profitandLoss.betting_time = body.betting_time;
                        profitandLoss.betting_date = new Date();
                        profitandLoss.totalbetchip = Number(lottery.bet_amount);
                        profitandLoss.digit = body.digit;
                        profitandLoss.user = userData;
                        profitandLoss.master = masterData;
                        profitandLoss.supermaster = supermasterData;
                        profitandLoss.admin = adminData;
                        profitandLoss.created_at = new Date();

                        profitandLossarray.push(profitandLoss);


                        // // Update Profit or Loss Status
                        Betting.updateOne(battingwhere, newvalues).then((res: any) => {

                        }).catch(error => {
                            return res.status(RFC.H500).send(errorMsg("Betting Status Updation Error!!!", error));
                        });
                    });

                    var dataAccordingtomaster: any = [];
                    if (profitandLossarray.length > 0) {
                        // Calculate Master , Supermaster , Admin Profit and loss

                        // make array according to master 
                        profitandLossarray.map((pllist: any) => {
                            if (typeof dataAccordingtomaster[pllist.master.user_id] === 'undefined') {
                                dataAccordingtomaster[pllist.master.user_id] = [];
                                dataAccordingtomaster[pllist.master.user_id].push(pllist);
                            }
                            else {
                                dataAccordingtomaster[pllist.master.user_id].push(pllist);
                            }
                        });
                        var accountStatementData: any = [];
                        // get master array keys
                        const userkeyArray = Object.keys(dataAccordingtomaster);


                        for (var i = 0; i < userkeyArray.length; i++) {
                            var totalbetchip = 0,
                                win = 0,
                                lottery_id = 0,
                                loss = 0,
                                market_name = "",
                                betting_time = "",
                                bet_type = "",
                                supermaster: any = {},
                                admin: any = {};

                            dataAccordingtomaster[userkeyArray[i]].map((userprofit: any) => {
                                if (userprofit.user.profit > 0) {
                                    win = win + Number(userprofit.user.profit);
                                } else {
                                    loss = loss + Number(userprofit.user.loss);

                                }
                                supermaster = userprofit.supermaster;
                                admin = userprofit.admin;
                                lottery_id = userprofit.lottery_id;
                                market_name = userprofit.market_name;
                                betting_time = userprofit.betting_time;
                                bet_type = userprofit.bet_type;
                                totalbetchip = totalbetchip + Number(userprofit.totalbetchip);
                            });

                            var totalcommisionamount = Number(totalbetchip) - win;
                            if (totalcommisionamount < 0) {
                                var admincommission = (Number(admin.commissioninpercent) * Number(totalcommisionamount)) / 100;
                                var supermastercommission = (Number(supermaster.commissioninpercent) * Number(totalcommisionamount)) / 100;
                                var mastercommission = Number(totalcommisionamount) - Number(admincommission) - Number(supermastercommission);

                                // this array for Profit and Loss
                                profitandLossData.push({
                                    user_id: new ObjectId(userkeyArray[i]),
                                    lottery_id: new ObjectId(lottery_id),
                                    market_name: market_name,
                                    betting_time: betting_time,
                                    bet_type: bet_type,
                                    profit: 0,
                                    loss: Math.abs(mastercommission),
                                    created_at: new Date()
                                }, {
                                    user_id: new ObjectId(supermaster.user_id),
                                    lottery_id: new ObjectId(lottery_id),
                                    market_name: market_name,
                                    betting_time: betting_time,
                                    bet_type: bet_type,
                                    profit: 0,
                                    loss: Math.abs(supermastercommission),
                                    created_at: new Date()
                                }, {
                                    user_id: new ObjectId(admin.user_id),
                                    lottery_id: new ObjectId(lottery_id),
                                    market_name: market_name,
                                    betting_time: betting_time,
                                    bet_type: bet_type,
                                    profit: 0,
                                    loss: Math.abs(admincommission),
                                    created_at: new Date()
                                });

                                // this array for Account Statement
                                accountStatementData.push({
                                    user_id: new ObjectId(userkeyArray[i]),
                                    lottery_id: new ObjectId(lottery_id),
                                    market_name: market_name,
                                    betting_time: betting_time,
                                    bet_type: bet_type,
                                    sender_id: new ObjectId(supermaster.user_id),
                                    profit: 0,
                                    loss: Math.abs(mastercommission),
                                    amount: Math.abs(supermastercommission) + Math.abs(admincommission),
                                    status: "CREDIT",
                                    created_at: new Date()
                                }, {
                                    user_id: new ObjectId(supermaster.user_id),
                                    lottery_id: new ObjectId(lottery_id),
                                    market_name: market_name,
                                    betting_time: betting_time,
                                    bet_type: bet_type,
                                    sender_id: new ObjectId(admin.user_id),
                                    profit: 0,
                                    loss: Math.abs(supermastercommission),
                                    amount: Math.abs(admincommission),
                                    status: "CREDIT",
                                    created_at: new Date()
                                })
                            } else {
                                var admincommission = (Number(admin.commissioninpercent) * Number(totalcommisionamount)) / 100;
                                var supermastercommission = (Number(supermaster.commissioninpercent) * Number(totalcommisionamount)) / 100;
                                var mastercommission = Number(totalcommisionamount) - Number(admincommission) - Number(supermastercommission);

                                var chip_where = {
                                    _id: new ObjectId(userkeyArray[i]),
                                    is_active: true
                                };

                                // add chips to user
                                User.findOne(chip_where).then((chipresult: any) => {

                                    var newvalues = { $set: { chips: Number(chipresult.chips) + Number(totalcommisionamount) } };

                                    User.updateOne(chip_where, newvalues);
                                    let reciverTransection: any = {
                                        user_id: new ObjectId(chipresult._id),
                                        sender_id: new ObjectId(chipresult.parent_id),
                                        description: 'from ' + market_name,
                                        credit: Number(totalcommisionamount),
                                        debit: 0,
                                        balance: Number(chipresult.chips) + Number(totalcommisionamount),
                                        created_at: new Date(),
                                    };
                                    Chips.createOne(reciverTransection);

                                });
                                // this array for Profit and Loss
                                profitandLossData.push({
                                    user_id: new ObjectId(userkeyArray[i]),
                                    lottery_id: new ObjectId(lottery_id),
                                    market_name: market_name,
                                    betting_time: betting_time,
                                    bet_type: bet_type,
                                    profit: Math.abs(mastercommission),
                                    loss: 0,
                                    created_at: new Date()
                                }, {
                                    user_id: new ObjectId(supermaster.user_id),
                                    lottery_id: new ObjectId(lottery_id),
                                    market_name: market_name,
                                    betting_time: betting_time,
                                    bet_type: bet_type,
                                    profit: Math.abs(supermastercommission),
                                    loss: 0,
                                    created_at: new Date()
                                }, {
                                    user_id: new ObjectId(admin.user_id),
                                    lottery_id: new ObjectId(lottery_id),
                                    market_name: market_name,
                                    betting_time: betting_time,
                                    bet_type: bet_type,
                                    profit: Math.abs(admincommission),
                                    loss: 0,
                                    created_at: new Date()
                                });


                                // this array for Account Statement
                                accountStatementData.push({
                                    user_id: new ObjectId(supermaster.user_id),
                                    lottery_id: new ObjectId(lottery_id),
                                    market_name: market_name,
                                    betting_time: betting_time,
                                    bet_type: bet_type,
                                    sender_id: new ObjectId(userkeyArray[i]),
                                    profit: Math.abs(supermastercommission),
                                    loss: 0,
                                    amount: Math.abs(supermastercommission) + Math.abs(admincommission),
                                    status: "CREDIT",
                                    created_at: new Date()
                                }, {
                                    user_id: new ObjectId(admin.user_id),
                                    lottery_id: new ObjectId(lottery_id),
                                    market_name: market_name,
                                    betting_time: betting_time,
                                    bet_type: bet_type,
                                    sender_id: new ObjectId(supermaster.user_id),
                                    profit: Math.abs(admincommission),
                                    loss: 0,
                                    amount: Math.abs(admincommission),
                                    status: "CREDIT",
                                    created_at: new Date()
                                });
                            }
                        }


                        ProfitandLoss.createMany(profitandLossData).catch(error => {
                            return res.status(RFC.H500).send(errorMsg("Profit And Loss Creation Error!!!", error));
                        });
                        Accountstatement.createMany(accountStatementData).then((profitresult: any) => {
                            return res.status(RFC.H201).json(successMsg("Successfully Announced Lottery", profitresult));
                        });

                    }

                }).catch(error => {
                    return res.status(RFC.H500).send(errorMsg("No Batting Here!!!", error));
                });

            } else {
                return res.status(RFC.H401).json(errorMsg("Lottery Result Declaration Failed.", { 'error': err }));
            }

        }
    });
}

export async function get_betting(req: any, res: Response, next: NextFunction) {
    var body = req.body;
    var where: any = {};

    if (req.auth.role === "admin") {
        var inArr: any = [];
        if (req.body.bet_type) {
            where = { lottery_id: new ObjectId(req.params.lottery_id), status: "PENDING" };
            if (req.body.bet_type === 'single-patti' || req.body.bet_type === 'double-patti' || req.body.bet_type === 'triple-patti') {
                inArr.push('single-patti', 'double-patti', 'triple-patti');
            } else {
                inArr.push(req.body.bet_type);
            }
        } else {
            where = { lottery_id: new ObjectId(req.params.lottery_id), status: "PENDING" };
        }
        if (req.body.betting_time && req.body.betting_time === 'close') {
            var existWhere: any = {
                lottery_id: new ObjectId(req.params.lottery_id),
                betting_time: 'open',
                bet_type: req.body.bet_type,
                status: {
                    $nin: ['PENDING']
                }
            }
            if (req.body.bet_type === 'single-patti' || req.body.bet_type === 'double-patti' || req.body.bet_type === 'triple-patti') {
                existWhere.bet_type = {
                    $nin: ['jodi', 'single']
                }
            }

            var is_exist = await Betting.findOne(existWhere);
            if (is_exist) {
                inArr.push('jodi');
            }
        }
        if (inArr.length > 0) {
            where.bet_type = {
                $in: inArr
            }
        }
    } else if (req.auth.role === "supermaster" || req.auth.role === "master") {
        where = { lottery_id: new ObjectId(req.params.lottery_id), status: "PENDING" };
    } else {
        where = { user_id: new ObjectId(req.params.id), lottery_id: new ObjectId(req.params.lottery_id), status: "PENDING" };
    }

    where.created_at = { $gte: new Date(body.min_date + 'T00:00:00.000Z'), $lt: new Date(body.min_date + 'T23:59:00.000Z') }
    delete body.min_date;

    let criteria: any;

    if (body) {
        criteria = body;
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
                as: "userDetails",
            }
        },
        { $sort: { _id: -1 } },
    ]

    Betting.aggregateExtra(query, criteria).then((result: any) => {
        var pbetHistory: any = [];
        result.data.map((bethistory: any) => {

            if (req.auth.role === "supermaster") {
                var supermasterId = bethistory.commission[0].supermaster._id;
                if (req.auth._id === String(supermasterId)) {
                    pbetHistory.push(bethistory);
                }
            } else if (req.auth.role === "master") {
                var masterId = bethistory.commission[0].master._id;
                if (req.auth._id === String(masterId)) {
                    pbetHistory.push(bethistory);
                }
            } else {
                pbetHistory.push(bethistory);
            }
        });


        return res.status(RFC.H200).json(successMsg("Successfully Get today lotteries by User", pbetHistory, result.metadata));
    }).catch(error => {

        return res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}
export async function betresult(req: any, res: Response, next: NextFunction) {
    var where = req.body;

    where.lottery_id = new ObjectId(where.lottery_id);
    where.created_at = { $gte: new Date(where.min_date + 'T00:00:00.000Z'), $lt: new Date(where.min_date + 'T23:59:00.000Z') }
    delete where.min_date;

    Betting.findAllforAnnounce(where).then((result: any) => {
        return res.status(RFC.H200).json(successMsg("Successful", result));
    }).catch(error => {
        return res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}
export function all_betting(req: any, res: Response, next: NextFunction) {

    var where: any = {};
    if (req.auth.role !== "user") {
        where = {};
    } else {
        where = { user_id: new ObjectId(req.body.id) };
    }
    if (req.params.slug == "today") {
        var startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        where = { status: "WIN", created_at: { $gte: startOfToday } };
    } else if (req.params.slug == "SETTLED") {
        where.status = {
            $nin: ['PENDING']
        };
    } else if (req.params.slug == "LIVE") {
        where.status = {
            $in: ['PENDING']
        };
    }
    if (req.body.bet_type) {
        where.bet_type = req.body.bet_type;
    }
    if (req.body.betting_time) {
        where.betting_time = req.body.betting_time;
    }
    if (req.body.status && !where.status) {
        where.status = req.body.status;
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
        }, {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "userDetails",
            }
        },
        { $sort: { _id: -1 } },
    ]

    Betting.aggregateExtra(query, criteria).then((result: any) => {
        var betHistory: any = [];

        result.data.map((bethistory: any) => {

            if (req.auth.role === "supermaster") {
                var supermasterId = bethistory.commission[0].supermaster._id;
                if (req.body.id === String(supermasterId)) {
                    betHistory.push(bethistory);
                }
            } else if (req.auth.role === "master") {
                var masterId = bethistory.commission[0].master._id;
                if (req.body.id === String(masterId)) {
                    betHistory.push(bethistory);
                }
            } else {
                betHistory.push(bethistory);
            }
        });

        return res.status(RFC.H200).json(successMsg("Get lotteries Successfully ", betHistory, { totalCount: result.metadata.totalCount, foundCount: betHistory.length }));
    }).catch(error => {

        return res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}
export function betting_by_user(req: any, res: Response, next: NextFunction) {


    const rules = {
        "user_id": "required",
        "role": "required",
        "status": "required",
        "is_active": "required",
    };

    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            return res.status(RFC.H409).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            let where: any = {
                is_active: body.is_active,
                status: "PENDING"
            };
            if (body.role === "user") {
                where.user_id = body.user_id;
            }

            Betting.findAllforAnnounce(where).then((result: any) => {
                var data: any = [];
                result.map((bet: any) => {
                    if (body.role === "supermaster") {
                        var supermasterId = bet.commission[0].supermaster._id;
                        if (String(supermasterId) === body.user_id) {
                            data.push(bet);
                        }
                    } else if (body.role === "master" && bet.commission[0].master._id === body.user_id) {
                        var masterId = bet.commission[0].master._id;
                        if (String(masterId) === body.user_id) {
                            data.push(bet);
                        }
                    } else {
                        data.push(bet);
                    }
                });

                data.map((bet: any) => {
                    var startOfToday = new Date();
                    startOfToday.setHours(0, 0, 0, 0);
                    var bet_where = {
                        _id: new ObjectId(bet._id),
                        is_active: body.is_active,
                        created_at: { $gte: startOfToday }
                    };
                    if (body.is_active === true) {
                        var newvalues = { $set: { is_active: false } };
                    } else {
                        var newvalues = { $set: { is_active: true } };
                    }

                    Betting.updateOne(bet_where, newvalues);

                });

                if (body.is_active === true) {
                    return res.status(RFC.H200).json(successMsg("Get Betting Deleted Succesfull ", data));
                } else {
                    return res.status(RFC.H200).json(successMsg("Betting Undeleted Succesfull ", data));
                }

            });

        }
    });
}
export function betting_by_lotteryid(req: any, res: Response, next: NextFunction) {


    const rules = {
        "lottery_id": "required",
        "is_active": "required",
        "status": "required"
    };

    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            return res.status(RFC.H409).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            let where: any = {
                lottery_id: body.lottery_id,
                is_active: true,
                status: "PENDING"
            };

            Betting.findAllforAnnounce(where).then((result: any) => {

                var newvalues = { $set: { is_active: body.is_active } };
                result.map((bet: any) => {
                    var bet_where = {
                        _id: new ObjectId(bet._id),
                        is_active: true
                    };

                    Betting.updateOne(bet_where, newvalues);

                });

                return res.status(RFC.H200).json(successMsg("Get Betting Deleted Succesfull ", result));

            });

        }
    });
}

export function get_total(req: any, res: Response, next: NextFunction) {
    let where: any = {};
    if (req.params.role === "user") {
        where.user_id = new ObjectId(req.params.id);
    }


    Betting.findAllforAnnounce(where).then((result: any) => {
        var data: any = [];

        result.map((bet: any) => {
            if (req.params.role === "supermaster") {
                var supermasterId = bet.commission[0].supermaster._id;
                if (String(supermasterId) === req.params.user_id) {
                    data.push(bet);
                }
            } else if (req.params.role === "master" && bet.commission[0].master._id === req.params.user_id) {
                var masterId = bet.commission[0].master._id;
                if (String(masterId) === req.params.user_id) {
                    data.push(bet);
                }
            }
            if (req.params.role === "admin" || req.params.role === "user") {
                data.push(bet);
            }
        });

        return res.status(RFC.H200).json(successMsg("Get Total Betting", data));

    });
}

export function betting_by_digit(req: any, res: Response, next: NextFunction) {
    let body = req.body;

    let where: any = {
        digit: { $in: body.digit },
        betting_time: body.time,
        lottery_id: new ObjectId(body.id),
        is_active: true,
        status: "PENDING",
        created_at: { $gte: new Date(body.min_date + 'T00:00:00.000Z'), $lt: new Date(body.min_date + 'T23:59:00.000Z') }
    };

    delete body.min_date;
    Betting.findAllforAnnounce(where).then((result: any) => {

        return res.status(RFC.H200).json(successMsg("Get Padding Betting", result));

    }).catch(error => {
        return res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}


export async function get_pl_by_digit(req: any, res: Response, next: NextFunction) {
    let body = req.body;

    // Calculate Total Coin
    let where: any = {
        digit: { $in: body.digit },
        lottery_id: new ObjectId(body.lottery_id),
        betting_time: body.betting_time,
        is_active: true,
        status: "PENDING",
        created_at: { $gte: new Date(body.min_date + 'T00:00:00.000Z'), $lt: new Date(body.min_date + 'T23:59:00.000Z') }
    };

    delete body.min_date;
    var batingList: any;

    batingList = await Betting.findAllforAnnounce(where).then(betting => {
        return betting;
    });

    var totalbetAmount: Number = 0;
    var result: any = [];

    // Calculate Admin Profit 
    await body.digit.map((anouncDigit: any) => {
        var winamount = 0;
        var adminprofit = 0;
        var adminloss = 0;
        var supermasterloss = 0;
        var supermasterprofit = 0;
        var masterloss = 0;
        var masterprofit = 0;
        var totalprofit = 0;

        batingList.map((bat: any) => {

            totalbetAmount = Number(totalbetAmount) + Number(bat.bet_amount);
            totalprofit = Number(totalprofit) + Number(bat.bet_amount);
            var acommmision = bat.commission ? bat.commission[0].admin : '';
            var scommmision = bat.commission ? bat.commission[0].supermaster : '';
            if (anouncDigit === bat.digit) {

                var profit = Math.abs(bat.bet_amount) * bat.rate;
                var Acal = Number(profit) - Math.abs(bat.bet_amount);
                winamount = Number(winamount) + Number(profit);
                var Aloss = (Number(acommmision.commissioninpercent) * Number(Acal)) / 100;
                var sloss = (Number(scommmision.commissioninpercent) * Number(Acal)) / 100;
                var mloss = Number(Acal) - (Math.abs(Number(sloss)) + Math.abs(Number(Aloss)));
                masterloss = Number(masterloss) + Number(mloss);
                adminloss = Number(adminloss) + Number(Aloss);
                supermasterloss = Number(supermasterloss) + Number(sloss);

            } else {

                var Aprofit = (Number(acommmision.commissioninpercent) * Number(bat.bet_amount)) / 100;
                var sprofit = (Number(scommmision.commissioninpercent) * Number(bat.bet_amount)) / 100;
                var mprofit = Number(bat.bet_amount) - (Math.abs(Number(sprofit)) + Math.abs(Number(Aprofit)));
                masterprofit = Number(masterprofit) + Number(mprofit);
                adminprofit = Number(adminprofit) + Number(Aprofit);
                supermasterprofit = Number(supermasterprofit) + Number(sprofit);

            }
        });

        var finldata = {
            digit: anouncDigit,
            adminprofit: Math.abs(Number(adminprofit)) - Math.abs(Number(adminloss)),
            supermasterprofit: Math.abs(Number(supermasterprofit)) - Math.abs(Number(supermasterloss)),
            masterprofit: Math.abs(Number(masterprofit)) - Math.abs(Number(masterloss)),
            totalprofit: Math.abs(Number(totalprofit)) - Math.abs(Number(winamount)),
        };
        result.push(finldata);

    });


    return res.status(RFC.H200).json(successMsg("Get Admin Profit and loss", result));

}

export async function get_pl_by_suggestiondigit(req: any, res: Response, next: NextFunction) {
    let body = req.body;

    // Calculate Total Coin
    let where: any = {
        lottery_id: new ObjectId(body.lottery_id),
        betting_time: body.betting_time,
        is_active: true,
        status: "PENDING",
        created_at: { $gte: new Date(body.min_date + 'T00:00:00.000Z'), $lt: new Date(body.min_date + 'T23:59:00.000Z') }
    };

    delete body.min_date;
    var AnounceDigit: any = [];

    AnounceDigit['single'] = [];
    AnounceDigit['single-patti'] = [];
    AnounceDigit['double-patti'] = [];
    AnounceDigit['triple-patti'] = [];
    AnounceDigit['jodi'] = [];

    body.digit.map((number: any) => {
        if (single.includes(number)) {
            AnounceDigit['single'].push(number);
        }
        if (singlepatti.includes(number)) {
            AnounceDigit['single-patti'].push(number);
        }
        if (doublepatti.includes(number)) {
            AnounceDigit['double-patti'].push(number);
        }
        if (tripalpatti.includes(number)) {
            AnounceDigit['triple-patti'].push(number);
        }
        if (jodi.includes(number)) {
            AnounceDigit['jodi'].push(number);
        }
    });

    var batingList: any = [];
    await Betting.findAllforAnnounce(where).then(betting => {
        batingList['single'] = [];
        batingList['single-patti'] = [];
        batingList['double-patti'] = [];
        batingList['triple-patti'] = [];
        batingList['jodi'] = [];
        betting.map((bet: any) => {

            if (bet.bet_type === "single") {

                batingList['single'].push(bet);

            } else if (bet.bet_type === "single-patti") {

                batingList['single-patti'].push(bet);

            } else if (bet.bet_type === "double-patti") {

                batingList['double-patti'].push(bet);

            } else if (bet.bet_type === "triple-patti") {

                batingList['triple-patti'].push(bet);

            } else if (bet.bet_type === "jodi") {

                batingList['jodi'].push(bet);

            }
        })
    });

    var totalbetAmount: Number = 0;
    var result: any = [];

    var betTypekeys = Object.keys(AnounceDigit);

    betTypekeys.map((type: any) => {

        AnounceDigit[type].map((anouncDigit: any, key: any) => {
            var winamount = 0;
            var adminprofit = 0;
            var adminloss = 0;
            var totalprofit = 0;

            batingList[type].map((bat: any) => {
                totalbetAmount = Number(totalbetAmount) + Number(bat.bet_amount);
                totalprofit = Number(totalprofit) + Number(bat.bet_amount);
                var commmision = bat.commission ? bat.commission[0].admin : '';
                if (anouncDigit === bat.digit) {

                    var profit = Math.abs(bat.bet_amount) * bat.rate;
                    var Acal = Number(profit) - Math.abs(bat.bet_amount);
                    winamount = Number(winamount) + Number(profit);
                    var Aloss = (Number(commmision.commissioninpercent) * Number(Acal)) / 100;
                    adminloss = Number(adminloss) + Number(Aloss);

                } else {

                    var Aprofit = (Number(commmision.commissioninpercent) * Number(bat.bet_amount)) / 100;
                    adminprofit = Number(adminprofit) + Number(Aprofit);

                }
            });

            var finldata = {
                digit: anouncDigit,
                adminprofit: Math.abs(Number(adminprofit)) - Math.abs(Number(adminloss)),
                totalprofit: Math.abs(Number(totalprofit)) - Math.abs(Number(winamount)),
            };
            result.push(finldata);
        });
    });

    return res.status(RFC.H200).json(successMsg("Get Admin Profit and loss", result));
}

export function get_pending_lottery(req: any, res: Response, next: NextFunction) {

    var where: any = {};
    if (req.params.slug == "today") {
        var startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        where = { status: "PENDING", created_at: { $gte: startOfToday } };
    } else {
        where = {};
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
        }, {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "userDetails",
            }
        },
        { $sort: { _id: -1 } },
    ]

    Betting.aggregateExtra(query, criteria).then((result: any) => {
        var betHistory: any = [];
        result.data.map((bethistory: any) => {

            if (req.auth.role === "supermaster") {
                var supermasterId = bethistory.commission[0].supermaster._id;
                if (req.body.id === String(supermasterId)) {
                    betHistory.push(bethistory);
                }
            } else if (req.auth.role === "master") {
                var masterId = bethistory.commission[0].master._id;
                if (req.body.id === String(masterId)) {
                    betHistory.push(bethistory);
                }
            } else {
                betHistory.push(bethistory);
            }
        });

        return res.status(RFC.H200).json(successMsg("Get lotteries Successfully ", betHistory, { totalCount: betHistory.length, foundCount: betHistory.length }));
    }).catch(error => {

        return res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}
export function get_books(req: any, res: Response, next: NextFunction) {

    var where: any = {
        status: "PENDING",
        user_id: new ObjectId(req.params.user_id),
        lottery_id: new ObjectId(req.params.lottery_id)
    };


    Betting.findAllforAnnounce(where).then((result: any) => {

        return res.status(RFC.H200).json(successMsg("Get Bets ", result));
    }).catch(error => {

        return res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}


export function get_live_books(req: any, res: Response, next: NextFunction) {

    var where: any = {
        status: "PENDING",
        lottery_id: new ObjectId(req.params.lottery_id)
    };


    Betting.findAllforAnnounce(where).then((result: any) => {

        return res.status(RFC.H200).json(successMsg("Get Bets ", result));
    }).catch(error => {

        return res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}

export function get_lottery(req: any, res: Response, next: NextFunction) {

    var where: any = {
        _id: new ObjectId(req.params.lottery_id)
    };


    Lottery.findOne(where).then((result: any) => {

        return res.status(RFC.H200).json(successMsg("Get Lottery", result));
    }).catch(error => {

        return res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}