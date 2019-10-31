class Observatoire {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: document.getElementById('canvas')});
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0000000001, 10000);
        this.controls = new CelestialControls(this.camera, this.renderer.domElement);

        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = 0.5;
        this.intersected = null;

        this.labelsPos = [];
        this.latLine = {
            object: null,
            vertices: [],
            elems: []
        };

        this.mouse = new THREE.Vector2();

        this.colors = {
            point: new THREE.Color("rgb(0, 255, 0)"),
            ray: new THREE.Color("rgb(255, 0, 0)"),
            pick: new THREE.Color("rgb(255, 0, 0)"),
        }

        this.sphere = new THREE.Group();
        this.constellations = new THREE.Group();
    }

    init (data) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.camera.position.set(0, 0, -1);
        this.camera.position.setLength(100);

        this.drawCelestialSphere();
        this.constellations.add(new Constellation(data, this.colors.point));

        this.scene.add(this.constellations);

        this.initListeners();
        this.animate();
    }

    animate () {
        requestAnimationFrame(this.animate.bind(this));
    	this.controls.update();

        // this.latLine.object.updateMatrixWorld();
        for (let i = 0; i < this.latLine.vertices.length; i++) {
            let v = this.latLine.vertices[i].clone();
            v.applyMatrix4(this.latLine.object.matrixWorld)
            v.project(this.camera)
            if (Math.abs(v.z) > 1) {
                this.latLine.elems[i].classList.add('hide');
            } else {
                const x = (v.x *  .5 + .5) * this.renderer.domElement.clientWidth;
                const y = (v.y * -.5 + .5) * this.renderer.domElement.clientHeight;
                this.latLine.elems[i].style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
                this.latLine.elems[i].classList.remove('hide');
            }

        }

        this.renderer.render(this.scene, this.camera);
    }

    drawCelestialSphere () {
        // smoothness of the circle (number of straight lines)
        const smoothness = 1;
        const parallelsDiv = 24 * smoothness;
        const meridiansDiv = 18 * smoothness;
        const r = 500;
        const pi2 = Math.PI * 2;
        const material = new THREE.LineBasicMaterial({color: 0xffff00, linewidth: 1});
        let geometry = null;
        let circle = null;
        let vertices = [];

        const labelContainer = document.getElementById('labels');

        // define the series of vertices necessary to draw a semicircle
        for (let i = 0; i <= meridiansDiv; i++) {
        	let t = (i/meridiansDiv) * Math.PI;
        	let x = Math.sin(t) * r;
        	let z = Math.cos(t) * r;
        	vertices.push(x, 0, z);

            // creates dom elem for labels and its positions as vector3
            this.latLine.vertices.push(new THREE.Vector3(x, 0, z));
            const elem = document.createElement('div');
            elem.textContent = (90 - i * 10) + '°';
            labelContainer.appendChild(elem);
            this.latLine.elems.push(elem);
        }
        geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        circle = new THREE.Line(geometry, material);
        geometry = new THREE.BufferGeometry();
        // removes first and last vertices so the semicircle starts at the
        // first parallel and ends at the last.
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices.slice(3 * smoothness, -3 * smoothness), 3));
        let cutCircle = new THREE.Line(geometry, material);

        for (let i = 0; i < 24; i++) {
            if (i < 4) {
                // draw semicircles for each main axis (0h, 6h, 12h and 18h)
                let semicircle = circle.clone().rotateZ((i / 4) * pi2);
                // define the line that will receive the labels
                if (i === 0) this.latLine.object = semicircle;
                this.sphere.add(semicircle);
            }
            if (i % 6 !== 0) {
                this.sphere.add(cutCircle.clone().rotateZ((i / 24) * pi2));
            }
        }

        // define the series of vertices necessary to draw a parallel with
        // a radius and a z-position according to its latitude
        for (let n = 0; n <= 8; n++) {
            // latitude
            let z = r * Math.sin((n / 18) * Math.PI);
            // radius of the parallel at this latitude
            let r2 = Math.sqrt(r*r - z*z)

            let revertices = [];
            vertices = [];
            for (let i = 0; i <= parallelsDiv; i++) {
            	let t = (i / parallelsDiv) * pi2;
                let x = Math.cos(t) * r2;
            	let y = Math.sin(t) * r2;
                if (n === 0) {
                    vertices.push(x, y, 0)
                } else {
                    vertices.push(x, y, z);
                    revertices.push(x, y, -z);
                }
            }
            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            circle = new THREE.Line(geometry, material);
            this.sphere.add(circle);
            if (n !== 0) {
                geometry = new THREE.BufferGeometry();
                geometry.addAttribute('position', new THREE.Float32BufferAttribute(revertices, 3));
                circle = new THREE.Line(geometry, material);
                this.sphere.add(circle);
            }
        }
        this.scene.add(this.sphere);

        let pointsGeo = new THREE.SphereGeometry(5, 2, 2);
        let pointsMat = new THREE.MeshBasicMaterial({color: new THREE.Color("rgb(255, 0, 255)"), alphaTest: 1});
        for (let i = -1; i < 2; i++) {
            let point = new THREE.Mesh(pointsGeo, pointsMat);
            point.position.copy(new THREE.Vector3(0, 0, (i * -1) * 500))
            this.sphere.add(point)
        }
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
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

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
