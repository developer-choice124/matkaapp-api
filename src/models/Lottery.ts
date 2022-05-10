import { connectTable } from "./connectTable";
import { MongoError } from "mongodb";
import {model} from "./model";

export class Lottery extends model{

    static _table = "lottery";

    static searchIndexes=["name","role","username"];

    public static createOne(body:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Lottery._table).insertOne(body, (err: MongoError, res:any) => {
                if(err){
                    reject(err);
                }
                resolve(res.ops);
            });
        });
    }

    public static updateOne(where:any, data:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Lottery._table).updateOne(where, data, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }
                resolve(res.ops);
            });
        });
    }

    public static createMany(body:any){

    }

    public static findAll(where:any={}){
        return new Promise<any>((resolve, reject) => {
            connectTable(Lottery._table).find(where).toArray((err, data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }
    public static count(where:any={}){
        return new Promise<any>((resolve, reject) => {
            connectTable(Lottery._table).count(where, (err: MongoError, res:any) => {
                if(err){
                    reject(err);
                }
                resolve(res.ops);
            });
        });
    }

    public static findOne(where:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Lottery._table).findOne(where, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(res);
                }
            });
        });
    }

    // private static _table_setting = "lottery_setting";

    // public static createSetting(body:any){
    //     return new Promise<any>((resolve, reject) => {
    //         connectTable(Lottery._table_setting).insertOne(body, (err: MongoError, res:any) => {
    //             if(err){
    //                 reject(err);
    //             }
    //             resolve(res.ops);
    //         });
    //     });
    // }
    // public static findAllsetting(where:any={}){
    //     return new Promise<any>((resolve, reject) => {
    //         connectTable(Lottery._table_setting).find(where).toArray((err, data)=>{
    //             if(err){
    //                 reject(err);
    //             }else{
    //                 resolve(data);
    //             }
    //         });
    //     });
    // }
    // public static updateOnesetting(where:any, data:any){
    //     return new Promise<any>((resolve, reject) => {
    //         connectTable(Lottery._table_setting).updateOne(where, data, (err:MongoError, res:any)=>{
    //             if(err){
    //                 reject(err);
    //             }
    //             resolve(res.ops);
    //         });
    //     });
    // }
    // public static findOnesetting(where:any){
    //     return new Promise<any>((resolve, reject) => {
    //         connectTable(Lottery._table_setting).find(where).toArray((err, data) =>{
    //             if(err){
    //                 reject(err);
    //             }else{
    //                 resolve(data);
    //             }
    //         });
    //     });
    // }

}