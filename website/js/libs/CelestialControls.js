class CelestialControls {
	constructor (camera, domElem, targetPos) {
		this.camera = camera;
		this.domElem = domElem;
		this.target = targetPos !== undefined ? targetPos : new THREE.Vector3();

		this.speed = {
			roll: 0.01,
			dolly: 0.004,
			rot: 0.005,
		}

		this.state = {
			DOLLY: 0,
			ROLL: 0,
			YAW: 0,
			PITCH: 0
		};

		// direction vector : camera - target
		this.eye = this.camera.position.clone().sub(this.target);

		this.up = this.camera.up;
		this.rotationQt = new THREE.Quaternion();
		
		this.initListeners();
		this.updateRotation();
	}

	updateRotation () {
		let quaternion = new THREE.Quaternion();
		quaternion.set(
			this.state.PITCH * this.speed.rot,
			this.state.YAW * this.speed.rot,
			this.state.ROLL * this.speed.roll,
			1
		).normalize();
		this.rotationQt.multiply(quaternion);

		let mx = new THREE.Matrix4().lookAt(this.camera.position, this.target, this.up);
		this.camera.quaternion.setFromRotationMatrix(mx);
		this.camera.quaternion.multiply(this.rotationQt);

		// expose the rotation vector for convenience (taken from Three.js 'flyControls.js')
		this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);
	}

	updateMovement () {
		// Dolly
		this.camera.position.addScaledVector(this.eye, this.state.DOLLY * this.speed.dolly);

		// Zoom
		// this.camera.zoom -= 0.005;
		// this.camera.updateProjectionMatrix();
		
		this.eye.subVectors(this.camera.position, this.target);
	}
	
	// listeners
	initListeners () {
		window.addEventListener('keydown', this);
		window.addEventListener('keyup', this);
	}
	
	handleEvent (event) {
		if (event.repeat) return;
	  	this[event.type](event)
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

	update () {
		this.updateMovement();
		this.updateRotation();
	}
}
