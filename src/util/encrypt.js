var CryptoJS = require("crypto-js");

export const Encrypt = (userid,password) =>{
    var utf8arr = CryptoJS.enc.Utf8.parse(password);
    var hash = CryptoJS.SHA256(utf8arr);
    return CryptoJS.enc.Base64.stringify(hash);
}