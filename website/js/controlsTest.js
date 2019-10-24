var camera, scene, renderer, controls

window.onload = () => {
	init()
	animate()
}

function init () {
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.0001, 1000);
	camera.position.set(0, 1, 1);


	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.firstElementChild.appendChild(renderer.domElement);
	loadModels();
    controls = new CelestialControls(camera, renderer.domElement, cube.position);
}

async function loadModels () {
	var geo2 = new THREE.BoxGeometry(1, 1, 1);
	var mat2 = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
	cube = new THREE.Mesh(geo2, mat2);
	cube.position.set(0, 0, 0);
	scene.add(cube);

	var geometry = new THREE.SphereGeometry( 0.01 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	var sphere = new THREE.Mesh( geometry, material );
	sphere.position.set(0, 0, 0);
	scene.add(sphere);
}

function animate () {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
