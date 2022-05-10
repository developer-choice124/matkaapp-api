interface Response {
    msg:string,
    data: any,
    errors: any,
    Metadata: any,
}

export function successMsg(msg:string, data:any, Metadata:any = {})  : Response {
    return {
        msg: msg,
        data: data,
        errors: "",
        Metadata:Metadata
    };
}

export function errorMsg(msg:string, err:any,  Metadata:any = {}) : Response {
    return {
        msg: msg,
        data: "",
        errors: err,
        Metadata:Metadata
    };
}