const Validator = require('validatorjs');

import { MongoError } from "mongodb";
import { connectTable } from "../models/connectTable";
import { IS_EXISTS } from "../../config/global";

function formatErrors(err:any):any{
    let errorsMessage:any = [];
    for(let el in err){
        errorsMessage.push(err[el][0]);
    }
    return {
        errors: errorsMessage
    };
}

// Checking validation if data exists in collections
Validator.registerAsync("is_exists", function(match:any, attribute:any, req:any, passes:any){
    var matchCol = attribute.split(',');
    if(matchCol.length == 2){
        let table = matchCol[0];
        let column = matchCol[1];
        let where:any = {};
        where[column] = match;
        
        connectTable(table).find(where).toArray((err: MongoError, result:any) => {
            if(result.length == 0){
                passes();
            }
            passes(false, IS_EXISTS);
        });
    }
});

// global validation
export const validator = (body:any, rules:any, customMessages:any, callback:any) => {
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(formatErrors(validation.errors.errors), false));
};