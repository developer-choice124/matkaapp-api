import { connectTable } from "./connectTable";
import { MongoError } from "mongodb";
import {model} from "./model";

export class Chart extends model{

    static _table = "chart";

    static searchIndexes=["bet_type","bedding_time","patti", "digit"];

    public static createOne(body:any){
        
        return new Promise<any>((resolve, reject) => {
            connectTable(Chart._table).insertOne(body, (err: MongoError, res:any) => {
                
                if(err){
                    reject(err);
                }
                resolve(res.ops);
            });
        });
    }

    public static createMany(body:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Chart._table).insertMany(body, (err, data)=>{
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
            connectTable(Chart._table).findOne(where, (err:MongoError, res:any)=>{
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
            connectTable(Chart._table).find(where).sort({created_at :-1}).toArray((err, data)=>{
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
            connectTable(Chart._table).updateOne(where, data, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(res);
                }
            });
        });
    }
    public static deleteOne(where:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Chart._table).deleteOne(where,(err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(res);
                }
            });
        });
    }
}