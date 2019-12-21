import { Subscriber } from '../utilities/Subscriber.js';

import { Raycaster } from '../libs/three.module.js';
import { SkyMapController } from './controllers/SkyMapController.js';
import { AsterismController } from './controllers/AsterismController.js';


class Editor extends Subscriber {
    constructor(scene, camera, starsControls) {
        super();
        this.camera = camera;
        this.scene = scene;

        this.starsCtrl = starsControls;
        this.skyMapCtrl = new SkyMapController();
        this.asterismCtrl = new AsterismController();

        this.drawMode = false;

        this.raycaster = new Raycaster();
        this.raycaster.params.Points.threshold = 1.5;
        this.raycaster.linePrecision = 1.5;

        this.subscribe('switch-drawMode', (value) => this.drawMode = value);
        this.subscribe('mouse-click', this.onclick);
        this.subscribe('mouse-rightclick', this.onrightclick);
    }

    setMap(skyMap) {
        this.scene.add(skyMap);
        this.skyMapCtrl.set(skyMap);
    }

    onclick(mouse, shift) {
        this.raycaster.setFromCamera(mouse, this.camera.object);
        let star = this.starsCtrl.raycast(this.raycaster);
        if (star !== null) {
            this.publish('star-selected', star.data);
            this.starsCtrl.select(star.index);
            if (this.drawMode) {
                this.skyMapCtrl.addPoint(star.point, star.index, this.preDraw);
                this.preDraw = true;
            }
        } else {
            let indexes = this.skyMapCtrl.raycast(this.raycaster);
            if (indexes !== null) {
                this.starsCtrl.unselect();
                this.publish('star-unselected');
                this.skyMapCtrl.select(indexes, shift);

            }
        }
    }

    onrightclick() {
        this.starsCtrl.unselect();
        this.publish('star-unselected');
        if (this.preDraw) {
            this.preDraw = false;
        } else {
            this.skyMapCtrl.unselect();
        }
    }
}


export { Editor };
