class Observatoire {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.0000000001, 10000);
        this.controls = new CelestialControls(this.camera, this.renderer.domElement);

        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = 3;
        this.intersected = null;

        this.mouse = new THREE.Vector2();

        this.colors = {
            point: new THREE.Color("rgb(0, 255, 0)"),
            ray: new THREE.Color("rgb(255, 0, 0)"),
            pick: new THREE.Color("rgb(255, 0, 0)"),
        }

        this.constellations = new THREE.Group();
    }

    init (data) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    	document.body.firstElementChild.appendChild(this.renderer.domElement);

        this.camera.position.set(1, 1, 1);

        this.constellations.add(new Constellation(data, this.colors.point));

        this.scene.add(this.constellations)
        console.log(this.constellations);

        this.initListeners();
        this.animate();
    }

    animate () {
        requestAnimationFrame(this.animate.bind(this));
    	this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    // EVENT LISTERNERS

    initListeners () {
		window.addEventListener('keydown', this);
		this.renderer.domElement.addEventListener('mousemove', this);
	}

    handleEvent(event) {
        if (event.repeat) return;
	  	this[event.type](event);
    }

    keydown (event) {
        if (event.code !== 'KeyR') return;

		this.raycaster.setFromCamera(this.mouse, this.camera);
        this.drawRaycaster(this.raycaster.ray);

		let intersects = this.raycaster.intersectObjects(this.constellations.children);
        let colorAttr = this.constellations.children[0].geometry.attributes.color;
		if (intersects.length > 0) {
			if (this.intersected != intersects[ 0 ].index) {
				this.colors.point.toArray(colorAttr.array, this.intersected * 3)

				this.intersected = intersects[ 0 ].index;
				this.colors.pick.toArray(colorAttr.array, this.intersected * 3)
				colorAttr.needsUpdate = true;

                this.controls.target = intersects[0].point;
			}
		} else if (this.intersected !== null) {
			this.colors.point.toArray(colorAttr.array, this.intersected * 3)
			colorAttr.needsUpdate = true;
			this.intersected = null;
		}
    }

    mousemove (event) {
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    // HELPERS

    drawRaycaster (ray) {
        let material = new THREE.LineBasicMaterial({color: this.colors.ray});
        let geometry = new THREE.Geometry();
        geometry.vertices.push(
            ray.origin,
            ray.origin.clone().addScaledVector(this.raycaster.ray.direction, 10000),
        );
        let line = new THREE.Line(geometry, material);
        this.scene.add(line);
    }
}


// https://github.com/mrdoob/three.js/blob/master/src/objects/Points.js
class Constellation extends THREE.Points {
    constructor(stars, color) {
        stars = stars.filter(star => star.vmag < 4)
        let vertices = []
        let sizes = []
        let colors = new Float32Array(stars.length * 3);
    	for (let i = 0, l = stars.length; i < l; i++) {
			vertices.push(...stars[i].pos);
            color.toArray(colors, i * 3);
            sizes.push((5 - Math.floor(stars[i].vmag))/4)
    	}

        let geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.addAttribute('size', new THREE.BufferAttribute(new Float32Array(sizes), 1));

        let shaderMaterial = new THREE.ShaderMaterial( {
            vertexShader: `
            attribute vec3 color;
            attribute float size;
            varying vec3 vColor;

            void main () {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = 10.0 * size;
                gl_Position = projectionMatrix * mvPosition;
            }
            `,
            fragmentShader: `
            varying vec3 vColor;

            void main () {
                gl_FragColor = vec4(vColor, 1.0);
                vec2 coord = gl_PointCoord - vec2(0.5);
                if(length(coord) > 0.5)
                    discard;
            }
            `,
        });

    	super(geometry, shaderMaterial);

    	this.scale.set(2,2,2);
    }
}
