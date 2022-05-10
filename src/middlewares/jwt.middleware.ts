import { Request, Response, NextFunction } from "express";

import { errorMsg } from "../helpers/formatter.helper";
import { RFC, UNAUTHORIZED_ACCESS, JWT_NOT_FOUND, SECRETKEY } from "../../config/global";
import { verifyToken} from "../helpers/jwt.helper";
// const verifyHmacSignature = require('express-verify-hmac-signature');
const crypto = require('crypto');

function jwtMiddleware(req:any, res: Response, next: NextFunction) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    
    
    if(token) {
        
        const authHeader:any = req.headers.authorization;
        const isJwt = authHeader.includes('JWT ');
        if (isJwt){
            const token = authHeader.replace('JWT ', '');
            verifyToken(token).then((result:any) => {
                req.auth = result['data'];
                next();
            }).catch(err => {
                res.status(RFC.H401).json(errorMsg('',[err.name, err.message ]));
            });
        }else{
            res.status(RFC.H404).json(errorMsg('',JWT_NOT_FOUND));
        }
    }else {
        // res.sendStatus(401);
        res.status(RFC.H401).json(errorMsg('',UNAUTHORIZED_ACCESS));
    }
}

function casinoMiddleware(req:any, res: Response, next: NextFunction) {
    let token = req.headers['x-access-token'] || req.headers['hash'];
    var Error:any = {
        errorCode: 2,
        errorDescription: "hash not matched",
    };
    
    if(token) {
        
        const authHeader:any = req.headers.hash;
        
        if (authHeader){
            
            let createSigneture = crypto.createHmac('sha256', SECRETKEY).update(req.body).digest('base64');

            if (authHeader === createSigneture) {
                
                next();
            }else{
                
                Error.hash = authHeader;
                Error.createdhash = createSigneture;
                
               res.status(RFC.H200).json(Error);
            }
            
        }else{
            res.status(RFC.H200).json(Error);
        }
    }else {
        res.status(RFC.H200).json(Error);
    }
}


export {
    jwtMiddleware, casinoMiddleware
}