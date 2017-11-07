const relearnAttempts = 100;
const learnRate = 0.05;

export class RatePredictor {
    constructor(periodLength) {
        this.periodLength = periodLength;
        this.weights = new Array(periodLength);
        this.periodIndex = 0;
    }

    initialData(dataArray) {
        let startInd = this.learnData.length % this.periodLength;
        let endInd = startInd+this.periodLength;
        let prev = this.learnData[startInd-1] || this.learnData[0];

        for ( let i = 0, j = startInd; j < endInd; i++, j++ ) {
            this.weights[i] = dataArray[j] / prev;
            prev *= this.weights[i];
        }
    }

    learnPeriod(data, prev) {
        if ( prev === 0 ) {
            prev = 0.0000001;
        }
        if ( data.length < this.periodLength) {
            this.periodIndex = data.length;
        }
        for ( let i = 0; i < data.length; i++) {
            let mult = data[i] / prev;
            let diff = mult - this.weights[i];
            this.weights[i] += diff * learnRate;
            prev *= mult;
        }
    }

    relearn() {
        if ( this.learnData.length ) {
            let startInd = this.learnData.length % this.periodLength;
            this.learnPeriod([...this.weights.slice(0, startInd), ...this.learnData.slice(0,this.periodLength-startInd)], this.learnData[0]);

            for ( let i = startInd, j = startInd + this.periodLength;
                  i < this.learnData.length;
                  i += this.periodLength, j += this.periodLength) {
                this.learnPeriod(this.learnData.slice(i, j), this.learnData[i-1] || this.learnData[0])
            }
        }
    }

    learn(data) {
        if ( !this.learnData ) {
            this.learnData = data;
            this.initialData(data);
        } else {
            this.learnData = [...this.learnData, ...data];
        }
        for (let i = relearnAttempts; i --> 0;) {
            this.relearn();
        }
        return true;
    }

    predict(length) {
        let prev = this.learnData[this.learnData.length-1];
        let results = [];

        for ( let i = this.periodIndex; i < this.periodLength; i++) {
            results.push(prev * this.weights[this.periodIndex+i]);
        }
        for ( let i = 0; i < this.periodIndex; i++) {
            results.push(prev * this.weights[i]);
        }
        return results;
    }
}