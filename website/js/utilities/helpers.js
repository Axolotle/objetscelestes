import { BufferGeometry, BufferAttribute, LineBasicMaterial, Line } from '../../../web_modules/three.js';


export function drawVector(origin, vector) {
    const material = new LineBasicMaterial({color: 0xffffff, linewidth: 1, depthTest: false});
    const geometry = new BufferGeometry();
    const vertices = new Float32Array(6);
    origin.toArray(vertices, 0);
    vector.toArray(vertices, 3);

    geometry.setAttribute('position', new BufferAttribute(vertices, 3));

    return new Line(geometry, material);
}
