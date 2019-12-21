import {
    Vector3, VertexColors, BufferAttribute, // Helpers
    BufferGeometry, // Geometries
    LineBasicMaterial , // Materials
    LineSegments, // 3D objects
} from '../libs/three.module.js';

import { asterismColors as colors } from '../misc/colors.js';


const _MAX = 50;


export class Asterism extends LineSegments {
    constructor(name) {
        const positions = new Float32Array(_MAX * 3);
        const colors = new Float32Array(_MAX * 3);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        geometry.setAttribute('color', new BufferAttribute(colors, 3));

        const material = new LineBasicMaterial({vertexColors: VertexColors, linewidth: 1.5, depthTest: false});

        super(geometry, material);

        this.matrixAutoUpdate = false;
        this.renderOrder = 1;

        this.name = name || 'Sans Titre';
        this.path = [];
    }

    get count() {
        return this.path.length;
    }

    setDrawRange(start, count) {
        this.geometry.setDrawRange(start, count);
    }

    askForUpdate() {
        this.geometry.attributes.position.needsUpdate = true;
        // update bounding sphere so frustum culling works
        this.geometry.computeBoundingSphere();
    }

    fillAttribute(attribute, array, index, quantity) {
        const attr = this.geometry.attributes[attribute];

        let start = index || 0;
        const end  = index + quantity || attr.array.length / 3;
        for (; start < end; start++) {
            attr.array.set(array, start * 3);
        }

        attr.needsUpdate = true;
        if (attribute === 'position') {
            // update bounding sphere so frustum culling works
            this.geometry.computeBoundingSphere();
        }
    }

    setPoint(point, index, starIndex) {
        this.geometry.attributes.position.set(point, index * 3);
        this.path.push(starIndex);
    }

    addPoint(point, color, starIndex) {
        this.setPoint(point, this.count, starIndex);
        this.setColor(color, this.count);
    }

    copyPoint(targetIndex, toCopyIndex) {
        this.geometry.attributes.position.array.copyWithin(
            targetIndex * 3,
            toCopyIndex * 3,
            targetIndex * 3 + 1
        );
        this.path.push(this.path[toCopyIndex]);
    }

    duplicateLastPoint() {
        this.copyPoint(this.count, this.count - 1);
    }

    setColor(color, index) {
        let colors = this.geometry.attributes.color;
        colors.array.set(color, index * 3);
        colors.array.set(color, (index + 1) * 3);
        colors.needsUpdate = true;
    }

    hydrate() {
        return {
            name: this.name,
            path: this.path
        }
    }

    static fromFirstPoint(point, starIndex, color) {
        const asterism = new Asterism();
        asterism.fillAttribute('position', point);
        asterism.fillAttribute('color', color);
        asterism.setDrawRange(0, 1);
        asterism.path.push(starIndex);

        return asterism;
    }

    static hydrate(asterismData, stars) {
        let asterism = new Asterism(asterismData.name);

        let coords = asterismData.path.map(index => stars.getCoordinatesArray(index));

        let positions = new Float32Array(_MAX * 3);
        for (let i = 0; i < _MAX; i++) {
            if (coords[i]) positions.set(coords[i], i * 3);
            else positions.set(coords[0], i * 3);
        }

        asterism.geometry.attributes.position.set(positions);
        asterism.fillAttribute('color', colors.render);

        asterism.setDrawRange(0, asterismData.path.length);
        asterism.askForUpdate();

        asterism.path = asterismData.path;

        return asterism;
    }

}
