import {
    Color, Vector3, BufferAttribute, VertexColors, // Helpers
    BufferGeometry, // Geometries
    ShaderMaterial, PointsMaterial, // Materials
    Points // 3D objects
} from '../libs/three.module.js';

import { pointShaders } from '../misc/shaders.js';
import { greekAbbr, constName, starType } from '../misc/starDictionnary.js';


const _color = new Color(0x00ff00).toArray();
const _selectColor = new Color(0xff0000).toArray();
const _target = new Vector3();


// https://github.com/mrdoob/js/blob/master/src/objects/Points.js
export class Stars extends Points {
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

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        geometry.setAttribute('color', new BufferAttribute(colors, 3));
        geometry.setAttribute('size', new BufferAttribute(sizes, 1));

        const shaderMaterial = new ShaderMaterial({
            vertexShader: pointShaders.vertex,
            fragmentShader: pointShaders.fragment,
            depthTest: false
        });
        // const shaderMaterial = new PointsMaterial({vertexColors: VertexColors, size: 10, sizeAttenuation: false, depthTest: false})

        super(geometry, shaderMaterial);

        this.matrixAutoUpdate = false;
        this.name = 'Stars';
        this.renderOrder = 2;
        this.geometry.scale(10,10,10);

        // Custom properties
        this.selected = [];
        this.data = stars;
    }

    get minMaxMag () {
        return [
            this.infos[0].vmag,
            this.infos[this.infos.length-1].vmag
        ]
    }

    getCoordinatesVector(index) {
        return _target.fromBufferAttribute(this.geometry.attributes.position, index);
    }

    getCoordinatesArray(index) {
        return this.geometry.attributes.position.array.slice(index * 3, index * 3 + 3);
    }

    setColor(color, index) {
        let colors = this.geometry.attributes.color;
        colors.array.set(color, index * 3);
        colors.needsUpdate = true;
    }

    updateDrawRange (min, max) {
        let minIdx = this.infos.findIndex(star => star.vmag >= min);
        let maxIdx = this.infos.findIndex(star => star.vmag >= max);
        this.geometry.setDrawRange(minIdx < 0 ? this.infos.length : minIdx , maxIdx < 0 ? this.infos.length : maxIdx)
    }

    setupLabels () {
        const container = document.getElementById('starsLabels');
        for (let i = 0, l = this.infos.length; i < l; i++) {
            const elem = document.createElement('div');
            // FIXME Rework naming
            let name = this.infos[i].name.replace('*', '').replace('UMa', '').trim();
            let greek = name.substring(0, 3);
            if (greek in greekAbbr) {
                name = name.replace(greek, greekAbbr[greek]);
            }
            elem.textContent = name;
            container.appendChild(elem);
            this.labels.push(elem);
        }
    }

    update (camera, renderElem) {
        let v = new Vector3();
        const drawRange = this.geometry.drawRange;
        const vertices = this.geometry.attributes.position.array;
        for (let i = 0, l = this.infos.length; i < l; i++) {
            v.set(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]);
            v.project(camera);
            if (Math.abs(v.z) > 1 || i < drawRange.start || i >= drawRange.start + drawRange.count) {
                this.labels[i].classList.add('hide');
            } else {
                const x = (v.x *  .5 + .5) * renderElem.clientWidth;
                const y = (v.y * -.5 + .5) * renderElem.clientHeight;
                this.labels[i].style.transform = `translate(${x+7}px,${y-15}px)`;
                this.labels[i].classList.remove('hide');
            }
        }
    }
}
