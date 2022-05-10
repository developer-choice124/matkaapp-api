import { connectTable } from "./connectTable";
import { MongoError } from "mongodb";
import {model} from "./model";

export class Accountstatement extends model{
    static _table = "accountstatement";
    static searchIndexes=["market_name","betting_time","bet_type","profit","loss","amount", "status"];

    public static createOne(body:any){
        
        return new Promise<any>((resolve, reject) => {
            connectTable(Accountstatement._table).insertOne(body, (err: MongoError, res:any) => {
                
                if(err){
                    reject(err);
                }
                resolve(res.ops);
            });
        });
    }

    public static findOne(where:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Accountstatement._table).findOne(where, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(res);
                }
            });
        });
    }
    public static createMany(body:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Accountstatement._table).insertMany(body, (err, data)=>{
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
            connectTable(Accountstatement._table).aggregate(where).sort({"created_at": -1}).toArray((err, data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }
    public static findAllList(where:any={}){
        return new Promise<any>((resolve, reject) => {
            connectTable(Accountstatement._table).find(where).sort({"created_at": -1}).toArray((err, data)=>{
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
            connectTable(Accountstatement._table).updateOne(where, data, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(res);
                }
            });
        });
    }
}