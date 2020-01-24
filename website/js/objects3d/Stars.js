import {
    Color, Vector3, BufferAttribute, VertexColors, // Helpers
    BufferGeometry, // Geometries
    ShaderMaterial, PointsMaterial, // Materials
    Points // 3D objects
} from '../../../web_modules/three.js';

import { pointShaders } from '../misc/shaders.js';
import { greekAbbr } from '../misc/starDictionnary.js';


const _color = new Color(0x00ff00).toArray();
const _selectColor = new Color(0xff0000).toArray();
const _target = new Vector3();
const _pos = new Vector3();


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
        console.log(this.data[0]);

        this.geometry.setDrawRange(0, this.data.length);
        this.geometry.attributes.position.needsUpdate = true;
    }

    get minMaxMag () {
        return [
            this.data[0].vmag,
            this.data[this.data.length-1].vmag
        ]
    }

    getLabelsPosition(camera, canvas) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const drawRange = this.geometry.drawRange;
        const vertices = this.geometry.attributes.position;

        const elems = [];
        for (let i = drawRange.start, l = drawRange.start + drawRange.count; i < l; i++) {
            const elem = {};
            _pos.fromBufferAttribute(vertices, i);
            // this is needed if the sphere is moved
            // _pos.applyMatrix4(this.matrixWorld)
            _pos.project(camera);
            if (Math.abs(_pos.z) <= 1) {
                const x = ((_pos.x *  .5 + .5) * w) + 7;
                const y = ((_pos.y * -.5 + .5) * h) - 15;
                if (x < -20 || x > w + 20 || y < -20 || y > h + 20) {
                    continue;
                }
                elem.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
                // FIXME Rework naming
                let name = this.data[i].name.replace('*', '').replace('UMa', '').trim();
                const greek = name.substring(0, 3);
                if (greek in greekAbbr) {
                    name = name.replace(greek, greekAbbr[greek]);
                }
                elem.text = name;
                elems.push(elem);
            }
        }

        return elems;
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
}
