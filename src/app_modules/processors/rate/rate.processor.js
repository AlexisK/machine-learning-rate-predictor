import { Processor } from 'core/classes';
import { RatePredictor } from './rate-predictor';

const preriodLength = 16;

export var RateProcessor = new Processor({
    name     : 'rate',
    template : require('./rate.html'),
    style    : require('./rate.scss'),
    events   : {},
    init     : (self, params) => {
        self.data = [
            5,8,9,8,5,2,1,2,
            5,8,9,8,5,2,1,2,
            5,8,9,8,5,2,1,2,
            5,8,9,8,5,2,1,2,
            5,8,9,8,5,2,1,2,
            5,8,9,8,5,2,1,2,
        ].map(v => Math.random()*v*4);
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
        }
    },
    process  : (self) => {
        let predictor = new RatePredictor(preriodLength);
        self.render = function() {
            predictor.learn(self.data);
            self.clear();
            self.renderData();
            self.renderPrediction([...self.data, ...predictor.predict(preriodLength)]);
        };
        self.render();
    }
});