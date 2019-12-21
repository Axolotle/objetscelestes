import {
    WebGLRenderer, Scene, PerspectiveCamera,
    SphereGeometry, Mesh, Group
} from '../libs/three.module.js';

import { CameraController } from './CameraController.js';
import { Grid } from '../objects3d/Grid.js';
import { StarsController } from '../editor/controllers/StarsController.js';


export class Observatoire {
    constructor(data, {position=[0, 0, -1], target=[0, 0, 0], distance=0} = {}) {
        this.renderer = new WebGLRenderer({antialias: false, alpha: true, premultipliedAlpha: true, canvas: document.getElementById('canvas')});
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.cameraCtrl = new CameraController(
            new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.00001, 10000),
            target,
            {move: distance > 0 ? 'orbit' : 'rotate', zoom: distance > 0 ? 'dolly' : 'zoom'}
        );
        this.cameraCtrl.object.position.set(...position);
        this.cameraCtrl.object.position.setLength(distance);
        this.cameraCtrl.lookAt();

        this.scene = new Scene();

        this.starsCtrl = new StarsController(data);
        this.scene.add(this.starsCtrl.object);

        this.grid = new Grid();
        this.scene.add(this.grid);

        const centerGeo = new SphereGeometry(1, 10, 10);
        this.scene.add(new Mesh(centerGeo));
    }

    animate () {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.cameraCtrl.object);
    }
}
