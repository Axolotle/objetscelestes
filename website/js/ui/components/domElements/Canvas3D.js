import { Vector2 } from '../../../../../web_modules/three.js';


export class Canvas3D extends HTMLCanvasElement {
    connectedCallback() {
        this._mouse = {
            corner: new Vector2(),
            center: new Vector2()
        }
        this._firstDrag = false;

        this._onmousemove = this.onmousemove.bind(this);
        this._ondrag = this.ondrag.bind(this);
        this._onmouseup = this.onmouseup.bind(this);
        this._captureClick = this.captureClick.bind(this);

        this.addEventListener('click', this.onclick, false);
        this.addEventListener('contextmenu', this.oncontextmenu, false);
        this.addEventListener('mousedown', this.onmousedown, false);
        document.addEventListener('mousemove', this._onmousemove, false);
        this.addEventListener('wheel', this.onwheel, false);
    }

    _getMouseFromCorner(clientX, clientY) {
        return [
            (clientX / this.width) * 2 - 1,
            -(clientY / this.height) * 2 + 1
        ];
    }

    _getMouseFromCenter(pageX, pageY) {
        return [
            (pageX - this.width * 0.5) / (this.width * 0.5),
            (this.height + 2 * -pageY) / this.width
        ];
    }

    onclick(e) {
        this._mouse.corner.set(...this._getMouseFromCorner(e.clientX, e.clientY));
        this.dispatchEvent(new CustomEvent('leftclick', { detail: {
            mouse: this._mouse.corner,
            shift: e.shiftKey
        }}));
    }

    oncontextmenu(e) {
        e.preventDefault();

        this._mouse.corner.set(...this._getMouseFromCorner(e.clientX, e.clientY));

        this.dispatchEvent(new CustomEvent('rightclick', { detail: {
            mouse: this._mouse.corner,
            shift: e.shiftKey
        }}));
    }

    onmousedown(e) {
        this._firstDrag = true;
        document.addEventListener('mousemove', this._ondrag, false);
        document.addEventListener('mouseup', this._onmouseup, false);
    }

    ondrag(e) {
        window.addEventListener('click', this._captureClick, true);

        this._mouse.center.set(...this._getMouseFromCenter(e.pageX, e.pageY));

        this.dispatchEvent(new CustomEvent('drag', { detail: {
            mouse: this._mouse.center,
            first: this._firstDrag
        }}));
        if (this._firstDrag) this._firstDrag = false;
    }

    onmouseup() {
        document.removeEventListener('mousemove', this._ondrag, false);
        document.removeEventListener('mouseup', this._onmouseup, false);
    }

    onmousemove(e) {
        this._mouse.corner.set(...this._getMouseFromCorner(e.clientX, e.clientY));
        this.dispatchEvent(new CustomEvent('move', { detail: {
            mouse: this._mouse.corner
        }}));
    }

    onwheel(e) {
        this.dispatchEvent(new CustomEvent('zoom', { detail: {
            delta: Math.sign(e.deltaY)
        }}));
    }

    captureClick(e) {
        // prevent the 'click' event to fire at 'mouseup' event when loosing drag.
        e.stopPropagation();
        window.removeEventListener('click', this._captureClick, true);
    }
}


customElements.define('canvas-3d', Canvas3D, {extends: 'canvas'});
