import express from "express";

import { login, adminlogin, register, changePassword, all_list, deleteOne, forgotPassword, userregister, findOne, update, verifyOtp, blockedUser, getDeletedUser, getListbyallid, getCurtentBets, getCurtentBetsCount, getUserChipsById, setUserSetting, getUserSetting } from "../src/controllers/Users.controller";
import { jwtMiddleware } from "../src/middlewares/jwt.middleware";
import * as bodyParser from "body-parser";
let users_router = express.Router();
let body_Parser = bodyParser.json();

// User Login
users_router.post('/login', body_Parser, login);
users_router.post('/admin-login', body_Parser, adminlogin);
users_router.post('/auth-change-password', body_Parser, changePassword);
// User Register
users_router.post('/register', body_Parser, register);
users_router.post('/user-registration', body_Parser, userregister);
users_router.post('/verify-otp', body_Parser, verifyOtp);
users_router.post('/forgot-password', body_Parser, forgotPassword);
// setUserSetting
users_router.post('/user-setting',body_Parser, setUserSetting);
// User Change Password
users_router.get('/user/:id', body_Parser, jwtMiddleware, findOne);
users_router.post('/change-password', body_Parser, jwtMiddleware, changePassword);
users_router.post('/update/:id', body_Parser, jwtMiddleware, update);
users_router.post('/all-users', body_Parser, jwtMiddleware, all_list);
users_router.post('/all-users/:role', body_Parser, jwtMiddleware, all_list);
users_router.post('/all-users/:role/:id', body_Parser, jwtMiddleware, all_list);
users_router.post('/delete-user/:id/:status', body_Parser, jwtMiddleware, deleteOne);
users_router.post('/blocked-user', body_Parser, jwtMiddleware, blockedUser);
users_router.post('/get-deleted-user', body_Parser, jwtMiddleware, getDeletedUser);
users_router.post('/get-user-list', body_Parser, jwtMiddleware, getListbyallid);
users_router.get('/currentbetscount/:id', jwtMiddleware, getCurtentBetsCount)
users_router.get('/currentbets/:id', jwtMiddleware, getCurtentBets);
users_router.get("/chipsbyid/:id", jwtMiddleware, getUserChipsById);
// getUserSetting
users_router.get("/get-user-setting",jwtMiddleware, getUserSetting)
export {
    users_router
};