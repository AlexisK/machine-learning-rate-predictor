const MessageTypes = {
    question: true,
    statement: true
};

const WordTypes = {
    target: true,
    name: true,
    action: true,
    characteristic: true
};

const DB = window['DB'] = {};

function ChatService() {
    var self = this;
    self._class = ChatService;

    self.userChats = [];
    self.adminChats = [];

    self.registerChat = function(instance, params) {
        if ( params === 'admin' ) {
            self.adminChats.push(instance);
        } else {
            self.userChats.push(instance);
            self.sayToUser('Welcome', instance);
        }
    };

    self.sayToUser = function(message, instance, author = 'ML-ChatBot') {
        if ( !instance ) {
            return self.userChats.forEach(inst => self.sayToUser(message, inst));
        }
        instance.write(message, {
            isSystem: true,
            author
        })
    };
    self.log = function(message, author) {
        return self.adminChats.forEach(inst => self.sayToUser(message, inst, author));
    };

    self.parseMessage = function(message) {
        let re = /(\w+)/g;
        let match;
        let promises = [];
        let words = [];

        while( match = re.exec(message) ) {
            let word = match[1].toLowerCase();
            promises.push(self.processWord(word));
            words.push(word);
        }
        Promise.all(promises).then(() => {
            self.log(words.map(word => DB[word][0] ? DB[word][0].type : '').join(', '));
            words.forEach(word => {
                self.log(DB[word].map(dataSet => dataSet.defenition).join('\n'), word);
            })
        });
    };
    self.processWord = function(word) {
        if ( DB[word] ) {
            return Promise.resolve(DB[word]);
        }
        return self.askMeaning(word);
    };
    self.askMeaning = function(word) {
        return new Promise(resolve => {

            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                resolve(DB[word] = JSON.parse(this.responseText));
            });
            oReq.open("GET", '/dictionary/'+word+'?format=json');
            oReq.send();
        });
    };
    self.userSays = self.parseMessage;
}

export var chatService = new ChatService();
