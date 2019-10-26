class Observatoire {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.0001, 1000);
        this.controls = new CelestialControls(this.camera, this.renderer.domElement);

        this.constellations = [];
    }

    init (data) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    	document.body.firstElementChild.appendChild(this.renderer.domElement);

        this.camera.position.set(0, 0, 0);

        this.constellations.push(new Constellation(data), this.scene);

        this.scene.add(this.constellations[0].object)

        // temp lookAt constellations
        let v = new THREE.Vector3(...this.constellations[0].coords.slice(3,6))
        let mx = new THREE.Matrix4().lookAt(this.controls.target, v, this.camera.up);
        this.controls.rotationQt.setFromRotationMatrix(mx);
		this.camera.quaternion.setFromRotationMatrix(mx);
        this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);

        this.animate();
    }

    animate () {
        requestAnimationFrame(this.animate.bind(this));
    	this.controls.update();
    	this.renderer.render(this.scene, this.camera);
    }
}

class Constellation {
    constructor(stars) {
        this.coords = [];
    	for (var i = 0; i < stars.length; i++) {
    		if (stars[i].vmag < 4) {
    			this.coords.push(...stars[i].pos);
    		}
    	}

        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.coords), 3));
    	const material = new THREE.PointsMaterial({size: 5, sizeAttenuation: false, color: 0xf20000, alphaTest: 0.5});
    	this.object = new THREE.Points(geometry, material);
    	this.object.scale.set(0.1,0.1,0.1);
    }
}
