var camera, scene, renderer, controls;

window.onload = () => {
	init();
	loadModels();
	animate();
};

function init() {
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.0001, 1000);
	camera.position.set(1, 1, 1);

	renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.firstElementChild.appendChild(renderer.domElement);

    controls = new THREE.TrackballControls(camera, renderer.domElement);
}

async function loadModels() {
	const stars = await getJSON('data/UMa.json');
	
	const vertices = [];
	for (var i = 0; i < stars.length; i++) {
		if (stars[i].vmag < 4) {
			vertices.push(...stars[i].pos);
		}
	}
	
	const geometry = new THREE.BufferGeometry();
	geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
	const material = new THREE.PointsMaterial({size: 5, sizeAttenuation: false, color: 0xf20000, alphaTest: 0.5});
	const points = new THREE.Points(geometry, material);
	points.scale.set(0.1,0.1,0.1);
	
	scene.add(points);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}

function getJSON(uri) {
	return fetch(uri).then(response => response.json());
}
