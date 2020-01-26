import { Vector2, WebGLRenderer, PerspectiveCamera } from '../../../../../web_modules/three.js';

import { LitElement, html, css } from '../../../../../web_modules/lit-element.js';


export class SpaceCanvas extends LitElement {
    static get styles() {
        return css`
            :host {
                display: block;
                contain: content;
                box-sizing: border-box;
                width: 100%;
                height: 100%;
            }
            canvas {
                width: 100%;
                height: 100%;
            }
        `;
    }

    render() {
        return html`
        <canvas
            @click="${this.onClick}" @contextmenu="${this.onContextmenu}"
            @mousedown="${this.onMousedown}"
            @wheel="${this.onWheel}"
        ></canvas>
        `;
    }

    constructor() {
        super();

        this.camera = null;
        this.renderer = null;
        this._mouse = {
            corner: new Vector2(),
            center: new Vector2()
        };
        this._firstDrag = false;
    }

    firstUpdated() {
        this.canvas = this.shadowRoot.querySelector('canvas');

        this.camera = new PerspectiveCamera(75, this.offsetWidth / this.offsetHeight, 0.00001, 10000);

        this.renderer = new WebGLRenderer({
            antialias: false,
            alpha: true,
            premultipliedAlpha: true,
            canvas: this.canvas
        });
        this.renderer.setSize(this.offsetWidth, this.offsetHeight);

        this._onMousemove = this.onMousemove.bind(this);
        this._onDrag = this.onDrag.bind(this);
        this._onMouseup = this.onMouseup.bind(this);
        this._captureClick = this.captureClick.bind(this);

        document.addEventListener('mousemove', this.onMousemove.bind(this), false);
    }

    _getMouseFromCorner(clientX, clientY) {
        return [
            (clientX / this.offsetWidth) * 2 - 1,
            -(clientY / this.offsetHeight) * 2 + 1
        ];
    }

    _getMouseFromCenter(pageX, pageY) {
        const w = this.offsetWidth;
        const h = this.offsetHeight;
        return [
            (pageX - w * 0.5) / (w * 0.5),
            (h + 2 * -pageY) / w
        ];
    }

    onClick(e) {
        this._mouse.corner.set(...this._getMouseFromCorner(e.clientX, e.clientY));
        this.dispatchEvent(new CustomEvent('leftclick', { detail: {
            mouse: this._mouse.corner,
            shift: e.shiftKey
        }}));
    }

    onContextmenu(e) {
        e.preventDefault();
        this._mouse.corner.set(...this._getMouseFromCorner(e.clientX, e.clientY));
        this.dispatchEvent(new CustomEvent('rightclick', { detail: {
            mouse: this._mouse.corner,
            shift: e.shiftKey
        }}));
    }

    onMousedown(e) {
        this._firstDrag = true;
        document.addEventListener('mousemove', this._onDrag, false);
        document.addEventListener('mouseup', this._onMouseup, false);
    }

    onDrag(e) {
        if (this._firstDrag) {
            window.addEventListener('click', this._captureClick, true);
        }

        this._mouse.center.set(...this._getMouseFromCenter(e.pageX, e.pageY));
        this.dispatchEvent(new CustomEvent('drag', { detail: {
            mouse: this._mouse.center,
            first: this._firstDrag
        }}));
        if (this._firstDrag) this._firstDrag = false;
    }

    onMouseup() {
        document.removeEventListener('mousemove', this._onDrag, false);
        document.removeEventListener('mouseup', this._onMouseup, false);
    }

    onMousemove(e) {
        this._mouse.corner.set(...this._getMouseFromCorner(e.clientX, e.clientY));
        this.dispatchEvent(new CustomEvent('move', { detail: {
            mouse: this._mouse.corner
        }}));
    }

    onWheel(e) {
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

customElements.define('space-canvas', SpaceCanvas);
