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

function loadModels() {
	var geometry = new THREE.BoxGeometry(1, 1, 1);
	var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
	var cube = new THREE.Mesh(geometry, material);
	scene.add(cube);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
