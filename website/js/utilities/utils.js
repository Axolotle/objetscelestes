export function getGuid() {
    //https://github.com/ajacksified/Mediator.js/blob/master/lib/mediator.js
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };

    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
