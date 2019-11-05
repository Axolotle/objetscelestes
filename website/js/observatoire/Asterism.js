import * as THREE from '../libs/three.module.js';

var _start = new THREE.Vector3();
var _end = new THREE.Vector3();
var _inverseMatrix = new THREE.Matrix4();
var _ray = new THREE.Ray();
var _sphere = new THREE.Sphere();

export class Asterism extends THREE.LineSegments {
    constructor (point, rendererElem, camera) {
        const MAX = 50;

        const material = new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 1.5, depthTest: false});
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX * 3), 3));
        geometry.setDrawRange(0, 2);
        for (var i = 0; i < MAX; i++) {
            point.toArray(geometry.attributes.position.array, i * 3);
        }
        super(geometry, material);
        this.drawCount = 2;
        this.preDraw = true;
        this.matrixAutoUpdate = false;
        this.selected = true;

        this.camera = camera;
        this.renderElem = rendererElem;
        this.initListeners();
    }

    addPoint (point) {
        let pts = this.geometry.attributes.position.array;
        let prev = (this.drawCount - 2) * 3;
        // do not draw the point if it is the same as the previous one
        if (pts[prev] === point.x && pts[prev+1] === point.y && pts[prev+2] === point.z) return;
        if (this.preDraw) {
            point.toArray(pts, (this.drawCount -1) * 3);
        }
        point.toArray(pts, this.drawCount * 3);
        point.toArray(pts, (this.drawCount + 1) * 3);

        this.drawCount += 2;
        this.geometry.setDrawRange(0, this.drawCount);
        this.geometry.attributes.position.needsUpdate = true;
        this.preDraw = true;
        // update bounding sphere so frustum culling works
        this.geometry.computeBoundingSphere();
    }

    // EVENTS LISTENERS

    initListeners () {
        this.renderElem.addEventListener('mousemove', this);
        this.renderElem.addEventListener('contextmenu', this);
        window.addEventListener('keydown', this);
    }

    handleEvent(event) {
        if (event.repeat) return;
        this[event.type](event);
    }

    // display a line from last point to mouse position while drawing
    // from https://stackoverflow.com/a/13091694
    mousemove (event) {
        if (!this.preDraw) return;

        let v = new THREE.Vector3(
            (event.clientX / window.innerWidth) * 2 - 1,
            - (event.clientY / window.innerHeight) * 2 + 1,
            0.5
        );
        v.unproject(this.camera);
        v.sub(this.camera.position).normalize();
        var distance = - this.camera.position.z / v.z;
        var pos = this.camera.position.clone().add(v.multiplyScalar(distance));

        let pts = this.geometry.attributes.position.array;
        pos.toArray(pts, (this.drawCount - 1) * 3);
        this.geometry.attributes.position.needsUpdate = true;
    }

    contextmenu (event) {
        event.preventDefault();
        if (this.preDraw) {
            if (this.drawCount === 2) return;
            this.preDraw = false;
            this.drawCount -= 2;
            this.geometry.setDrawRange(0, this.drawCount);
        } else {
            let pts = this.geometry.attributes.position.array;
            for (let i = 0; i < 6; i++) {
                pts[this.drawCount * 3 + i] = pts[i % 3]
            }
            this.selected = false;
            this.material.color.setHex(0x000000);
        }
    }

    keydown (event) {
        if (event.ctrlKey && event.keyCode === 90) {
            let pts = this.geometry.attributes.position.array;
            let extra = this.preDraw ? 0 : 1
            if (event.shiftKey) {
                // REDO
                for (let next = (this.drawCount + 1 + extra) * 3, len = next + 3; next < len; next++) {
                    // if next coordinates stricly are (0,0,0), suppose it was not user input
                    if (pts[next] === 0 & pts[next+1] === 0 && pts[next+2] === 0) return;

                    let prevCoord = pts[next - 6];
                    pts[next - 6] = pts[next];
                    pts[next] = prevCoord;
                }
                this.drawCount += 2;
            } else {
                // UNDO
                // never remove first vertex
                if (this.drawCount == 2) return;

                // replace previous point by last (the one that moves on screen)
                // and move previous to unseen zone of the array so we can redo changes
                for (let last = (this.drawCount - 1 + extra) * 3, len = last + 3; last < len; last++) {
                    let prevCoord = pts[last - 6];
                    pts[last - 6] = pts[last];
                    pts[last] = prevCoord;
                }
                this.drawCount -= 2;
            }

            this.geometry.setDrawRange(0, this.drawCount);
            this.geometry.attributes.position.needsUpdate = true;
        }
    }
}
