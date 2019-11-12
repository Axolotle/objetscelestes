import * as THREE from '../libs/three.module.js';


const _color = new THREE.Color(0x00ff00).toArray();
const _selectColor = new THREE.Color(0xff0000).toArray();
const _target = new THREE.Vector3();
const _vertexShader = `
attribute vec3 color;
attribute float size;
varying vec3 vColor;

void main () {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 10.0 * size;
    gl_Position = projectionMatrix * mvPosition;
}
`;
const _fragmentShader = `
varying vec3 vColor;

void main () {
    gl_FragColor = vec4(vColor, 1.0);
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (length(coord) > 0.5)
        discard;
}
`;

// https://github.com/mrdoob/three.js/blob/master/src/objects/Points.js
export class Stars extends THREE.Points {
    constructor(stars) {
        stars = stars.filter(star => star.vmag < 4);

        let positions = new Float32Array(stars.length * 3);
        let colors = new Float32Array(stars.length * 3);
        let sizes = new Float32Array(stars.length * 3);
        for (let i = 0, l = stars.length; i < l; i++) {
            positions.set(stars[i].pos, i * 3);
            colors.set(_color, i * 3);
            sizes[i] = (5 - Math.floor(stars[i].vmag)) / 4;
        }

        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        let shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: _vertexShader,
            fragmentShader: _fragmentShader,
            depthTest: false
        });

        super(geometry, shaderMaterial);
        this.matrixAutoUpdate = false;
        this.name = 'Stars';
        this.renderOrder = 2;
        this.geometry.scale(10,10,10);

        // Custom properties
        this.selected = null;

    }

    getTarget(index) {
        return _target.fromBufferAttribute(this.geometry.attributes.position, index);
    }

    select (index) {
        let colors = this.geometry.attributes.color;
        colors.set(_selectColor, index * 3);
        this.selected = index;
        colors.needsUpdate = true;
    }

    unselect () {
        if (this.selected === null) return;
        let colors = this.geometry.attributes.color;
        colors.set(_color, this.selected * 3);
        this.selected = null;
        colors.needsUpdate = true;
    }
}
