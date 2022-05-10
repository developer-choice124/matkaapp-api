import express, { Request, Response, NextFunction } from "express";

import { User } from "../models/User";
import { validator } from "../helpers/validator.helper";
import { hashPassword, verifyPassword } from "../helpers/hasher.helper";
import { generateOTP } from "../helpers/app.helper";
import { successMsg, errorMsg } from "../helpers/formatter.helper";
import { sendSms } from "../helpers/sms.helper";
import { RFC, VALIDATION_ERROR, USER_CREATED, USER_UPDATED, ROLES, COMMON_SUCCESS, INVALID_USER, LOGIN_SUCCESS } from "../../config/global";
import { NewUser, UserLogin, ChangePassword } from "../data-model/UserData";

import { generateToken } from "../helpers/jwt.helper";
import { ObjectId, Long } from "mongodb";
import { Betting } from "../models/Betting";
import { UserSetting } from "../models/Usersetting";
export function login(req: Request, res: Response) {

    let body: UserLogin = req.body;

    User.findOneDetails([{
        $match: { 'username': body.username, 'is_active': true, 'role': 'user' }
    }, {
        $lookup: {
            from: "users",
            localField: "parent_id",
            foreignField: "_id",
            as: "master",
        }
    }, {
        $lookup: {
            from: "users",
            localField: "master.parent_id",
            foreignField: "_id",
            as: "supermaster"
        }
    }]).then((result: any) => {

        result = result ? result[0] : null;

        var is_true = true;
        if (result.master.length > 0 || result.supermaster.length > 0) {
            if (result.master[0].is_active === true) {
                if (result.supermaster.length > 0) {
                    if (result.supermaster[0].is_active === false) {
                        is_true = false;
                        res.status(RFC.H401).json(errorMsg(INVALID_USER, ["Invalid username or password!"]));
                    }
                }
            } else {
                is_true = false;
                res.status(RFC.H401).json(errorMsg(INVALID_USER, ["Invalid username or password!"]));
            }
        }
        if (is_true) {
            var is_blocked = false;
            if (result.is_blocked) {
                is_blocked = true;
            } else {
                if (result.master.length > 0 || result.supermaster.length > 0) {
                    if (result.master[0].is_blocked === true) {
                        if (result.supermaster.length > 0) {
                            if (result.supermaster[0].is_blocked === true) {
                                is_blocked = true;
                            }
                        } else {
                            is_blocked = true;
                        }
                    } else {
                        is_blocked = false;
                    }
                }
            }
            console.log("login function: ", result.is_first_login)
            let { salt, password } = result.password;
            let { username, role, name, _id, parent_id } = result;
            var tokenData: any = "";
            var is_first_login = result.is_first_login;
            var supermaster_id: any, admin_id: any = "";
            supermaster_id = result.master[0].parent_id;
            admin_id = result.supermaster[0].parent_id;
            tokenData = { username, role, name, _id, parent_id, supermaster_id, admin_id, is_blocked, is_first_login };



            let token = generateToken({ data: tokenData });

            if (result) {
                // validate password
                verifyPassword(body.password, password, salt).then(
                    valid => {
                        res.status(RFC.H200).json(successMsg(LOGIN_SUCCESS, { _id, username, name, role, parent_id, supermaster_id, admin_id, is_blocked, is_first_login, 'token': token.token }));
                    }
                ).catch(err => {
                    res.status(RFC.H401).json(errorMsg(INVALID_USER, ["Invalid username or password!"]));
                });
            } else {
                res.status(RFC.H401).json(errorMsg(INVALID_USER, ''));
            }
        } else {
            res.status(RFC.H401).json(errorMsg(INVALID_USER, ''));
        }
    }).catch(err => {
        res.status(RFC.H401).json(errorMsg(INVALID_USER, err));
    });

}
export function adminlogin(req: Request, res: Response) {

    let body: UserLogin = req.body;

    User.findOneDetails([{
        $match: { 'username': body.username, 'is_active': true, role: { $ne: "user" } }
    }, {
        $lookup: {
            from: "users",
            localField: "parent_id",
            foreignField: "_id",
            as: "master",
        }
    }, {
        $lookup: {
            from: "users",
            localField: "master.parent_id",
            foreignField: "_id",
            as: "supermaster"
        }
    }]).then((result: any) => {

        result = result ? result[0] : null;

        var is_true = true;
        if (result.master.length > 0 || result.supermaster.length > 0) {
            if (result.master[0].is_active === true) {
                if (result.supermaster.length > 0) {
                    if (result.supermaster[0].is_active === false) {
                        is_true = false;
                        res.status(RFC.H401).json(errorMsg(INVALID_USER, ["Invalid username or password!"]));
                    }
                }
            } else {
                is_true = false;
                res.status(RFC.H401).json(errorMsg(INVALID_USER, ["Invalid username or password!"]));
            }
        }
        if (is_true) {
            var is_blocked = false;
            if (result.is_blocked) {
                is_blocked = true;
            } else {
                if (result.master.length > 0 || result.supermaster.length > 0) {
                    if (result.master[0].is_blocked === true) {
                        if (result.supermaster.length > 0) {
                            if (result.supermaster[0].is_blocked === true) {
                                is_blocked = true;
                            }
                        } else {
                            is_blocked = true;
                        }
                    } else {
                        is_blocked = false;
                    }
                }
            }
            let { salt, password } = result.password;
            let { username, role, name, _id, parent_id } = result;
            var is_first_login = result.is_first_login;
            var tokenData: any = "";
            var supermaster_id: any, admin_id: any = "";
            if (result.role == "master") {
                supermaster_id = result.master[0]._id;
                admin_id = result.master[0].parent_id;
                tokenData = { username, role, name, _id, supermaster_id, admin_id, is_blocked };
            } else if (result.role == "supermaster") {
                admin_id = result.parent_id;
                tokenData = { username, role, name, _id, admin_id, is_blocked };
            } else if (result.role == "admin") {
                admin_id = result._id;
                tokenData = { username, role, name, _id, parent_id, is_blocked };
            }


            let token = generateToken({ data: tokenData });

            if (result) {
                // validate password
                verifyPassword(body.password, password, salt).then(
                    valid => {
                        res.status(RFC.H200).json(successMsg(LOGIN_SUCCESS, { _id, username, name, role, parent_id, supermaster_id, admin_id, is_blocked, is_first_login, 'token': token.token }));
                    }
                ).catch(err => {
                    res.status(RFC.H401).json(errorMsg(INVALID_USER, ["Invalid username or password!"]));
                });
            } else {
                res.status(RFC.H401).json(errorMsg(INVALID_USER, ''));
            }
        } else {
            res.status(RFC.H401).json(errorMsg(INVALID_USER, ''));
        }
    }).catch(err => {
        res.status(RFC.H401).json(errorMsg(INVALID_USER, err));
    });

}

export function register(req: Request, res: Response, next: NextFunction) {

    const rules = {
        "username": "required|is_exists:users,username",
        "name": "required|min:2",
        "password": "required|min:6",
        "role": ['required', { 'in': ROLES }],
        "parent_id": "required"
    };

    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body: NewUser = req.body;
            let userbody: any = {};
            userbody.username = body['username'];
            userbody.name = body['name'];
            userbody.password = hashPassword(body['password']);
            userbody.role = body['role'];
            userbody.number = body['number'] ? body['number'] : '';
            userbody.is_first_login = body['is_first_login'] ? body['is_first_login'] : false;
            userbody.parent_id = body['parent_id'] ? new ObjectId(body['parent_id']) : 0;
            userbody.commission = body['commission'] ? parseInt(body['commission']) : 0;
            userbody.chips = Long.fromInt(0);
            userbody.is_active = true;
            userbody.is_locked = false;
            userbody.created_at = new Date();
            userbody.updated_at = new Date();
            userbody.deleted_at = null;

            User.createOne(userbody).then((result: any) => {
                let data = result[0];
                // remove password
                delete data.password;
                res.status(RFC.H201).json(successMsg(USER_CREATED, result));
            }).catch(error => {
                res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
            });
        }
    });
}
export function userregister(req: Request, res: Response, next: NextFunction) {

    const rules = {
        "username": "required|is_exists:users,username",
        "name": "required|min:2",
        "password": "required|min:6",
        "number": "required|min:10|max:10",
        "role": ['required', { 'in': ROLES }],
    };

    validator(req.body, rules, {}, async (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body: NewUser = req.body;
            let userbody: any = {};

            var is_whare = {
                "number": body['number'],
                "username": body['username']
            };
            var is_exist_user = await User.findOne(is_whare);

            if (!is_exist_user) {
                userbody.username = body['username'];
                userbody.name = body['name'];
                userbody.password = hashPassword(body['password']);
                userbody.role = body['role'];
                userbody.number = body['number'];
                userbody.parent_id = new ObjectId("5f74269a7962d344a00b9b4c");
                userbody.chips = Long.fromInt(0);
                userbody.otp = generateOTP();
                userbody.is_mobile_verified = false;
                userbody.is_active = true;
                userbody.is_locked = false;

                userbody.created_at = new Date();
                userbody.updated_at = new Date();
                userbody.deleted_at = null;

                User.createOne(userbody).then((result: any) => {
                    let data = result[0];
                    delete data.password;
                    var msg = `MATKA 777 -  Please use OTP : ${data.otp} for matka777.com Registration`;
                    sendSms(userbody.number, msg);

                    delete data.otp;

                    res.status(RFC.H201).json(successMsg(USER_CREATED, data));
                }).catch(error => {
                    res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
                });
            } else {
                res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, "This Number Already exist!"));
            }
        }
    });
}
export function verifyOtp(req: Request, res: Response, next: NextFunction) {

    const rules = {
        "otp": "required|min:6|max:6",
        "_id": "required"
    };

    validator(req.body, rules, {}, async (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;

            var is_whare = {
                "_id": new ObjectId(body['_id']),
                "role": "user"
            };
            var is_exist_user = await User.findOne(is_whare);

            if (is_exist_user && is_exist_user.otp === body['otp']) {
                var newvalues = { $set: { is_mobile_verified: true } };

                User.updateOne(is_whare, newvalues).then((result: any) => {
                    res.status(RFC.H200).json(successMsg(USER_UPDATED, result));
                }).catch(err => {
                    res.status(RFC.H401).json(errorMsg(INVALID_USER, err));
                });
            } else {
                res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, "This Number Already exist!"));
            }
        }
    });
}
export function forgotPassword(req: Request, res: Response, next: NextFunction) {

    const rules = {
        "number": "required|min:10|max:10"
    };

    validator(req.body, rules, {}, async (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;

            var is_whare = {
                "number": body.number
            };
            var is_exist_user = await User.findOne(is_whare);

            if (is_exist_user) {
                var newvalues = {
                    is_mobile_verified: false,
                    otp: generateOTP()
                };

                User.updateOne(is_whare, { $set: newvalues }).then((result: any) => {
                    delete is_exist_user.password;
                    delete is_exist_user.otp;
                    delete is_exist_user.is_mobile_verified;
                    var msg = `MATKA 777 -  Please use OTP : ${newvalues.otp} for matka777.com Registration`;
                    sendSms(body.number, msg);

                    res.status(RFC.H200).json(successMsg(USER_UPDATED, is_exist_user));
                }).catch(err => {
                    res.status(RFC.H401).json(errorMsg(INVALID_USER, err));
                });
            } else {
                res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, "This Number Is Not Available!"));
            }
        }
    });
}

export function changePassword(req: any, res: Response) {
    const rules = {
        "user_id": "required",
        "newpassword": "required|min:6",
        "cnewpassword": "required|min:6|same:newpassword"
    };
    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {

            let body: ChangePassword = req.body;
            if (body.newpassword === body.cnewpassword) {

                var where = { _id: new ObjectId(body.user_id) };
                var newvalues = {
                    $set: {
                        password: hashPassword(body['newpassword']),
                        is_first_login: body['is_first_login']
                    }
                };

                User.updateOne(where, newvalues).then((result: any) => {
                    res.status(RFC.H200).json(successMsg(USER_UPDATED, result));
                }).catch(err => {
                    res.status(RFC.H401).json(errorMsg(INVALID_USER, err));
                });

            } else {
                res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, "Both fields Are Not Equal."));
            }

        }
    });
}
export function all_list(req: Request, res: Response, next: NextFunction) {
    var where = {};
    let criteria: any;

    if (req.body) {
        criteria = req.body;
    } else {
        criteria = null
    }

    if (req.params.role) {
        where = { role: req.params.role, 'is_active': true };
    }
    if (req.params.id) {
        where = { role: req.params.role, parent_id: new ObjectId(req.params.id), 'is_active': true }
    }

    let query = [
        {
            $match: where
        },
        { $sort: { _id: -1 } },
    ]

    User.aggregateExtra(query, criteria)
        .then(result => {

            res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result.data, result.metadata));
        })
        .catch(err2 => {
            res.status(RFC.H401).json(errorMsg(VALIDATION_ERROR, err2));
        });
}

export function deleteOne(req: Request, res: Response, next: NextFunction) {

    var where: any = { _id: new ObjectId(req.params.id) };
    if (req.params.status === "true") {
        var newValue: any = {
            is_active: true,
            deleted_at: new Date()
        }
    } else {
        var newValue: any = {
            is_active: false,
            deleted_at: new Date()
        }
    }

    User.updateOne(where, { $set: newValue }).then((result: any) => {
        res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
    }).catch(error => {
        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}
export function findOne(req: Request, res: Response, next: NextFunction) {
    var where: any = { _id: new ObjectId(req.params.id) };

    User.findOne(where).then((result: any) => {
        res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result));
    }).catch(error => {
        res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
    });
}
export function update(req: Request, res: Response, next: NextFunction) {
    var where: any = { _id: new ObjectId(req.params.id) };
    const rules = {
        "name": "required|min:2"
    };
    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;

            var commission = body['commission'] ? parseInt(body['commission']) : 0;
            var number = body['number'] ? body['number'] : '';
            var newvalues = { $set: { name: body['name'], commission: commission, number: number } };

            User.updateOne(where, newvalues).then((result: any) => {

                res.status(RFC.H200).json(successMsg(USER_UPDATED, result));
            }).catch(err => {
                res.status(RFC.H401).json(errorMsg(INVALID_USER, err));
            });

        }
    });
}
export function blockedUser(req: Request, res: Response, next: NextFunction) {
    const rules = {
        "id": "required",
        "role": "required",
        "is_blocked": "required",
    };
    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            var where: any = { _id: new ObjectId(body.id) };

            var newvalues = { $set: { is_blocked: body.is_blocked } };
            User.updateOne(where, newvalues).then((result: any) => {
                res.status(RFC.H200).json(successMsg(USER_UPDATED, result));
            }).catch(err => {
                res.status(RFC.H401).json(errorMsg(INVALID_USER, err));
            });
        }
    });
}
export function getDeletedUser(req: Request, res: Response, next: NextFunction) {
    const rules = {
        "id": "required",
        "role": "required"
    };
    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {
            let body = req.body;
            var where: any = { is_active: false, parent_id: new ObjectId(body.id) };
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

            User.aggregateExtra(query, criteria)
                .then(result => {

                    res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result.data, result.metadata));
                })
                .catch(err2 => {
                    res.status(RFC.H401).json(errorMsg(VALIDATION_ERROR, err2));
                });
        }
    });
}


export function getListbyallid(req: Request, res: Response, next: NextFunction) {
    const rules = {
        "user_ids": "required"
    };
    validator(req.body, rules, {}, (err: any, status: any) => {
        if (!status) {
            res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
        } else {

            let body = req.body;
            var ids: any = [];
            if (body.user_ids.length > 0) {
                body.user_ids.map((id: any) => {
                    ids.push(new ObjectId(id));
                })
            }
            var where: any = {
                'role': "supermaster"
            };

            User.findAll(where).then((result: any) => {
                var userArray: any = [];
                if (body.user_ids.length > 0) {
                    result.map((user: any) => {
                        body.user_ids.map((id: any) => {
                            if (String(user._id) === String(id)) {
                                userArray.push(user);
                            }
                        })
                    })
                }

                res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, userArray));
            }).catch(error => {
                res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
            });
        }
    });
}

export function getCurtentBetsCount(req: any, res: any) {
    const date = new Date();
    const today = date.toLocaleDateString()
    const where = {
        user_id: new ObjectId(req.params.id),
        // lottery_id: new ObjectId(req.params.lotteryId),
        status: "PENDING",
        created_at: { $gte: new Date(today) }
    };
    Betting.findMany(where)
        .then(result => {
            res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, result.metadata));
        }).catch(error => {
            res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
        })
}

export function getCurtentBets(req: any, res: any) {
    const date = new Date();
    console.log("id: ", req.params.id)
    const today = date.toLocaleDateString()
    const where = {
        user_id: new ObjectId(req.params.id),
        status: "PENDING",
        created_at: { $gte: new Date(today) }
    };
    Betting.findMany(where)
        .then(result => {
            const data = result.data.map((element: any) => {
                return {
                    market_name: element.market_name,
                    bet_type: element.bet_type,
                    digit: element.digit,
                    betting_time: element.betting_time,
                    bet_amount: element.bet_amount,
                    is_active: element.is_active
                }
            });
            res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, data));
        }).catch(error => {
            res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
        })
}

export function getUserChipsById(req: any, res: any) {
    const where = { _id: new ObjectId(req.params.id) };
    User.findMany(where)
        .then(result => {
            const data = result.data.map((element: any) => {
                return {
                    chips: element.chips,
                }
            });
            res.status(RFC.H200).json(successMsg(COMMON_SUCCESS, data));
        })
        .catch(error => res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error)));
}

export async function setUserSetting(req: any, res: any) {
    const where = { user_id: new ObjectId(req.query.user_id) };
    const setting = await UserSetting.findOne(where);
    if (setting != null) {
        UserSetting.updateOne(where, {
            $set: { language: req.body.language }
        })
            .then((result: any) => {
                res.status(200).json(successMsg("user setting Updated successfully!", result))
            }).catch(err => {
                res.status(500).send(successMsg("user setting not found!", err))
            })
    } else {
        const rules = {
            "user_id": "required",
            "language": "required"
        };
        validator(req.body, rules, {}, async (err: any, status: any) => {
            if (!status) {
                res.status(RFC.H412).send(errorMsg(VALIDATION_ERROR, err.errors));
            } else {
                let body: UserSetting = req.body;
            let userbody: any = {};
                userbody.user_id = new ObjectId(req.body.user_id);
                userbody.language = body['language'];
                await UserSetting.insertOne(userbody).then((result: any) => {                
                    res.status(RFC.H201).json(successMsg(USER_CREATED, result));
                }).catch(error => {
                    res.status(RFC.H500).send(errorMsg(VALIDATION_ERROR, error));
                });
            }
        })
    }
}

export function  getUserSetting(req: any, res: any) {
    const where = { user_id: new ObjectId(req.query.user_id) }
    UserSetting.findOne(where)
        .then((result: any) => {
            res.status(200).json(successMsg("user setting found!", result))
        }).catch(err => {
            res.status(500).send(successMsg("user setting not found!", err))
        })
}