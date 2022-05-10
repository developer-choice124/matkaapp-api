import { ObjectId } from "mongodb";

export interface NewLottery {
    _id:any;
    market_name:string;
    start_date:Date;
    open:string;
    close: string;
    supermaster: any;
    is_active:boolean;
    created_at:Date;
    updated_at:Date;
    deleted_at:any;
}

export interface LotteryDataType {
    bet_type : string;
    min_stake : number;
    max_stake : number;
    rate : number;
    lottery_id : any;
    created_at: Date;
    updated_at: Date;
    is_active: boolean;
    _id: string
}
