import { connectTable } from "./connectTable";
import { MongoError } from "mongodb";
import {model} from "./model";

export class LotteryType extends model{

    static _table = "lottery_types";

    static searchIndexes=["name","role","username"];

    public static createOne(body:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(LotteryType._table).insertOne(body, (err: MongoError, res:any) => {
                if(err){
                    reject(err);
                }
                resolve(res.ops);
            });
        });
    }

    /**
     * update
     */
    public static updateOne(where:any, data:any) {
        return new Promise<any>((resolve, reject) => {
            connectTable(LotteryType._table).updateOne(where, data, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }
                resolve(res.ops);
            });
        });
    }

    public static findAll(where:any={}){
        return new Promise<any>((resolve, reject) => {
            connectTable(LotteryType._table).find(where).toArray((err, data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }
    
    public static findOne(where:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(LotteryType._table).find(where).toArray((err, data) =>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }

}