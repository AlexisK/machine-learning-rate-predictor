import { Processor } from 'core/classes';
import { RatePredictor } from './rate-predictor';
import { PeriodCalculator } from './period-calculator';

export var RateProcessor = new Processor({
    name     : 'rate',
    template : require('./rate.html'),
    style    : require('./rate.scss'),
    events   : {},
    init     : (self, params) => {
        self.data = [
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
            5,8,9,8,2,1,2,
        ].map(v => Math.round((Math.random()+2)*v*1.7+5));
        self.clearWorkers = [];

        // methods
        self.clear = function() {
            self.clearWorkers.forEach(w => w());
            self.clearWorkers = [];
        };

        self._render = function(anchor, data) {
            data.forEach(value => {
                let {nodes, removeDom, anchors} = self.renderTemplate(require('./bar.html'), anchor);
                anchors.fill[0].style.height = value*10 + 'px';
                anchors.fill[0].textContent = value;
                self.clearWorkers.push(removeDom);
            })
        };

        self.renderData = function() {
            self._render(self.anchors.data[0], self.data);
        };

        self.renderPrediction = function(data) {
            self._render(self.anchors.prediction[0], data);
        };

        self.render = function() {
            self.clear();
            self.renderData();
            self.renderPrediction();
        };

        self.calculatePeriod = function() {
            return new Promise(resolve => {
                let calc = new PeriodCalculator();
                resolve(calc.calculate(this.data));
            });
        }
    },
    process  : (self) => {
        self.render = function() {
            self.clear();
            self.renderData();
            self.calculatePeriod()
                .then(periodLength => {
                    let predictor = new RatePredictor(periodLength);
                    predictor.learn(self.data);
                    self.renderPrediction([...self.data, ...predictor.predict(periodLength)]);
                });
        };
        self.render();
    }
});