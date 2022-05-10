import jwt from "jsonwebtoken";
import { v4 as uuid4 } from "uuid";
const crypto = require('crypto');
import { config } from "../../config/config";

function generateToken(payload:any = {}){
    let jti = uuid4();
    let token = jwt.sign(
        payload, 
        config.jwt.secret, 
        {
            expiresIn: config.jwt.expiresIn,
            issuer: config.jwt.issuer,
            algorithm: 'HS512',
            jwtid: jti
        }
    );
    return {
        jti: jti,
        token: token
    };
}

function verifyToken(token:any = null) {
    return new Promise((resolve, reject) => {
        try{
            
            let decoded = jwt.verify(token, config.jwt.secret);
            resolve(decoded);
        }catch(err){
            reject(err);
        }
    });
}
export {
    generateToken,
    verifyToken
};