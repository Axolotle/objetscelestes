import * as THREE from '../libs/three.module.js';
import { CelestialControls } from './CelestialControls.js';
import { Grid } from './Grid.js';
import { Stars } from './Constellation.js';
import { Asterism } from './Asterism.js';
import { Options } from './Options.js';

export class Observatoire {
    constructor(data) {
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

        this.asterisms = new THREE.Group();
        this.asterisms.renderOrder = 0;
        this.asterism = null;

        this.stars = null;

    }

    init (data, distance) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.camera.position.set(0, 0, -1);
        this.camera.position.setLength(distance);

        this.scene.add(this.grid);
        this.scene.add(this.asterisms);

        this.stars = new Stars(data);
        this.scene.add(this.stars);

        const centerGeo = new THREE.SphereGeometry(0.1, 10, 10);
        this.scene.add(new THREE.Mesh(centerGeo));

        this.options.init(this.stars)
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
        this.renderer.domElement.addEventListener('click', this);
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

        let drawMode = this.options.drawMode;
        let targetMode = this.options.targetMode;

        // Checks intersections with stars
        let intersects = this.raycaster.intersectObject(this.stars);
        if (intersects.length > 0) {
            // unselect if already selected and not drawing
            if (!drawMode && this.stars.selected === intersects[0].index) {
                this.stars.unselect();
                this.stars.hideInfos();
            } else {
                this.stars.unselect();
                this.stars.select(intersects[0].index);
                this.stars.displayInfos(drawMode);
            }


            let target = this.stars.getTarget(intersects[0].index);
            if (this.options.targetMode) {
                this.controls.target.copy(target);
            }
            if (this.options.drawMode) {
                if (this.asterism === null || !this.asterism.isSelected) {
                    this.asterism = new Asterism(target, this.renderer.domElement, this.camera);
                    this.asterisms.add(this.asterism);
                } else {
                    this.asterism.addPoint(target)
                }
            }
            return;

        } else if (!targetMode && (!drawMode || !this.asterism || !this.asterism.isSelected)) {
            // this.stars.unselect();
            // this.stars.hideInfos();
        }
        // Checks intersections with asterisms
        intersects = this.raycaster.intersectObjects(this.asterisms.children);
        if (intersects.length > 0) {
            if (this.asterism.preDraw) return;
            this.stars.unselect();
            if (this.asterism !== intersects[0].object) {
                this.asterism.unselect();
                this.asterism = intersects[0].object;
                this.asterism.select();
            } else if (this.asterism.isSelected) {
                this.asterism.select(intersects[0].index, event.shiftKey);
            } else if (!this.asterism.isSelected) {
                this.asterism.select();
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
            if (this.asterism.preDraw) {
                if (this.asterism.drawCount === 2) {
                    this.asterism.dispose();
                    this.asterism = null;
                    this.stars.unselect();
                } else {
                    this.asterism.stopAction();
                }
            } else {
                this.asterism.unselect();
                this.stars.unselect();
            }
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
