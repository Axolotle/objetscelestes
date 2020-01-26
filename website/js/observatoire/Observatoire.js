import {
    WebGLRenderer, Scene, PerspectiveCamera,
    SphereGeometry, Mesh, Group
} from '../../../web_modules/three.js';

import { CameraController } from './CameraController.js';
import { Grid } from '../objects3d/Grid.js';
import { StarsController } from '../editor/controllers/StarsController.js';


export class Observatoire {
    constructor(data, {position=[0, 0, -1], target=[0, 0, 0], distance=0} = {}, camera, starCard) {
        this.cameraCtrl = new CameraController(
            camera,
            target,
            {move: distance > 0 ? 'orbit' : 'rotate', zoom: distance > 0 ? 'dolly' : 'zoom'},
        );
        this.cameraCtrl.object.position.set(...position);
        this.cameraCtrl.object.position.setLength(distance);
        this.cameraCtrl.lookAt();

        this.scene = new Scene();

        this.starsCtrl = new StarsController(data, starCard);
        this.scene.add(this.starsCtrl.object);

        this.grid = new Grid();
        this.scene.add(this.grid);

        const centerGeo = new SphereGeometry(1, 10, 10);
        this.scene.add(new Mesh(centerGeo));
    }

    get stars() { return this.starsCtrl.object; }
}
