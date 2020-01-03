import { Raycaster } from '../libs/three.module.js';

import { Subscriber } from '../utilities/Subscriber.js';
import { SkyMapController, PreDrawer } from './controllers/index.js';


class Editor extends Subscriber {
    constructor(scene, cameraCtrl, starsControls) {
        super();
        this.scene = scene;
        this.cameraCtrl = cameraCtrl;

        this.starsCtrl = starsControls;
        this.skyMapCtrl = new SkyMapController();
        this.preDrawer = new PreDrawer(scene, cameraCtrl.object);

        this.drawMode = false;

        this.raycaster = new Raycaster();
        this.raycaster.params.Points.threshold = 1.5;
        this.raycaster.linePrecision = 1.5;

        this.subscribe('switch-drawMode', (value) => this.drawMode = value);
        this.subscribe('switch-dollyMode', (dolly) =>  this.cameraCtrl.switchMode(dolly));
        this.subscribe('mouse-click', this.onclick);
        this.subscribe('mouse-rightclick', this.onrightclick);
    }

    setMap(skyMap) {
        this.scene.add(skyMap);
        this.skyMapCtrl.set(skyMap);
    }

    onclick(mouse, shift) {
        this.raycaster.setFromCamera(mouse, this.cameraCtrl.object);
        let star = this.starsCtrl.raycast(this.raycaster);
        if (star !== null) {
            this.publish('star-selected', star.data);
            this.starsCtrl.select(star.index);
            if (this.drawMode) {
                this.skyMapCtrl.addPoint(star.point, star.index, this.preDrawer.active);
                this.preDrawer.setOrigin(star.point);
                if (!this.preDrawer.active) this.preDrawer.activate();
            }
        } else if (this.drawMode && !this.preDrawer.active){
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
        if (this.preDrawer.active) {
            this.preDrawer.deactivate();
        } else {
            this.skyMapCtrl.unselect();
        }
    }

    onmousemove() {

    }
}


export { Editor };
