
export function randomString( username : any, size = 4) {  
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < size; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return username+result;
} 

export function stringSeprator(digit : any) {
    digit = String(digit);
    var digitArray = [];
    for(var i = 0; digit.length > i; i++){
        digitArray.push(digit[i]);
    }
    return digitArray;
}
export function sumofArray(dsplit:any){
    var sum = dsplit.reduce(function(a:any, b:any){
        return  Number(a) + Number(b);
    }, 0);
    return sum;
}

export function generateOTP()
{
    var digits = '0123456789abcdefghijklmnopqrstuvwxyz';
    var otpLength = 6;
    var otp = '';
    for(let i=1; i<=otpLength; i++){
        var index = Math.floor(Math.random()*(digits.length));
        otp = otp + digits[index];
    }

    return otp;

}