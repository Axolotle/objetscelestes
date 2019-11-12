import * as THREE from '../libs/three.module.js';


const _MAX = 50;
const _selectColor = 0xff00ff;
const _renderColor = 0x000000;
const _selectSegmentColor = 0xff0000;
const _color = new THREE.Color();
let _mouse = new THREE.Vector3();
let _pt = new THREE.Vector3();

export class Asterism extends THREE.LineSegments {
    constructor (startPt) {
        let positions = new Float32Array(_MAX * 3);
        let colors = new Float32Array(_MAX * 3);
        _color.setHex(_selectColor);
        for (let i = 0; i < _MAX; i++) {
            _color.toArray(colors, i * 3);
            // set all positions to first vertex to avoid raycasting and bounding errors
            startPt.toArray(positions, i * 3)
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setDrawRange(0, 2);

        const material = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors, linewidth: 1.5, depthTest: false});

        super(geometry, material);

        this.matrixAutoUpdate = false;
        this.renderOrder = 1;

        // customs properties
        this.drawCount = 2;
        this.preDraw = true;
        this.isSelected = true;
        this.selectedSegments = [];

        this.initListeners();
    }

    addPoint (point) {
        let pts = this.geometry.attributes.position.array;
        let prev = (this.drawCount - 2) * 3;
        if (this.preDraw) {
            // do not draw the point if it is the same as the previous one
            if (pts[prev] === point.x && pts[prev+1] === point.y && pts[prev+2] === point.z) return;
            point.toArray(pts, (this.drawCount -1) * 3);
        }
        if (this.selectedSegments.length > 0) {
            this.unselect(null, true);
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

    // display a line from last point to mouse position while drawing
    // from https://stackoverflow.com/a/13091694
    preDrawSegment (mouse, camera) {
        _mouse.set(mouse.x, mouse.y, 0.5);
        _mouse.unproject(camera);
        _mouse.sub(camera.position).normalize();
        let dist = -camera.position.z / _mouse.z;
        _pt.copy(camera.position).add(_mouse.multiplyScalar(dist));

        let pts = this.geometry.attributes.position;
        _pt.toArray(pts.array, (this.drawCount - 1) * 3);
        pts.needsUpdate = true;
    }

    select (index, additive) {
        let colors = this.geometry.attributes.color;
        if (index !== undefined) {
            if (!additive) {
                _color.setHex(_selectColor);
                for (let i = 0, l = this.selectedSegments.length; i < l; i++) {
                    _color.toArray(colors.array, this.selectedSegments[i] * 3);
                    _color.toArray(colors.array, (this.selectedSegments[i] + 1) * 3);
                }
                this.selectedSegments.length = 0;
            } else if (this.selectedSegments.includes(index)) {
                this.unselect(index);
                return;
            }
            _color.setHex(_selectSegmentColor);
            this.selectedSegments.push(index);
            _color.toArray(colors.array, index * 3);
            _color.toArray(colors.array, (index + 1) * 3);
        } else {
            _color.setHex(_selectColor);
            for (let i = 0; i < _MAX; i++) {
                _color.toArray(colors.array, i * 3);
            }
            this.isSelected = true;
        }
        colors.needsUpdate = true;
    }

    unselect (index, allSelected) {
        let colors = this.geometry.attributes.color;
        if (typeof index === 'number') {
            _color.setHex(_selectColor);
            _color.toArray(colors.array, index * 3);
            _color.toArray(colors.array, (index + 1) * 3);
            this.selectedSegments.splice(this.selectedSegments.indexOf(index), 1);
        } else if (allSelected) {
            _color.setHex(_selectColor);
            for (const index of this.selectedSegments) {
                _color.toArray(colors.array, index * 3);
                _color.toArray(colors.array, (index + 1) * 3);
            }
            this.selectedSegments.length = 0;
        } else {
            this.isSelected = false;
            _color.setHex(_renderColor);
            for (let i = 0; i < _MAX; i++) {
                _color.toArray(colors.array, i * 3);
            }
        }

        colors.needsUpdate = true;
    }

    removeSegments (segments) {
        if (segments === undefined) segments = this.selectedSegments;
        segments.sort((a, b) => b - a);
        let pts = this.geometry.attributes.position;
        for (let s = 0, l = segments.length; s < l; s++) {
            // FIXME this.unselect() removes one selected segment and force to use segments[0] to get the next
            for (let i = segments[s] * 3, len = this.drawCount * 3; i < len; i++) {
                pts.array[i] = pts.array[i+6];
                pts.array[i+3] = pts.array[i+9];
            }
            this.drawCount -= 2;
        }
        this.unselect(null, true);
        this.geometry.setDrawRange(0, this.drawCount);
        // segments.length = 0;
        pts.needsUpdate = true;
    }

    stopAction () {
        if (this.drawCount === 2) return;
        this.preDraw = false;
        this.drawCount -= 2;
        this.geometry.setDrawRange(0, this.drawCount);
        // reset predrawn points to avoid raycasting and bounding errors
        this.geometry.attributes.position.array.copyWithin(this.drawCount * 3, -6);
    }

    dispose () {
        this.parent.remove(this);
        this.geometry.dispose();
        this.material.dispose();
    }

    // EVENTS LISTENERS

    initListeners () {
        window.addEventListener('keydown', this);
    }

    handleEvent(event) {
        if (event.repeat) return;
        this[event.type](event);
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
