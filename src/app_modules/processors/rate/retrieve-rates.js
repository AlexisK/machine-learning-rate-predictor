const createUrl = date => `https://api.fixer.io/${date}?base=USD`;

const timeMult = 250;
const days = 500;
let date = new Date();
let results = new Array(days);

function req(url) {
    return new Promise(resolve => {
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", function() {
            resolve(this.responseText);
        });
        oReq.open("GET", url);
        oReq.send();
    });
}

function toLength(val, length = 2) {
    let strVal = val.toString();

    return new Array(length-strVal.length+1).join('0')+strVal;
}

for ( let i = days; i --> 0; ) {
    let reqDate = [date.getFullYear(), toLength(date.getMonth()+1), toLength(date.getDate())].join('-');
    let ind = i;

    setTimeout(() => {
        req(createUrl(reqDate)).then(result => {
            try {
                results[ind] = JSON.parse(result);
            } catch(err) {
                results[ind] = result;
            }
        });
    }, timeMult*i);


    date.setDate(date.getDate()-1);
}