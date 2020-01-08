import { Subscriber } from '../../../utilities/Subscriber.js';
import { Vector2 } from '../../../../../web_modules/three.js';


let _onclick, _onrightclick, _ondrag, _onmousemove, _onmousedown, _onmouseup, _onwheel, _captureClick;

export class Mouse extends Subscriber {
    constructor(canvas) {
        super();
        this.vector2 = new Vector2();
        this.canvasVector = new Vector2();
        this.circleVector = new Vector2();
        this.elem = canvas;

        _onclick = this.onclick.bind(this);
        _onrightclick = this.onrightclick.bind(this);
        _ondrag = this.ondrag.bind(this);
        _onmousedown = this.onmousedown.bind(this);
        _onmouseup = this.onmouseup.bind(this);
        _onmousemove = this.onmousemove.bind(this);
        _onwheel = this.onwheel.bind(this);
        _captureClick = this.captureClick.bind(this);
        this.elem.addEventListener('click', _onclick, false);
        this.elem.addEventListener('contextmenu', _onrightclick, false);
        this.elem.addEventListener('mousedown', _onmousedown, false);
        this.elem.addEventListener('mousemove', _onmousemove, false);
        this.elem.addEventListener('wheel', _onwheel, false);
    }

    getMouseFromCenter(pageX, pageY) {
        return [
            (pageX - this.elem.width * 0.5) / (this.elem.width * 0.5),
            (this.elem.height + 2 * -pageY) / this.elem.width
        ];
    }

    getMouseFromCanvasSize(clientX, clientY) {
        return [
            (clientX / this.elem.width) * 2 - 1,
            -(clientY / this.elem.height) * 2 + 1
        ]
    }

    onclick(e) {
        this.canvasVector.set(...this.getMouseFromCanvasSize(e.clientX, e.clientY));
        this.publish('mouse-click', this.canvasVector, e.shiftKey);
    }

    onrightclick(e) {
        e.preventDefault();
        this.canvasVector.set(...this.getMouseFromCanvasSize(e.clientX, e.clientY));
        this.publish('mouse-rightclick', this.canvasVector);
    }

    ondrag(e) {
        window.addEventListener('click', _captureClick, true);
        this.circleVector.set(...this.getMouseFromCenter(e.pageX, e.pageY));
        this.publish('mouse-drag', this.circleVector, this.firstDrag);
        if (this.firstDrag) this.firstDrag = false;
    }

    onmousedown(e) {
        document.addEventListener('mousemove', _ondrag, false);
        document.addEventListener('mouseup', _onmouseup, false);
        this.circleVector.set(...this.getMouseFromCenter(e.pageX, e.pageY));
        this.firstDrag = true;
    }

    onmouseup() {
        document.removeEventListener('mousemove', _ondrag, false);
        document.removeEventListener('mouseup', _onmouseup, false);
    }

    onmousemove(e) {
        this.canvasVector.set(...this.getMouseFromCanvasSize(e.pageX, e.pageY));
        this.publish('mouse-move', this.canvasVector);
    }

    onwheel(e) {
        this.publish('mouse-wheel', Math.sign(e.deltaY))
    }

    captureClick(e) {
        // prevent the 'click' event to fire at 'mouseup' event when loosing drag.
        e.stopPropagation();
        window.removeEventListener('click', _captureClick, true);
    }

}
