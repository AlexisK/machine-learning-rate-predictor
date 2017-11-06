import { rendererService, dataAnchorsService } from 'core/services';

export function Processor(params) {
    var self = this;
    self._class = Processor;

    Object.assign(self, {
        init: () => {},
        process: () => {},
        destroy: () => {},
        events: {},
        template: null,
        style: null
    }, params);

    self.preInit = function(instance, params) {
        if ( self.template ) {
            instance.anchors = self.renderTemplate(self.template, instance.node).anchors;
        }
        for ( let selector in self.events ) {
            let [event, worker] = self.events[selector];

            if ( instance.anchors[selector] ) {
                instance.anchors[selector].forEach(node => {
                    node.addEventListener(event, worker.bind(instance));
                })
            }
        }
    };

    self.renderTemplate = function(html, target) {
        target = target || this.node;

        let docFragment = document.createDocumentFragment();
        let buffer = document.createElement('div');
        let child;
        let nodes = [];

        buffer.innerHTML = html;
        while( child = buffer.firstChild ) {
            docFragment.appendChild(child);
            nodes.push(child);
        }
        let anchors = dataAnchorsService.retrieveAnchors(docFragment);
        rendererService.process(docFragment);
        target.appendChild(docFragment);

        let removeDom = () => {
            nodes.forEach(node => {
                if ( node.parentNode ) {
                    node.parentNode.removeChild(node);
                }
            });
            nodes = [];
        };

        return {anchors, nodes, removeDom};
    };
}
Processor.scopedMethods = ['renderTemplate'];
