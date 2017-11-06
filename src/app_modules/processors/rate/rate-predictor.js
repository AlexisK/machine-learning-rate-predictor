const relearnAttempts = 100;
const learnRate = 0.1;

export class RatePredictor {
    constructor(periodLength) {
        this.periodLength = periodLength;
        this.weights = new Array(periodLength);
        this.periodIndex = 0;
    }

    initialData(dataArray) {
        let startInd = this.learnData.length % this.periodLength;
        this.weights = dataArray.slice(startInd, startInd+this.periodLength);
        this.streamIndex = this.periodLength;
    }

    learnPeriod(data) {
        if ( data.length < this.periodLength) {
            this.periodIndex = data.length;
        }
        for ( let i = 0; i < data.length; i++) {
            let diff = data[i] - this.weights[i];
            this.weights[i] += diff * learnRate;
        }
    }

    relearn() {
        if ( this.learnData ) {
            let startInd = this.learnData.length % this.periodLength;
            this.learnPeriod([...this.weights.slice(0, startInd), ...this.learnData.slice(0,this.periodLength-startInd)]);

            for ( let i = startInd, j = startInd + this.periodLength;
                  i < this.learnData.length;
                  i += this.periodLength, j += this.periodLength) {
                this.learnPeriod(this.learnData.slice(i, j))
            }
        }
    }

    learn(data) {
        this.learnData = data;
        this.initialData(data);
        for (let i = relearnAttempts; i --> 0;) {
            this.relearn();
        }
    }

    predict(length) {
        return [...this.weights.slice(this.periodIndex), ...this.weights.slice(0, this.periodIndex)];
    }
}