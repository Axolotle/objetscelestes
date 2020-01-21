import { Raycaster, Group } from '../../../web_modules/three.js';

import { Subscriber } from '../utilities/Subscriber.js';
import { SkyMapController, PreDrawer } from './controllers/index.js';


class Editor extends Subscriber {
    constructor(scene, cameraCtrl, starsControls, canvas) {
        super();
        this.scene = scene;
        this.canvas = canvas;
        this.cameraCtrl = cameraCtrl;

        this.starsCtrl = starsControls;
        this.skyMapCtrl = new SkyMapController();
        this.preDrawer = new PreDrawer(scene, cameraCtrl.object);

        this.skyMaps = new Group();
        this.scene.add(this.skyMaps);

        this.drawMode = false;

        this.raycaster = new Raycaster();
        this.raycaster.params.Points.threshold = 1.5;
        this.raycaster.linePrecision = 1.5;

    }

    addMap(skyMap) {
        this.skyMaps.add(skyMap);
    }

    setMap(name) {
        const skyMap = this.skyMaps.getObjectByName(name);
        this.skyMapCtrl.set(skyMap);
    }

    onclick({mouse, shift}) {
        this.raycaster.setFromCamera(mouse, this.cameraCtrl.object);
        let star = this.starsCtrl.raycast(this.raycaster);
        if (star !== null) {
            this.publish('star-selected', star.data);
            this.starsCtrl.select(star.index);
            if (this.drawMode) {
                this.skyMapCtrl.addPoint(star.point, star.index, this.preDrawer.active);
                this.preDrawer.setOrigin(star.point);
                if (!this.preDrawer.active) this.preDrawer.activate(this.canvas);
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
            this.preDrawer.deactivate(this.canvas);
        } else {
            this.skyMapCtrl.unselect();
        }
    }

    onmousemove() {

    }
}


export { Editor };
