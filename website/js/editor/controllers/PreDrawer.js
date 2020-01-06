import { Vector3 } from '../../libs/three.module.js';

import { Subscriber } from '../../utilities/Subscriber.js';
import { Segment } from '../../objects3d/Segment.js';


let _mouse = new Vector3();
let _pt = new Vector3();

export class PreDrawer extends Subscriber {
    constructor(parent, camera) {
        super();

        this.active = false;
        this.camera = camera;
        this.object = new Segment();
        parent.add(this.object);
        this._update = this.update.bind(this);
    }

    setOrigin(point) {
        this.object.setPoint(point, 0);
        this.object.setPoint(point, 1);
    }

    activate(canvas) {
        this.active = true;
        this.object.visible = true;
        canvas.addEventListener('move', this._update, false);
    }

    deactivate(canvas) {
        this.active = false;
        this.object.visible = false;
        canvas.removeEventListener('move', this._update, false);
    }

    update(e) {
        const mouse = e.detail.mouse;
        // FIXME doesn't work if camera's position is (0,0,0), if a new segment
        // is added it shows up, but if we modify the actual segment, it doesn't.
        _mouse.set(mouse.x, mouse.y, 0.5);
        _mouse.unproject(this.camera);
        _mouse.sub(this.camera.position).normalize();
        _pt.copy(this.camera.position).add(_mouse.multiplyScalar(10));

        this.object.setPoint(_pt.toArray(), 1);
    }
}
