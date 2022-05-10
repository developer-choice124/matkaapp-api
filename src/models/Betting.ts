import { connectTable } from "./connectTable";
import { MongoError } from "mongodb";
import {model} from "./model";

export class Betting extends model{

    static _table = "betting";

    static searchIndexes=["market_name","bet_type", "betting_time", "rate", "digit", "bet_amount", "status"];

    public static createOne(body:any){
        
        return new Promise<any>((resolve, reject) => {
            connectTable(Betting._table).insertOne(body, (err: MongoError, res:any) => {
                
                if(err){
                    reject(err);
                }
                resolve(res.ops);
            });
        });
    }

    public static createMany(body:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Betting._table).insertMany(body, (err, data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }
    public static findAll(where:any={}){
        return new Promise<any>((resolve, reject) => {
            connectTable(Betting._table).aggregate(where).toArray((err, data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }
    public static findAllforAnnounce(where:any={}){
        return new Promise<any>((resolve, reject) => {
            connectTable(Betting._table).find(where).toArray((err, data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }
    public static updateOne(where:any, data:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Betting._table).updateOne(where, data, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(res);
                }
            });
        });
    }
    public static findOne(where:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Betting._table).findOne(where, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(res);
                }
            });
        });
    }
}