import {randomBytes, pbkdf2Sync} from "crypto";
import { BYTES, ITERATION, KEY_LENGTH, DIGEST } from "../../config/global";

export function hashPassword(password:string) {
    let salt = randomBytes(BYTES).toString('hex');
    let hash = pbkdf2Sync(password, salt, ITERATION, KEY_LENGTH, DIGEST).toString('hex');
    return {
        salt:salt,
        password: hash
    };
}

export function verifyPassword(plain_password:any, hash_password:any, salt:any): Promise<any> {
    return new Promise((resolve, reject) => {
        let hash = pbkdf2Sync(plain_password, salt, ITERATION, KEY_LENGTH, DIGEST).toString('hex');
        if(hash === hash_password){
            resolve(true);
        }else{
            reject(false);
        }
    })
}