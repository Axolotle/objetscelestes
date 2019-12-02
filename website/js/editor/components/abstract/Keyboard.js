import { Subscriber } from '../../../utilities/Subscriber.js';
import { Vector3 } from '../../../libs/three.module.js';


const _VECZERO = new Vector3();
const _keys = {
    move: ['KeyA', 'KeyD', 'KeyW', 'KeyS'],
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
                case 'KeyA': this.vector.x = -1; break;
                case 'KeyD': this.vector.x =  1; break;

                case 'KeyW': this.vector.y =  1; break;
                case 'KeyS': this.vector.y = -1; break;
            }
        }
        if (!this.keepSending) {
            this.keepSending = true;
            this.animate();
        }
    }

    onkeyup(e) {
        if (_keys.move.includes(e.code)) {
            switch (e.code) {
                case 'KeyA': this.vector.x = 0; break;
                case 'KeyD': this.vector.x = 0; break;

                case 'KeyW': this.vector.y = 0; break;
                case 'KeyS': this.vector.y = 0; break;
            }
        } else if (_keys.roll.includes(e.code)) {
            this.vector.z = 0;
        }
        if (this.vector.equals(_VECZERO)) {
            this.keepSending = false;
        }
    }

    animate() {
        if (this.keepSending) {
            requestAnimationFrame(this.animate.bind(this));
        } else {
            return;
        }

        if (!this.vector.z !== 0) {
            this.publish('keyboard-roll', this.vector.z);
        }
        if (!this.vector.x !== 0 || this.vector.y !== 0) {
            this.publish('keyboard-drag', this.vector);
        }
    }
}
