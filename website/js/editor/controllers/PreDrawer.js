import { Vector3 } from '../../../../web_modules/three.js';

import { Segment } from '../../objects3d/Segment.js';


let _mouse = new Vector3();
let _pt = new Vector3();

export class PreDrawer {
    constructor() {
        this.active = false;
        this.object = new Segment();
    }

    setOrigin(point) {
        this.object.setPoint(point, 0);
        this.object.setPoint(point, 1);
    }

    activate() {
        this.active = true;
        this.object.visible = true;
    }

    deactivate() {
        this.active = false;
        this.object.visible = false;
    }

    update(mouse, camera) {
        // FIXME doesn't work if camera's position is (0,0,0), if a new segment
        // is added it shows up, but if we modify the actual segment, it doesn't.
        _mouse.set(mouse.x, mouse.y, 0.5);
        _mouse.unproject(camera);
        _mouse.sub(camera.position).normalize();
        _pt.copy(camera.position).add(_mouse.multiplyScalar(10));

        this.object.setPoint(_pt.toArray(), 1);
    }
}
