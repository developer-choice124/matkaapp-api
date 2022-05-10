export interface BettingData {
    market_name : string;
    bet_type : string;
    betting_time : string;
    rate : number;
    digitlist : any;
    user_id:string;
    lottery_id : string;
}
export interface BettingAnnounceData {
    lottery_id : string;
    bet_type : any;
    betting_time : string;
    digit : number;
    patti : number;
    min_date :Date;
}