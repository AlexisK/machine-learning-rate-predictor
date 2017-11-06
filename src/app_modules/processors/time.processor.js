import { Processor } from 'core/classes';

export var TimeProcessor = new Processor({
    name    : 'time',
    init    : (self) => self.node.value = self.node.textContent,
    process : (self) => {
        var date = new Date(self.node.value);
        self.node.textContent = [date.getDate(), date.getMonth()+1, date.getFullYear()].join('/')
    }
});