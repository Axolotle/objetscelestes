import { Subscriber } from '../../../utilities/Subscriber.js';
import { Vector2 } from '../../../libs/three.module.js';


let _onclick, _ondrag, _onmousedown, _onmouseup, _onwheel, _captureClick;

export class Mouse extends Subscriber {
    constructor(canvas) {
        super();
        this.vector2 = new Vector2();
        this.elem = canvas;

        _onclick = this.onclick.bind(this);
        _ondrag = this.ondrag.bind(this);
        _onmousedown = this.onmousedown.bind(this);
        _onmouseup = this.onmouseup.bind(this);
        _onwheel = this.onwheel.bind(this);
        _captureClick = this.captureClick.bind(this);
        this.elem.addEventListener('click', _onclick, false);
        this.elem.addEventListener('mousedown', _onmousedown, false);
        this.elem.addEventListener('wheel', _onwheel, false);
    }

    getMouseFromCenter(pageX, pageY) {
        return [
            (pageX - this.elem.width * 0.5) / (this.elem.width * 0.5),
            (this.elem.height + 2 * -pageY) / this.elem.width
        ];
    }

    onclick(e) {
        this.vector2.set(...this.getMouseFromCenter(e.pageX, e.pageY));
        this.publish('mouse-click', this.vector2);
    }

    ondrag(e) {
        window.addEventListener('click', _captureClick, true);
        this.vector2.set(...this.getMouseFromCenter(e.pageX, e.pageY));
        this.publish('mouse-drag', this.vector2);
    }

    onmousedown(e) {
        document.addEventListener('mousemove', _ondrag, false);
        document.addEventListener('mouseup', _onmouseup, false);
        this.vector2.set(...this.getMouseFromCenter(e.pageX, e.pageY))
        this.publish('mouse-drag', this.vector2, true);
    }

    onmouseup() {
        document.removeEventListener('mousemove', _ondrag, false);
        document.removeEventListener('mouseup', _onmouseup, false);
    }

    onwheel(e) {
        this.publish('mouse-wheel', Math.sign(e.deltaY))
    }

    captureClick(e) {
        // prevent the 'click' event to fire at 'mouseup' event when loosing drag.
        e.stopPropagation();
        window.removeEventListener('click', this.captureClick, true);
    }

}
