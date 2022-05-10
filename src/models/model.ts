
import { connectTable } from "./connectTable";



export interface Result {
    data: any;
    metadata: any;
}

export class model {

    public static _table = "";
    public static searchIndexes: any = []

    //model states
    private static _readable() {
        return {
            // is_active: true,
            // deleted_at: null
        }
    }
    private static _nonReadable() {
        return {
            is_active: false,
            deleted_at: { $exists: true, $ne: null }
        }
    }
    private static _delete() {
        return {
            $set: { deleted_at: new Date() }
        }
    }
    private static _deactivate() {
        return { $set: { is_active: false } }
    }
    private static _activate() {
        return { $set: { is_active: true } }
    }
    //other data
    private static _getSearchIndex(keyword: string) {

        return this.searchIndexes.map((i: string) => {
            let index: any = {}
            index[i] = { $regex: keyword }
            return index;

        })
    }
    //model operations
    static insertOne(data: any) {

        data = Object.assign({}, data, this._readable());
        return connectTable(this._table).insertOne(data)

    }
    static insertMany(query: any) {

        // crafting query 

        query = Object.assign({}, query, this._readable());

        return connectTable(this._table).insertOne(query)

    }
    static findOne(query: any) {

        // crafting query
        query = Object.assign({}, query, this._readable());

        // getting data
        return connectTable(this._table).findOne(query)

    }
    static findByOrder(query: any, sort: any, max: number) {

        // crafting query
        query = Object.assign({}, query, this._readable());

        // getting data
        return connectTable(this._table).find(query).sort(sort).limit(max).toArray()

    }
    static findMany(query: any, criteria: any = null): Promise<Result> {


        let data: any = { where: {}, others: {} }

        if (criteria) {
            
            if(criteria.from===""||criteria.to===""){

                data.where = {  $or: this._getSearchIndex(criteria.search) }
                
                if(criteria.from!=""){
                    data.where["created_at"] ={$gte :new Date(criteria.from)};
                }
                if(criteria.to!=""){
                    data.where["created_at"]={$lt :new Date(criteria.to)};
                }
                
            }else{
                data.where = { created_at: { $gte: new Date(criteria.from), $lt: new Date(criteria.to) }, $or: this._getSearchIndex(criteria.search) }
            }
            data.others = { skip: criteria.offset, limit: criteria.limit }
        }

        // crafting query
        let query1 = Object.assign({}, query, this._readable(), data.where);

        return new Promise<Result>((resolve, reject) => {
            query["is_active"] = true;
            query["deleted_at"] = null;

            this.totalCount(query)
                .then(total => {

                    if (criteria) {

                        // crafting offset

                        let offset = data.others.skip > 0 ? ((data.others.skip - 1) * data.others.limit) : 0;
                        // getting data
                        connectTable(this._table)
                            .find(query1)
                            .sort({ _id: -1 })
                            .skip(offset)
                            .limit(data.others.limit)
                            .toArray()
                            .then(list => {
                                let result: Result = { data: list, metadata: { totalCount: total, foundCount: list.length } }
                                resolve(result)
                            })
                            .catch(list_err => {
                                reject(list_err)
                            });

                    } else {

                        // getting data
                        connectTable(this._table)
                            .find(query)
                            .sort({ _id: -1 })
                            .toArray()
                            .then(list => {
                                let result: Result = { data: list, metadata: { totalCount: total, foundCount: list.length } }
                                resolve(result)
                            })
                            .catch(list_err => {
                                reject(list_err)
                            });
                    }
                })
                .catch(err => {
                    reject(err);
                })

        })


    }
    static SelectMany(query: any, select: any) {

        // crafting query
        query = Object.assign({}, query, this._readable());

        // getting data
        return connectTable(this._table).find(query, select).toArray();

    }
    static deleteMany(query: any, erase: boolean): Promise<any> {

        if (!erase) {

            query = Object.assign({}, query, this._readable());

            return connectTable(this._table).updateMany(query, this._delete())
        } else {

            return connectTable(this._table).deleteMany(query);
        }

    }
    static deleteOne(query: any, erase: boolean = false): Promise<any> {

        if (!erase) {
            query = Object.assign({}, query, this._readable());

            return connectTable(this._table).updateOne(query, this._delete());

        } else {
            return connectTable(this._table).deleteOne(query)
        }

    }
    static updateOne(query: any, newValues: any) {

        query = Object.assign({}, query, this._readable());

        return connectTable(this._table).updateOne(query, newValues);

    }
    static updateMany(query: any) {

        query = Object.assign({}, query, this._readable());

        return connectTable(this._table).find(query).toArray()
    }
    static aggregate(query: any) {

        return connectTable(this._table).aggregate(query).sort({ _id: -1 }).toArray()

    }
    static aggregateExtra(query: any, criteria: any = null): Promise<Result> {

        

        let data: any = { where: {}, others: {} }

        if (criteria) {

            if(criteria.from===""||criteria.to===""){
              
                data.where = {  $or: this._getSearchIndex(criteria.search) }

                if(criteria.from!=""){
                    data.where["created_at"] ={$gte :new Date(criteria.from + 'T00:00:00.000Z')};
                }
                if(criteria.to!=""){
                    data.where["created_at"]={$lt :new Date(criteria.to+ 'T23:59:00.000Z')};
                }
                
            }else{
                data.where = { created_at: { $gte: new Date(criteria.from + 'T00:00:00.000Z'), $lt: new Date(criteria.to+ 'T23:59:00.000Z') }, $or: this._getSearchIndex(criteria.search) }
            }
            

            data.others = { skip: criteria.offset, limit: criteria.limit }
        }
        let meta_query = Object.assign({}, query[0].$match)
        
        data.others.skip = data.others.skip > 0 ? ((data.others.skip - 1) * data.others.limit) : 0;
        
        return new Promise<Result>((resolve, reject) => {
            this.totalCount(meta_query).then(total => {  
                
                if (criteria) {
                    query[0].$match = Object.assign({}, query[0].$match,data.where )  
                    
                    connectTable(this._table)
                        .aggregate(query)
                        .sort({ _id: -1 })
                        .skip(data.others.skip)
                        .limit(data.others.limit)
                        .toArray()
                        .then(list => {
                            
                            let result: Result = { data: list, metadata: { totalCount: total, foundCount: list.length } }
                            resolve(result);

                        })
                        .catch(list_err => {

                            reject(list_err);

                        })

                } else {

                    connectTable(this._table)
                    .aggregate(query)
                    .sort({ _id: -1 })
                    .toArray()
                    .then(list => {
                        let result: Result = { data: list, metadata: { totalCount: total, foundCount: list.length } }
                        resolve(result)
                    })
                    .catch(list_err => {
                        reject(list_err)
                    })
                }
            }).catch(err => {
                reject(err)
            })
        })
    }
    static getRecentOne(query: any): Promise<any> {


        query = Object.assign({}, query, this._readable());

        return new Promise<any>((resolve, reject) => {
            this.findByOrder(query, { _id: -1 }, 1).then(result => {
                resolve(result[0]);
            }).catch(err => {
                reject(err);
            });
        });

    }
    static getRecentMax(query: any, max: any): Promise<any> {

        query = Object.assign({}, query, this._readable());
        return new Promise<any>((resolve, reject) => {

            this.findByOrder(query, { _id: -1 }, max).then(result => {
                resolve(result[0]);
            }).catch(err => {
                reject(err);
            });
        });
    }
    static updateCustom(_tablen: string, query: any, newValues: any) {

        return connectTable(_tablen).updateMany(query, { $set: newValues })

    }
    static deleteCustom(_tablen: string, query: any, erase: boolean): Promise<any> {

        if (!erase) {

            query = Object.assign({}, query, this._readable());

            return connectTable(_tablen).updateMany(query, this._delete())
        } else {

            return connectTable(_tablen).deleteMany(query)
        }
    }

    static totalCount(query: any) {
        
        return connectTable(this._table).find(query).count()

    }
    static totalCountAsync(query: any) {

        return connectTable(this._table).find(query).count()

    }
}