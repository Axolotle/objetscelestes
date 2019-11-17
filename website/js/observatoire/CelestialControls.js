import { Vector2, Vector3, Quaternion, Matrix4 } from '../libs/three.module.js';


const _VECZERO = new Vector3();
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
            pitch: 0.005,
            yaw: 0.005,
            orbit: 1,
            dolly: 0.1,
            zoom: 0.05
        };

        this.state = {
            ROLL: 0,
            YAW: 0,
            PITCH: 0
        };

        this.dollyLimit = 0.05;
        this.wheelMode = 'dolly';

        this.moving = false;
        this.move = {
            prev: new Vector2(),
            curr: new Vector2(),
        };

        // direction vector of camera -> target not normalized
        this.eye = this.camera.position.clone().sub(this.target);
        this.up = this.camera.up;
        this.rotationQt = new Quaternion();
        this.rollValue = 0;

        this.initListeners();
        this.updateRotation();
    }

    updateRotation () {
        let quaternion = new Quaternion();
        quaternion.set(
            this.state.PITCH * this.speed.pitch,
            this.state.YAW * this.speed.yaw,
            this.state.ROLL * this.speed.roll,
            1
        ).normalize();
        this.rotationQt.multiply(quaternion);

        // let mx = new Matrix4().lookAt(this.camera.position, this.target, this.up);
        // this.camera.quaternion.setFromRotationMatrix(mx);
        // this.camera.quaternion.multiply(this.rotationQt);

        // expose the rotation vector for convenience (taken from js 'flyControls.js')
        // this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);
    }

    rotatePosition() {
        // taken from js script 'TrackballControls.js'
        // https://github.com/mrdoob/three.js/blob/master/examples/js/controls/TrackballControls.js
        let moveDir = new Vector3(
            this.move.curr.x - this.move.prev.x,
            this.move.curr.y - this.move.prev.y,
            0
        );
        let angle = moveDir.length();

        if (angle) {
            this.eye.copy(this.camera.position).sub(this.target);

            let eyeDir = this.eye.clone().normalize();
            let cameraUpDir = this.camera.up.clone().normalize();
            let cameraSideDir = new Vector3();
            let axis = new Vector3();
            let quaternion = new Quaternion();

            cameraSideDir.crossVectors(cameraUpDir, eyeDir).normalize();
            cameraUpDir.setLength(this.move.curr.y - this.move.prev.y);
            cameraSideDir.setLength(this.move.curr.x - this.move.prev.x);

            moveDir.copy(cameraUpDir.add(cameraSideDir));

            axis.crossVectors(moveDir, this.eye).normalize();

            angle *= this.speed.orbit;
            quaternion.setFromAxisAngle(axis, angle);

            this.eye.applyQuaternion(quaternion);
            this.camera.up.applyQuaternion(quaternion);

            this.camera.position.addVectors(this.target, this.eye);
            this.lookAt();
            this.hasMoved = false;
        }
    }

    lookAt (target) {
        let mx = new Matrix4().lookAt(this.camera.position, target || this.target, this.up);
        this.camera.quaternion.setFromRotationMatrix(mx);
        // expose the rotation vector for convenience (taken from js 'flyControls.js')
        this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);
    }

    switchWheelMode (mode, selectedTarget) {
        if (mode === 'zoom') {
            this.camera.position.copy(this.target);
            // if there's a selected target that is different than the actual target
            if (selectedTarget && !this.target.equals(selectedTarget)) {
                this.lookAt(selectedTarget);
            }
            this.camera.zoom = 1;
        } else if (mode === 'dolly') {
            let direction = this.camera.getWorldDirection(_VECZERO).multiplyScalar(this.eye.length());
            this.camera.position.subVectors(this.target, direction);
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
            let roll = new Quaternion(this.state.ROLL * this.speed.roll, 0, 0).normalize();
            this.rollValue += this.state.ROLL * (roll.angleTo(new Quaternion()));
        }
        if (this.hasMoved) {
            if (this.wheelMode === 'dolly') this.rotatePosition();
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
        let v = new Vector2(
            (pageX - this.screen.width * 0.5 - this.screen.left) / (this.screen.width * 0.5),
            (this.screen.height + 2 * (this.screen.top - pageY)) / this.screen.width // screen.width intentional
        );
        return v.rotateAround(new Vector2(), this.rollValue);
    };

    // EVENT LISTERNERS

    initListeners () {
        window.addEventListener('keydown', this);
        window.addEventListener('keyup', this);

        this.domElem.addEventListener('mousedown', this);
        this.domElem.addEventListener('wheel', this);
    }

    handleEvent (event) {
        if (event.repeat || event.ctrlKey) return;
        this[event.type](event);
    }

    keydown (event) {
        switch (event.code) {
            case 'KeyQ': this.state.ROLL -= 1; break;
            case 'KeyE': this.state.ROLL += 1; break;

            case 'KeyA': this.state.YAW += 1; break;
            case 'KeyD': this.state.YAW -= 1; break;

            case 'KeyW': this.state.PITCH += 1; break;
            case 'KeyS': this.state.PITCH -= 1; break;
        }
    }

    keyup (event) {
        switch (event.code) {
            case 'KeyQ': this.state.ROLL += 1; break;
            case 'KeyE': this.state.ROLL -= 1; break;

            case 'KeyA': this.state.YAW -= 1; break;
            case 'KeyD': this.state.YAW += 1; break;

            case 'KeyW': this.state.PITCH -= 1; break;
            case 'KeyS': this.state.PITCH += 1; break;
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
