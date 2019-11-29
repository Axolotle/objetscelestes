import Subscriber from '../utilities/Subscriber.js';
import Mouse from './components/Mouse.js';
import { UiFactory } from './UiFactory.js';


class Ui extends Subscriber {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.mouse = new Mouse();
        this.init();
    }

    init() {
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.setFromPage(this.canvas, e.pageX, e.pageY)
        });

        // prevent the 'click' event to fire at 'mouseup' event when loosing drag.
        let captureClick = (e) => {
            e.stopPropagation();
            window.removeEventListener('click', captureClick, true);
        }
        let click = () => {
            this.publish('mouse-click', this.mouse);
        }
        let drag = () => {
            window.addEventListener('click', captureClick, true);
            this.publish('mouse-drag', this.mouse);
        }

        this.canvas.addEventListener('mousedown', (e) => {
            this.canvas.addEventListener('mousemove', drag, false);
            this.canvas.addEventListener('mouseup', (e) => {
                this.canvas.removeEventListener('mousemove', drag, false);
            }, false);
        }, false);
        this.canvas.addEventListener('click', click, false);

    }

    add(clsName, elem, ...params) {
        return UiFactory.create(clsName, elem, ...params);
    }
}


export { Ui as default };
