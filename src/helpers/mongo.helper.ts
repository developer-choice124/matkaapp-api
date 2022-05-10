import { MongoClient } from "mongodb";
import { rejects } from "assert";

export class MongoHelper {
    public static client: MongoClient;
    constructor(){}
    /**
     * connect to mongo db database
     */
    static async connect(url:string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            MongoClient.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}, (err, client: MongoClient) => {
                if(err){
                    reject(err);
                }else{
                    MongoHelper.client = client;
                    resolve(client);
                }
            });
        });
    }

    public disconnect():void{
        MongoHelper.client.close();
    }

}