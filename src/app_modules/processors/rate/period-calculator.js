import { RatePredictor } from './rate-predictor';
const range             = [1, 100];
const lengthDiffFallExp = 0.99;

export class PeriodCalculator {
    constructor() {
    }

    calculate(data) {
        this.max   = Math.min(range[1], Math.floor(data.length / 2));
        this.diffs = new Array(this.max - range[0]);

        for (let i = 0, period = range[0]; period < this.max; i++, period++) {
            this.diffs[i] = this.calculateForPeriod(data, period);
        }

        let index        = 0;
        let smallestDiff = this.diffs[0];
        this.diffs.forEach((diff, ind) => {
            if ( diff < smallestDiff ) {
                smallestDiff = diff;
                index        = ind;
            }
        });
        console.log('Using period:', index + range[0],
            '\nwith precision:', smallestDiff);
        return index + range[0];
    }

    calculateForPeriod(data, period) {
        let predictor       = new RatePredictor(period);
        let learnDataLength = data.length - period;
        predictor.learn(data.slice(0, learnDataLength));

        return predictor
                .predict(period)
                .reduce((acc, predicted, ind) => {
                    return acc + Math.abs((predicted - data[learnDataLength + ind]));
                }, 0) / period * Math.pow(lengthDiffFallExp, period);
    }
}