import { connectTable } from "./connectTable";
import { MongoError } from "mongodb";
import {model} from "./model";

export class Chips extends model{

    static _table = "chips";

    static searchIndexes=["description","credit","debit","balance"];

    public static createOne(body:any){
        
        return new Promise<any>((resolve, reject) => {
            connectTable(Chips._table).insertOne(body, (err: MongoError, res:any) => {
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
            connectTable(Chips._table).find(where).sort({"created_at": -1}).toArray((err, data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }
    public static findAllByID(where:any={}){
        return new Promise<any>((resolve, reject) => {
            connectTable(Chips._table).find(where).sort({"created_at": -1}).toArray((err, data)=>{
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
            connectTable(Chips._table).findOne(where, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(res);
                }
            });
        });
    }
    public static updateOne(where:any, data:any){
        return new Promise<any>((resolve, reject) => {
            connectTable(Chips._table).updateOne(where, data, (err:MongoError, res:any)=>{
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
            connectTable(Chips._table).updateOne(where, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(res);
                }
            });
        });
    }
    public static aggregate(where:any={}){
        return new Promise<any>((resolve, reject) => {
            connectTable(Chips._table).aggregate(where).sort({"created_at": -1}).toArray((err, data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }

}