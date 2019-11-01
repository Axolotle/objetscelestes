import * as THREE from '../libs/three.module.js';


// https://github.com/mrdoob/three.js/blob/master/src/objects/Points.js
export class Constellation extends THREE.Points {
    constructor(stars, color) {
        stars = stars.filter(star => star.vmag < 4)
        let vertices = []
        let sizes = []
        let colors = new Float32Array(stars.length * 3);
    	for (let i = 0, l = stars.length; i < l; i++) {
			vertices.push(...stars[i].pos);
            color.toArray(colors, i * 3);
            sizes.push((5 - Math.floor(stars[i].vmag))/4)
    	}

        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        let shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: `
            attribute vec3 color;
            attribute float size;
            varying vec3 vColor;

            void main () {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = 10.0 * size;
                gl_Position = projectionMatrix * mvPosition;
            }
            `,
            fragmentShader: `
            varying vec3 vColor;

            void main () {
                gl_FragColor = vec4(vColor, 1.0);
                vec2 coord = gl_PointCoord - vec2(0.5);
                if (length(coord) > 0.5)
                    discard;
            }
            `,
        });

    	super(geometry, shaderMaterial);

    	this.scale.set(2,2,2);
    }
}
