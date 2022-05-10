const fetch = require('node-fetch');

export async function sendSms(number:number, msg:string){
    var url = `http://login.heightsconsultancy.com/API/WebSMS/Http/v1.0a/index.php?username=prashantv&password=password&sender=OTPMSG&to=${number}&message=${msg}&reqid=1&format={json|text}&route_id=113`;
    
    console.log(url);
    const response = await fetch(url);
    console.log(response);
    return response;

}