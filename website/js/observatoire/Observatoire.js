import {
    WebGLRenderer, Scene, PerspectiveCamera,
    Vector3,
    SphereGeometry, Mesh
} from '../libs/three.module.js';

import { Grid } from '../objects3d/Grid.js';
import { Stars } from '../objects3d/Stars.js';


export class Observatoire {
    constructor() {
        this.scene = new Scene();
        this.renderer = new WebGLRenderer({antialias: false, alpha: true, premultipliedAlpha: true, canvas: document.getElementById('canvas')});
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.000000001, 10000);
        
        this.grid = new Grid();
        this.grid.visible = false;
        this.scene.add(this.grid);
        
        this.stars = null;
    }

    init ({stars=null, grid=true, cameraDistance=10} = {}) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.camera.position.set(0, 0, -1);
        this.camera.position.setLength(cameraDistance);

        if (grid) this.grid.visible = true;
        if (stars) {
            this.stars = new Stars(stars);
            this.scene.add(this.stars);
            this.camera.lookAt(new Vector3(...stars[0].pos));
        }

        const centerGeo = new SphereGeometry(0.1, 10, 10);
        this.scene.add(new Mesh(centerGeo));

        this.animate();
    }

    animate () {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}
