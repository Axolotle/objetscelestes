import { Vector2, Vector3, Quaternion, Matrix4, Euler } from '../../../web_modules/three.js';


// private variables
const _VECZERO = new Vector3();
// lookAt privates
const _mx = new Matrix4();
const _euler = new Euler();
// rotate and roll private
const _moveQt = new Quaternion();
// orbit privates
const _moveDir = new Vector3();
const _eyeDir = new Vector3();
const _cameraUpDir = new Vector3();
const _cameraSideDir = new Vector3();
const _axis = new Vector3();
const _qt = new Quaternion();
// dolly privates
const _nextPos = new Vector3();

// global privates
// keep track of the rolling value since lookAt methods reset the camera's quaternion
const _rollQt =  new Quaternion();
const _eye = new Vector3();
const _prevPos = new Vector3();
const _move = {
    prev: new Vector2(),
    curr: new Vector2(),
}


export class CameraController {
    constructor(camera, target, modes) {
        this.object = camera;
        this.target = new Vector3(...target);

        this.moveMode = modes.move || 'rotate';
        this.zoomMode = modes.zoom || 'zoom';

        this.speed = {
            roll: 0.01,
            move: 0.01,
            orbit: 1,
            dolly: 0.1,
            zoom: 0.05
        };

        this.prevDist = _prevPos.copy(this.object.position).sub(this.target).length();
    }

    lookAt(target, rollAngle) {
        _mx.lookAt(this.object.position, target || this.target, this.object.up);
        this.object.quaternion.setFromRotationMatrix(_mx);
        if (rollAngle !== undefined) {
            // expose the rotation vector
            this.object.rotation.setFromQuaternion(this.object.quaternion, this.object.rotation.order);
            // reset the rolling quaternion from previous rolling angle difference
            _rollQt.setFromEuler(_euler.set(0, 0, rollAngle - this.object.rotation.z, this.object.rotation.order));
        }
        // Reapply the rolling quaternion since the camera's quaternion has been reseted by the lookAt
        this.object.quaternion.multiply(_rollQt);
        // expose again the rotation vector for convenience (taken from js 'flyControls.js')
        this.object.rotation.setFromQuaternion(this.object.quaternion, this.object.rotation.order);
    }

    rotate(move) {
        // define movement quaternion (rotation)
        _moveQt.set(move.y, -move.x, 0, 1).normalize();

        this.object.quaternion.multiply(_moveQt);
        this.object.rotation.setFromQuaternion(this.object.quaternion, this.object.rotation.order);
    }

    orbit(move) {
        // parts taken from js script 'TrackballControls.js'
        // https://github.com/mrdoob/three.js/blob/master/examples/js/controls/TrackballControls.js

        // Define the movement vector (orbit) from mouse or keyboard
        _moveDir.set(move.x, move.y, 0);
        // apply the actual rolling quaternion (rotation) to have a world awared movement vector
        _moveDir.applyQuaternion(_rollQt);
        let angle = _moveDir.length();

        if (angle) {
            _eye.subVectors(this.object.position, this.target);
            _eyeDir.copy(_eye).normalize();
            _cameraUpDir.copy(this.object.up).normalize();
            _cameraSideDir.crossVectors(_cameraUpDir, _eyeDir).normalize();

            _cameraUpDir.setLength(_moveDir.y);
            _cameraSideDir.setLength(_moveDir.x);

            _moveDir.copy(_cameraUpDir.add(_cameraSideDir));

            _axis.crossVectors(_moveDir, _eye).normalize();

            angle *= this.speed.orbit;
            _qt.setFromAxisAngle(_axis, angle);

            _eye.applyQuaternion(_qt);
            this.object.up.applyQuaternion(_qt);

            this.object.position.addVectors(this.target, _eye);
            this.lookAt(this.target);
        }
    }

    roll(value) {
        _moveQt.set(0, 0, value * this.speed.roll, 1).normalize();
        _rollQt.multiply(_moveQt);
        this.object.quaternion.multiply(_moveQt);
        this.object.rotation.setFromQuaternion(this.object.quaternion, this.object.rotation.order);
    }

    dolly(delta) {
        _nextPos.copy(this.object.position).addScaledVector(_eye, delta * this.speed.dolly);
        if (_nextPos.length() > 0) {
            this.object.position.copy(_nextPos);
            _eye.subVectors(this.object.position, this.target);
        } else {
            // Switch to zoom mode ?
        }
    }

    zoom(delta) {
        let nextValue = this.object.zoom - delta * this.speed.zoom;
        if (nextValue >= 1) {
            this.object.zoom = nextValue;
            this.object.updateProjectionMatrix();
        } else {
            if (nextValue !== 1) {
                this.object.zoom = 1;
                this.object.updateProjectionMatrix();
            } else {
                // Switch to dolly mode ?
            }
        }
    }

    switchMode(dolly, applyOffset = true) {
        this.object.zoom = 1;
        if (dolly) {
            if (applyOffset) {
                let direction = this.object.getWorldDirection(_VECZERO).multiplyScalar(this.prevDist || 10).negate();
                this.object.position.add(direction);
            }
            this.lookAt(this.target, this.object.rotation.z);
        } else {
            this.prevDist = _prevPos.copy(this.object.position).sub(this.target).length();
            this.object.position.copy(this.target);
        }
        this.moveMode = dolly ? 'orbit' : 'rotate';
        this.zoomMode = dolly ? 'dolly' : 'zoom';
        this.object.updateProjectionMatrix();
    }

    changeTarget(newTarget) {
        if (newTarget === undefined) newTarget = _VECZERO;
        if (this.target.equals(newTarget)) return false;

        this.target.copy(newTarget);

        if (this.zoomMode === 'zoom') {
            this.switchMode(true, false);
            return true;
        } else {
            this.lookAt(this.target, this.object.rotation.z);
            return false;
        }
    }

    onDrag({vector, type, first}) {
        const move = {};
        if (type === 'mouse') {
            _move.prev.copy(!first ? _move.curr : vector);
            _move.curr.copy(vector);
            move.x = _move.curr.x - _move.prev.x;
            move.y = _move.curr.y - _move.prev.y;
        } else {
            const orbit = this
            move.x = vector.x * this.speed.move;
            move.y = vector.y * this.speed.move;
            if (this.moveMode === 'orbit') {
                move.x *= -1;
                move.y *= -1;
            }
        }
        this[this.moveMode](move);
    }

    onWheel({delta}) {
        this[this.zoomMode](delta);
    }
}
