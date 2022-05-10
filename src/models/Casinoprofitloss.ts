import { connectTable } from "./connectTable";
import { MongoError } from "mongodb";
import {model} from "./model";

export class Casinoprofitloss extends model{
    static _table = "casinoprofitloss";

    static searchIndexes=["winnerDescription","marketName","marketId"];

    public static createOne(body:any){
        
        return new Promise<any>((resolve, reject) => {
            connectTable(Casinoprofitloss._table).insertOne(body, (err: MongoError, res:any) => {
                
                if(err){
                    reject(err);
                }
                resolve(res.ops);
            });
        });
    }
    
    public static createMany(body:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Casinoprofitloss._table).insertMany(body, (err, data)=>{
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
            
            connectTable(Casinoprofitloss._table).findOne(where, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(res);
                }
            });
        });
    }
    public static findAll(where:any={}){
        return new Promise<any>((resolve, reject) => {
            connectTable(Casinoprofitloss._table).find(where).toArray((err, data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }
    
    public static aggregate(where:any={}){
        return new Promise<any>((resolve, reject) => {
            connectTable(Casinoprofitloss._table).aggregate(where).toArray((err, data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }
    public static deleteOne(where:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Casinoprofitloss._table).deleteMany(where, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(res);
                }
            });
        });
    }
}