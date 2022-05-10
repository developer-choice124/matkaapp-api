import { MongoHelper } from "../helpers/mongo.helper";
import { config } from "../../config/config";

export const connectTable = (collection:string) => {
    return MongoHelper.client.db(config.database.dbname).collection(collection);
}