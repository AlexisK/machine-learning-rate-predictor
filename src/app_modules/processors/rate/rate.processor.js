import { Processor } from 'core/classes';
import { RatePredictor } from './rate-predictor';
import { PeriodCalculator } from './period-calculator';
import {REALDATA} from './realdata';


const filteredRealData = REALDATA
    .filter(v => !!v && v.date)
    .reduce((acc, item) => {
        acc[item.date] = item.rates.EUR;
        return acc;
    }, {});

export var RateProcessor = new Processor({
    name     : 'rate',
    template : require('./rate.html'),
    style    : require('./rate.scss'),
    events   : {},
    init     : (self, params) => {
        /*
        self.data         = [
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
            5, 8, 9, 8, 2, 1, 2,
        ].map(v => Math.round((Math.random() + 2) * v * 1.7 + 5));
        */
        self.data         = Object.keys(filteredRealData)
            .sort()
            .map(k => filteredRealData[k]);

            self.clearWorkers = [];

        // methods
        self.clear = function () {
            self.clearWorkers.forEach(w => w());
            self.clearWorkers = [];
        };

        self._render = function (anchor, data) {
            let min = data[0];
            let max = data[0];

            data.forEach(value => {
                min = Math.min(min, value);
                max = Math.max(max, value);
            });
            let diff = max - min;

            data.forEach(value => {
                let {nodes, removeDom, anchors} = self.renderTemplate(require('./bar.html'), anchor);
                anchors.fill[0].style.height = Math.round((value - min) / diff * 100) + '%';
                anchors.fill[0].textContent  = value;
                self.clearWorkers.push(removeDom);
            })
        };

        self.renderData = function () {
            self._render(self.anchors.data[0], self.data);
        };

        self.renderPrediction = function (data) {
            self._render(self.anchors.prediction[0], data);
        };

        self.render = function () {
            self.clear();
            self.renderData();
            self.renderPrediction();
        };

        self.calculatePeriod = function () {
            return new Promise(resolve => {
                let calc = new PeriodCalculator();
                resolve(calc.calculate(this.data));
            });
        }
    },
    process  : (self) => {
        self.render = function () {
            self.clear();
            self.renderData();
            self.calculatePeriod()
                .then(periodLength => {
                    let predictor = new RatePredictor(periodLength);
                    let learnData = self.data.slice(0, -periodLength);
                    predictor.learn(learnData);
                    self.renderPrediction([
                        ...learnData,
                        ...predictor.predict(),
                        ...(predictor.learn(self.data.slice(-periodLength)) && predictor.predict())
                    ]);
                });
        };
        self.render();
    }
});