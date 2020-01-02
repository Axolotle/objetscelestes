import { Vector3, BufferGeometry, BufferAttribute, LineBasicMaterial, Line } from '../libs/three.module.js';


export class Segment extends Line {
    constructor() {
        const material = new LineBasicMaterial({color: 0xff00ff, linewidth: 1.5, depthTest: false});
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(6), 3));

        super(geometry, material);

        this.matrixAutoUpdate = false;
        this.renderOrder = 1;
    }

    setPoint(point, index) {
        this.geometry.attributes.position.array.set(point, index * 3);
        this.geometry.attributes.position.needsUpdate = true;
    }
}
