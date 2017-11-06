import { RatePredictor } from './rate-predictor';
const range = [1, 30];

export class PeriodCalculator {
    constructor() {
        this.diffs = new Array(range[1]-range[0]);
    }

    calculate(data) {
        for ( let i = 0, period = range[0]; period < range[1]; i++, period++) {
            this.diffs[i] = this.calculateForPeriod(data, period);
        }

        let index = 0;
        let smallestDiff = this.diffs[0];
        this.diffs.forEach((diff, ind) => {
            if ( diff < smallestDiff) {
                smallestDiff = diff;
                index = ind;
            }
        });
        console.log('Using period of:', index + range[0]);
        return index + range[0];
    }

    calculateForPeriod(data, period) {
        let predictor = new RatePredictor(period);
        let learnDataLength = data.length-period;
        predictor.learn(data.slice(0, learnDataLength));

        return predictor.predict(period).reduce((acc, predicted, ind) => {
            return acc +  Math.abs(predicted - data[learnDataLength+ind]);
        }, 0) / period;
    }
}