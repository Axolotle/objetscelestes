import { Vector2, Vector3, Quaternion, Matrix4, Euler } from '../libs/three.module.js';


const _VEC2ZERO = new Vector2();
const _VEC3ZERO = new Vector3();
const _QTZERO = new Quaternion();
let _nextPos = new Vector3();

export class CelestialControls {
    constructor (camera, domElem, targetPos) {
        this.camera = camera;
        this.domElem = domElem;
        this.target = targetPos !== undefined ? targetPos : new Vector3();

        this.screen = {
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight
        };

        this.speed = {
            roll: 0.01,
            pitch: 0.01,
            yaw: 0.01,
            orbit: 1,
            dolly: 0.1,
            zoom: 0.05
        };

        this.state = {
            ROLL: 0,
            YAW: 0,
            PITCH: 0
        };
        this.move = {
            prev: new Vector2(),
            curr: new Vector2(),
        };
        this.wheelMode = 'dolly';
        this.hasMoved = false;

        // direction vector of camera -> target not normalized
        this.eye = this.camera.position.clone().sub(this.target);
        // keep track of the rolling value since lookAt methods reset the camera's quaternion
        this.rollQt = new Quaternion();

        this.initListeners();
    }

    rotate () {
        // define movement quaternion (rotation) from mouse or keyboard
        let moveDir = new Quaternion(
            this.moveMode === 'mouse'
            ? (this.move.curr.y - this.move.prev.y)
            : this.state.PITCH * this.speed.pitch,
            this.moveMode === 'mouse'
                ? -(this.move.curr.x - this.move.prev.x)
                : -this.state.YAW * this.speed.yaw,
            this.state.ROLL * this.speed.roll,
            1
        ).normalize();

        this.camera.quaternion.multiply(moveDir);
        this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);
        this.hasMoved = false;
    }

    orbit() {
        // parts taken from js script 'TrackballControls.js'
        // https://github.com/mrdoob/three.js/blob/master/examples/js/controls/TrackballControls.js

        // Define the movement vector (orbit) from mouse or keyboard
        let moveDir = new Vector3(
            this.moveMode === 'mouse'
                ? this.move.curr.x - this.move.prev.x
                : this.state.YAW * this.speed.yaw,
            this.moveMode === 'mouse'
                ? this.move.curr.y - this.move.prev.y
                : this.state.PITCH * this.speed.pitch,
            0
        );
        // apply the actual rolling quaternion (rotation) to have a world awared movement vector
        moveDir.applyQuaternion(this.rollQt);
        let angle = moveDir.length();

        if (angle) {
            this.eye.copy(this.camera.position).sub(this.target);

            let eyeDir = this.eye.clone().normalize();
            let cameraUpDir = this.camera.up.clone().normalize();
            let cameraSideDir = new Vector3();
            let axis = new Vector3();
            let quaternion = new Quaternion();

            cameraSideDir.crossVectors(cameraUpDir, eyeDir).normalize();
            cameraUpDir.setLength(moveDir.y);
            cameraSideDir.setLength(moveDir.x);

            moveDir.copy(cameraUpDir.add(cameraSideDir));

            axis.crossVectors(moveDir, this.eye).normalize();

            angle *= this.speed.orbit;
            quaternion.setFromAxisAngle(axis, angle);

            this.eye.applyQuaternion(quaternion);
            this.camera.up.applyQuaternion(quaternion);

            this.camera.position.addVectors(this.target, this.eye);
            this.lookAt();
        }
        this.hasMoved = false;
    }

    lookAt (target) {
        let mx = new Matrix4().lookAt(this.camera.position, target || this.target, this.camera.up);
        this.camera.quaternion.setFromRotationMatrix(mx);
        // Reapply the rolling quaternion since the camera's quaternion has been reseted by the lookAt
        this.camera.quaternion.multiply(this.rollQt);
        // expose the rotation vector for convenience (taken from js 'flyControls.js')
        this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);
    }

    switchWheelMode (mode, selectedTarget) {
        if (mode === 'zoom') {
            this.prevDist = this.camera.position.clone().sub(this.target).length()
            this.camera.position.copy(this.target);
            // if there's a selected target that is different than the actual target
            if (selectedTarget && !this.target.equals(selectedTarget)) {
                this.lookAt(selectedTarget);
            }
        } else if (mode === 'dolly') {
            if (mode === this.wheelMode) return;
            let direction = this.camera.getWorldDirection(_VEC3ZERO).multiplyScalar(this.prevDist || 10).negate();
            this.camera.position.add(direction);
            // FIXME: the lookAt method resets the quaternion so there is a
            // rotation that would need to be reapplied
            this.lookAt();
            this.camera.zoom = 1;
        }
        this.wheelMode = mode;
        this.camera.updateProjectionMatrix();
    }

    dolly (delta) {
        _nextPos.copy(this.camera.position).addScaledVector(this.eye, delta * this.speed.dolly);
        if (_nextPos.length() > 0) {
            this.camera.position.copy(_nextPos);
            this.eye.subVectors(this.camera.position, this.target);
        } else {
            // Switch to zoom mode ?
        }
    }

    zoom (delta) {
        let nextValue = this.camera.zoom - delta * this.speed.zoom;
        if (nextValue >= 1) {
            this.camera.zoom = nextValue;
            this.camera.updateProjectionMatrix();
        } else {
            if (nextValue !== 1) {
                this.camera.zoom = 1;
                this.camera.updateProjectionMatrix();
            } else {
                // Switch to dolly mode ?
            }
        }
    }

    update () {
        if (this.state.ROLL !== 0) {
            let rollQt = new Quaternion(0, 0, this.state.ROLL * this.speed.roll, 1).normalize();
            this.rollQt.multiply(rollQt);
            if (!this.hasMoved) {
                this.camera.quaternion.multiply(rollQt);
            }
        }
        if (this.hasMoved) {
            if (this.wheelMode === 'dolly') this.orbit();
            else this.rotate();
        }
    }

    // UTILITIES

    getMouseOnScreen(pageX, pageY) {
        return new Vector2(
            (pageX - this.screen.left) / this.screen.width,
            (pageY - this.screen.top) / this.screen.height
        );
    };

    getMouseOnCircle(pageX, pageY) {
        return new Vector2(
            (pageX - this.screen.width * 0.5 - this.screen.left) / (this.screen.width * 0.5),
            (this.screen.height + 2 * (this.screen.top - pageY)) / this.screen.width // screen.width intentional
        );
    };

    // EVENT LISTERNERS

    initListeners () {
        window.addEventListener('keydown', this);
        window.addEventListener('keyup', this);

        this.domElem.addEventListener('mousedown', this);
        this.domElem.addEventListener('wheel', this);
    }

    handleEvent (event) {
        if (event.ctrlKey) return;
        this[event.type](event);
    }

    keydown (event) {
        if (['KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(event.code)) {
            this.moveMode = 'keyboard';
            this.hasMoved = true;
        }
        switch (event.code) {
            case 'KeyQ': this.state.ROLL = 1; break;
            case 'KeyE': this.state.ROLL = -1; break;

            case 'KeyA': this.state.YAW = -1; break;
            case 'KeyD': this.state.YAW = 1; break;

            case 'KeyW': this.state.PITCH = 1; break;
            case 'KeyS': this.state.PITCH = -1; break;
        }
    }

    keyup (event) {
        switch (event.code) {
            case 'KeyQ': this.state.ROLL = 0; break;
            case 'KeyE': this.state.ROLL = 0; break;

            case 'KeyA': this.state.YAW = 0; break;
            case 'KeyD': this.state.YAW = 0; break;

            case 'KeyW': this.state.PITCH = 0; break;
            case 'KeyS': this.state.PITCH = 0; break;
        }

    }

    mousedown (event) {
        switch (event.button) {
            case 0:
                this.move.prev.copy(this.getMouseOnCircle(event.pageX, event.pageY));
                this.move.curr.copy(this.move.prev);
                document.addEventListener('mousemove', this);
                document.addEventListener('mouseup', this);
                break;
        }
    }

    mousemove (event) {
        this.move.prev.copy(this.move.curr);
        this.move.curr.copy(this.getMouseOnCircle(event.pageX, event.pageY));
        this.moveMode = 'mouse';
        this.hasMoved = true;
    }

    mouseup (event) {
        document.removeEventListener('mousemove', this);
        document.removeEventListener('mouseup', this);
    }

    wheel (event) {
        this[this.wheelMode](Math.sign(event.deltaY));
    }
}
