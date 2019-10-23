class CelestialControls {
	constructor (camera, domElem, targetPos) {
		this.camera = camera;
		this.domElem = domElem;
		this.target = targetPos !== undefined ? targetPos : new THREE.Vector3();

		this.rollSpeed = 0.005;
		this.zoomSpeed = 0.004;

		this.state = {
			DOLLY: 1,
			ROLL: -1,
			YAW: 0,
			PITCH: 0
		};

		// vector position : camera - target
		this.eye = this.camera.position.clone().sub(this.target);

		this.up = this.camera.up;
		this.rotationQt = new THREE.Quaternion();
	}

	updateRotation () {
		let quaternion = new THREE.Quaternion();
		quaternion.set(
			this.state.PITCH * this.rollSpeed,
			this.state.YAW * this.rollSpeed,
			this.state.ROLL * this.rollSpeed,
			1
		).normalize();
		this.rotationQt.multiply(quaternion);

		let mx = new THREE.Matrix4().lookAt(this.camera.position, this.target, this.up);
		this.camera.quaternion.setFromRotationMatrix(mx);
		this.camera.quaternion.multiply(this.rotationQt);

		// expose the rotation vector for convenience (from 'flyControls.js')
		this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);
	}

	updateMovement () {
		this.eye = this.camera.position.clone().sub(this.target);

		// Dolly
		this.camera.position.addScaledVector(this.eye, this.state.DOLLY * this.zoomSpeed);

		// Zoom
		// this.camera.zoom -= 0.005;
		// this.camera.updateProjectionMatrix();
	}

	update () {
		this.updateMovement();
		this.updateRotation();
	}
}
