import {model} from "./model";
import { connectTable } from "./connectTable";
import { MongoError } from "mongodb";

export class User extends model{

    static _table = "users"

    static searchIndexes=["name","role","username"];

    public static createOne(body:any){
        
        return new Promise<any>((resolve, reject) => {
            connectTable(User._table).insertOne(body, (err: MongoError, res:any) => {
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
            connectTable(User._table).find(where).toArray((err, data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }

    public static findOneDetails(where:any){
        
        return new Promise<any>((resolve, reject) => {
            connectTable(User._table).aggregate(where).toArray((err, data)=>{
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
            connectTable(User._table).findOne(where, (err:MongoError, res:any)=>{
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
            connectTable(User._table).updateOne(where, data, (err:MongoError, res:any)=>{
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
            connectTable(User._table).deleteMany(where, (err:MongoError, res:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(res);
                }
            });
        });
    }

    // public static createParent(where:any){
    //     return new Promise<any>((resolve, reject) => {
    //         connectTable("parent_relation").insertOne(where, (err:MongoError, res:any)=>{
    //             if(err){
    //                 reject(err);
    //             }else{
    //                 resolve(res);
    //             }
    //         });
    //     });
    // }

}