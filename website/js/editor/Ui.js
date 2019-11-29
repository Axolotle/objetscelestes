import Subscriber from '../utilities/Subscriber.js';
import Mouse from './components/Mouse.js';
import UiFactory from './UiFactory.js';


class Ui extends Subscriber {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.mouse = new Mouse();
        this.init();
    }

    init() {
        this.canvas.addEventListener('click', (e) => {
            this.mouse.setFromPage(this.canvas, e.pageX, e.pageY);
            this.publish('canvas-click', this.mouse);
        });
    }

    add(clsName, elem, ...params) {
        return UiFactory.create(clsName, elem, ...params);
    }
}


export { Ui as default };
