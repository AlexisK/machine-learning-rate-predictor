import { Processor } from 'core/classes';
import { chatService } from './chat.service';

export var ChatProcessor = new Processor({
    name    : 'chat',
    template: require('./chat.html'),
    style   : require('./chat.scss'),
    events: {
        input: ['keyup', function(ev) {
            if ( ev.keyCode === 13 ) {
                let value = this.anchors.input[0].value;
                this.write(value);
                this.chatService.userSays(value);
                this.anchors.input[0].value = '';
            }
        }]
    },
    init    : (self, params) => {
        self.chatService = chatService;
        self.write = function(message, params = {}) {
            let {anchors} = self.renderTemplate(require('./message.html'), this.anchors.output[0]);
            anchors.content[0].textContent = message;
            if ( params.author ) {
                anchors.author[0].textContent = params.author;
            }
            if ( params.isSystem ) {
                anchors.root[0].classList.add('system');
            }
        };
        chatService.registerChat(self, params);
    },
    process : (self) => {}
});