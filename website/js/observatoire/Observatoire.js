import * as THREE from '../libs/three.module.js';
import { CelestialControls } from './CelestialControls.js';
import { Grid } from './Grid.js';
import { Constellation } from './Constellation.js';
import { Asterism } from './Asterism.js';
import { Options } from './Options.js';

export class Observatoire {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: false, alpha: true, premultipliedAlpha: true, canvas: document.getElementById('canvas')});
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.000000001, 10000);
        this.controls = new CelestialControls(this.camera, this.renderer.domElement);
        this.options = new Options();

        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = 1.5;
        this.raycaster.linePrecision = 1.5;
        this.intersected = null;
        this.lineIntersected = null;

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

    init (data, distance) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.camera.position.set(0, 0, -1);
        this.camera.position.setLength(distance);

        this.scene.add(this.grid);
        this.scene.add(this.asterisms);

        this.constellations.add(new Constellation(data, this.colors.point));
        this.scene.add(this.constellations);

        const centerGeo = new THREE.SphereGeometry(0.1,10,10);
        this.scene.add(new THREE.Mesh(centerGeo))

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
        window.addEventListener('click', this);
        window.addEventListener('keydown', this);
        this.renderer.domElement.addEventListener('mousemove', this);
        this.renderer.domElement.addEventListener('contextmenu', this);
    }

    handleEvent(event) {
        if (event.repeat) return;
        this[event.type](event);
    }

    click (event) {
        if (event.button !== 0) return;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        // this.drawRaycaster(this.raycaster.ray);

        let intersects = this.raycaster.intersectObjects(this.constellations.children);
        let attrs = this.constellations.children[0].geometry.attributes;
        if (intersects.length > 0) {
            if (this.intersected != intersects[0].index) {
                this.colors.point.toArray(attrs.color.array, this.intersected * 3)

                this.intersected = intersects[0].index;
                this.colors.pick.toArray(attrs.color.array, this.intersected * 3)
                attrs.color.needsUpdate = true;

                let target = new THREE.Vector3(...attrs.position.array.slice(
                    this.intersected * 3,
                    this.intersected * 3 + 3
                ));
                if (this.options.targetMode) {
                    this.controls.target = target;
                }
                if (this.options.drawMode) {
                    if (this.asterism === null || !this.asterism.isSelected) {
                        this.asterism = new Asterism(target, this.renderer.domElement, this.camera);
                        this.asterisms.add(this.asterism);
                    } else {
                        this.asterism.addPoint(target)
                    }
                }

            }
        } else if (this.intersected !== null) {
            this.colors.point.toArray(attrs.color.array, this.intersected * 3);
            attrs.color.needsUpdate = true;
            this.intersected = null;
        } else {
            intersects = this.raycaster.intersectObjects(this.asterisms.children);
            if (intersects.length > 0) {
                this.lineIntersected = intersects[0].index;
                if (intersects[0].object === this.asterism) {
                    if (this.asterism.isSelected) {
                        if (this.asterism.preDraw) return;
                        this.asterism.select(this.lineIntersected, event.shiftKey);
                    } else {
                        this.asterism.select();
                    }
                } else {
                    if (this.asterism) this.asterism.unselect();
                    this.asterism = intersects[0].object;
                    this.asterism.select();
                }
            }
        }
    }

    mousemove (event) {
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        // predraw next line if drawing
        if (this.asterism && this.asterism.preDraw) {
            this.asterism.preDrawSegment(this.mouse, this.camera);
        }
    }
    
    contextmenu (event) {
        if (this.asterism && this.asterism.isSelected) {
            event.preventDefault();
            this.asterism.stopAction();
        }
    }
    
    keydown (event) {
        if (event.key !== 'Delete') return;
        if (this.asterism && this.asterism.isSelected) {
            if (this.asterism.preDraw) {
                this.asterism.stopAction();
                return;
            }
            let selectLen = this.asterism.selectedSegments.length;
            if (selectLen === 0 || selectLen * 2 === this.asterism.drawCount) {
                this.asterism.dispose();
                this.asterism = null;
            } else {
                this.asterism.removeSegments();
            }
        }
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
