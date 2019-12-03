import { Subscriber } from '../../../utilities/Subscriber.js';
import { Vector3 } from '../../../libs/three.module.js';


const _VECZERO = new Vector3();
const _keys = {
    move: ['KeyA', 'KeyD', 'KeyS', 'KeyW'],
    roll: ['KeyQ', 'KeyE']
}
let _onkeydown, _onkeyup;

export class Keyboard extends Subscriber {
    constructor() {
        super();
        this.vector = new Vector3();
        this.keepSending = false;
        _onkeydown = this.onkeydown.bind(this);
        _onkeyup = this.onkeyup.bind(this);
        // FIXME add event listerner to canvas
        window.addEventListener('keydown', _onkeydown, false);
        window.addEventListener('keyup', _onkeyup, false);
    }

    onkeydown(e) {
        if (_keys.roll.includes(e.code)) {
            this.vector.z = e.code === _keys.roll[0] ? -1 : 1;
        } else if (_keys.move.includes(e.code)) {
            switch (e.code) {
                case _keys.move[0]: this.vector.x = -1; break;
                case _keys.move[1]: this.vector.x =  1; break;
                case _keys.move[2]: this.vector.y = -1; break;
                case _keys.move[3]: this.vector.y =  1; break;
            }
        }
        if (!this.animating) {
            this.animating = true;
            this.animate();
        }
    }

    onkeyup(e) {
        switch (e.code) {
            // pitch
            case _keys.move[0]: this.vector.x === -1 ? this.vector.x = 0 : this.vector.x = 1; break;
            case _keys.move[1]: this.vector.x ===  1 ? this.vector.x = 0 : this.vector.x = -1; break;
            // yaw
            case _keys.move[2]: this.vector.y === -1 ? this.vector.y = 0 : this.vector.y = 1; break;
            case _keys.move[3]: this.vector.y ===  1 ? this.vector.y = 0 : this.vector.y = -1; break;
            // roll
            case _keys.roll[0]: this.vector.z === -1 ? this.vector.z = 0 : this.vector.z =  1; break;
            case _keys.roll[1]: this.vector.z ===  1 ? this.vector.z = 0 : this.vector.z = -1; break;
        }
    }

    animate() {
        if (this.vector.equals(_VECZERO)) {
            this.animating = false;
            return;
        } else {
            requestAnimationFrame(this.animate.bind(this));
        }

        if (this.vector.z !== 0) {
            this.publish('keyboard-roll', this.vector.z);
        }
        if (this.vector.x !== 0 || this.vector.y !== 0) {
            this.publish('keyboard-drag', this.vector);
        }
    }
}
