class CelestialControls {
	constructor (camera, domElem, targetPos) {
		this.camera = camera;
		this.domElem = domElem;
		this.target = targetPos !== undefined ? targetPos : new THREE.Vector3();
		
		this.screen = {
			left: 0, 
			top: 0, 
			width: window.innerWidth, 
			height: window.innerHeight	
		};

		this.speed = {
			roll: 0.01,
			dolly: 0.004,
			rot: 0.005,
			rotPos: 1
		};

		this.state = {
			DOLLY: 0,
			ROLL: 0,
			YAW: 0,
			PITCH: 0
		};
		
		this.moving = false;
		this.move = {
			prev: new THREE.Vector2(),
			curr: new THREE.Vector2(),
		};

		// direction vector : camera - target
		this.eye = this.camera.position.clone().sub(this.target);

		this.up = this.camera.up;
		this.rotationQt = new THREE.Quaternion();
		this.angle = 0;
		
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
	
	rotatePosition() {
		// taken from three.js script 'TrackballControls.js'
		// https://github.com/mrdoob/three.js/blob/master/examples/js/controls/TrackballControls.js
		let moveDir = new THREE.Vector3(
			this.move.curr.x - this.move.prev.x, 
			this.move.curr.y - this.move.prev.y, 
			0 
		);
		let angle = moveDir.length();
		
		if (angle) {
			this.eye.copy(this.camera.position).sub(this.target);
			
			let eyeDir = this.eye.clone().normalize();
			let cameraUpDir = this.camera.up.clone().normalize();
			let cameraSideDir = new THREE.Vector3();
			let axis = new THREE.Vector3();
			let quaternion = new THREE.Quaternion();
			
			cameraSideDir.crossVectors(cameraUpDir, eyeDir).normalize();
			cameraUpDir.setLength(this.move.curr.y - this.move.prev.y);
			cameraSideDir.setLength(this.move.curr.x - this.move.prev.x);
			
			moveDir.copy(cameraUpDir.add(cameraSideDir));
			
			axis.crossVectors(moveDir, this.eye).normalize();
			
			angle *= this.speed.rotPos;
			quaternion.setFromAxisAngle(axis, angle);
			
			this.eye.applyQuaternion(quaternion);
			this.camera.up.applyQuaternion(quaternion);
			
			this.camera.position.addVectors(this.target, this.eye);
		}
	}

	updateMovement () {
		// Dolly
		if (this.state.DOLLY !== 0) {
			this.camera.position.addScaledVector(this.eye, this.state.DOLLY * this.speed.dolly);
		}
		
		// Zoom
		// this.camera.zoom -= 0.005;
		// this.camera.updateProjectionMatrix();
		
		this.eye.subVectors(this.camera.position, this.target);
	}
	
	// UTILITIES
	
	getMouseOnScreen(pageX, pageY) {
		return new THREE.Vector2(
			(pageX - this.screen.left) / this.screen.width,
			(pageY - this.screen.top) / this.screen.height
		);
	};
	
	getMouseOnCircle(pageX, pageY) {
		let v = new THREE.Vector2(
			(pageX - this.screen.width * 0.5 - this.screen.left) / (this.screen.width * 0.5),
			(this.screen.height + 2 * (this.screen.top - pageY)) / this.screen.width // screen.width intentional
		);
		return v.rotateAround(new THREE.Vector2(), this.angle);
	};
	
	// EVENT LISTERNERS
	
	initListeners () {
		window.addEventListener('keydown', this);
		window.addEventListener('keyup', this);
		
		this.domElem.addEventListener('mousedown', this);
	}
	
	handleEvent (event) {
		if (event.repeat) return;
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
				this.moving = true;
				break;				
		}
	}
	
	mousemove (event) {
		this.move.prev.copy(this.move.curr);
		this.move.curr.copy(this.getMouseOnCircle(event.pageX, event.pageY));
	}
	
	mouseup (event) {
		document.removeEventListener('mousemove', this);
		document.removeEventListener('mouseup', this);
		this.moving = false;
	}

	update () {
		if (this.state.ROLL !== 0) {
			let roll = new THREE.Quaternion(this.state.ROLL * this.speed.rot, 0, 0).normalize();
			this.angle += this.state.ROLL * (roll.angleTo(new THREE.Quaternion()) * 2);
		}
		if (this.moving) {
			this.rotatePosition();
		}
		this.updateMovement();
		this.updateRotation();
	}
}
