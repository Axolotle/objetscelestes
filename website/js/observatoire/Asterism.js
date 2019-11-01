import * as THREE from '../libs/three.module.js';


export class Asterism extends THREE.Line {
    constructor (point) {
        const MAX = 50;

        const material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 1, depthTest: false});
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX * 3), 3));
        geometry.setDrawRange(0, 1);
        point.toArray(geometry.attributes.position.array, 0);
        super(geometry, material);
        this.drawCount = 1;
    }

    addPoint (point) {
        let positions = this.geometry.attributes.position.array;
        point.toArray(positions, this.drawCount * 3);;
        this.drawCount++;
        this.geometry.setDrawRange(0, this.drawCount);
        this.geometry.attributes.position.needsUpdate = true;
    }
}
