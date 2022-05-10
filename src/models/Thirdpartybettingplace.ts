import { connectTable } from "./connectTable";
import { MongoError } from "mongodb";
import {model} from "./model";

export class Thirdpartybettingplace extends model{

    static _table = "thirdpartybettingplace";

    static searchIndexes=["name","role","username"];

    public static createOne(body:any){
        
        return new Promise<any>((resolve, reject) => {
            connectTable(Thirdpartybettingplace._table).insertOne(body, (err: MongoError, res:any) => {
                
                if(err){
                    reject(err);
                }
                resolve(res.ops);
            });
        });
    }
    
    public static createMany(body:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Thirdpartybettingplace._table).insertMany(body, (err, data)=>{
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
            
            connectTable(Thirdpartybettingplace._table).findOne(where, (err:MongoError, res:any)=>{
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
            connectTable(Thirdpartybettingplace._table).find(where).toArray((err, data)=>{
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
            connectTable(Thirdpartybettingplace._table).aggregate(where).toArray((err, data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }
}