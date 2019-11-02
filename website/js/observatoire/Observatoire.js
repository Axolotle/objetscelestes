import * as THREE from '../libs/three.module.js';
import { CelestialControls } from './CelestialControls.js';
import { Grid } from './Grid.js';
import { Constellation } from './Constellation.js';
import { Asterism } from './Asterism.js';


export class Observatoire {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: document.getElementById('canvas')});
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.00001, 10000);
        this.controls = new CelestialControls(this.camera, this.renderer.domElement);

        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = 0.5;
        this.intersected = null;

        this.mouse = new THREE.Vector2();

        this.colors = {
            point: new THREE.Color("rgb(0, 255, 0)"),
            ray: new THREE.Color("rgb(255, 0, 0)"),
            pick: new THREE.Color("rgb(255, 0, 0)"),
        }

        this.grid = new Grid();

        this.constellations = new THREE.Group();

        this.asterisms = new THREE.Group();
        this.asterism = null;
    }

    init (data) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.camera.position.set(0, 0, -1);
        this.camera.position.setLength(100);

        this.scene.add(this.grid);
        this.scene.add(this.asterisms);

        this.constellations.add(new Constellation(data, this.colors.point));
        this.scene.add(this.constellations);

        this.initListeners();
        this.animate();
    }

    animate () {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.grid.update(this.camera, this.renderer.domElement);
        this.renderer.render(this.scene, this.camera);
    }

    // EVENT LISTERNERS

    initListeners () {
        window.addEventListener('resize', this);
        window.addEventListener('keydown', this);
        this.renderer.domElement.addEventListener('mousemove', this);
    }

    handleEvent(event) {
        if (event.repeat) return;
        this[event.type](event);
    }

    keydown (event) {
        if (event.code !== 'KeyR' && event.code !== 'KeyF') return;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        // this.drawRaycaster(this.raycaster.ray);

        let intersects = this.raycaster.intersectObjects(this.constellations.children);
        let attrs = this.constellations.children[0].geometry.attributes
        if (intersects.length > 0) {
            if (this.intersected != intersects[ 0 ].index) {
                this.colors.point.toArray(attrs.color.array, this.intersected * 3)

                this.intersected = intersects[ 0 ].index;
                this.colors.pick.toArray(attrs.color.array, this.intersected * 3)
                attrs.color.needsUpdate = true;

                let target = new THREE.Vector3(...attrs.position.array.slice(
                    this.intersected * 3,
                    this.intersected * 3 + 3
                ));
                if (event.code === 'KeyR') {
                    this.controls.target = target;
                } else {
                    if (this.asterism === null) {
                        this.asterism = new Asterism(target, this.renderer.domElement, this.camera);
                        this.asterisms.add(this.asterism);
                    } else {
                        this.asterism.addPoint(target)
                    }
                }

            }
        } else if (this.intersected !== null) {
            this.colors.point.toArray(attrs.color.array, this.intersected * 3)
            attrs.color.needsUpdate = true;
            this.intersected = null;
        }
    }

    mousemove (event) {
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
    
    resize () {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
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
