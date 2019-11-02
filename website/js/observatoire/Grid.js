import * as THREE from '../libs/three.module.js';


export class Grid extends THREE.Group {
    constructor () {
        super();

        this.parallel = {object: null, vertices: [], elems: []};
        this.meridian = {object: null, vertices: [], elems: []};

        this.draw();
        this.setupLabels();
    }

    update (camera, renderElem) {
        // this.latLine.object.updateMatrixWorld();
        for (const line of ['meridian', 'parallel']) {
            for (let i = 0, l = this[line].vertices.length; i < l; i++) {
                let v = this[line].vertices[i].clone();
                // this is needed if the sphere is moved
                // v.applyMatrix4(this[line].object.matrixWorld)
                v.project(camera)
                if (Math.abs(v.z) > 1) {
                    this[line].elems[i].classList.add('hide');
                } else {
                    const x = (v.x *  .5 + .5) * renderElem.clientWidth;
                    const y = (v.y * -.5 + .5) * renderElem.clientHeight;
                    this[line].elems[i].style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
                    this[line].elems[i].classList.remove('hide');
                }
            }
        }

    }

    draw () {
        const material = new THREE.LineBasicMaterial({color: 0xffff00, linewidth: 1});
        const pi2 = Math.PI * 2;
        // smoothness of the circle (number of straight lines)
        const smoothness = 1;
        const parallelsDiv = 24 * smoothness;
        const meridiansDiv = 18 * smoothness;
        const r = 500;

        let vertices = [];
        // define the series of vertices necessary to draw a semicircle
        for (let i = 0; i <= meridiansDiv; i++) {
            let t = (i / meridiansDiv) * Math.PI;
            let x = Math.sin(t) * r;
            let z = Math.cos(t) * r;
            vertices.push(x, 0, z);
        }

        let semiCircle = Grid.getCircle(vertices, material);
        // removes first and last vertices so the semicircle starts at the
        // first parallel and ends at the last.
        let cutCircle = Grid.getCircle(vertices.slice(3 * smoothness, -3 * smoothness), material);
        for (let i = 0; i < 24; i++) {
            if (i < 4) {
                // draw semicircles for each main axis (0h, 6h, 12h and 18h)
                let meridian = semiCircle.clone().rotateZ((i / 4) * pi2);
                // define the line that will receive the meridian labels
                if (i === 0) this.meridian.object = meridian;
                this.add(meridian);
            }
            if (i % 6 !== 0) {
                this.add(cutCircle.clone().rotateZ((i / 24) * pi2));
            }
        }

        // define the series of vertices necessary to draw a parallel with
        // a radius and a z-position according to its latitude
        for (let n = 0; n <= 8; n++) {
            // latitude
            let z = r * Math.sin((n / 18) * Math.PI);
            // radius of the parallel at this latitude
            let r2 = Math.sqrt(r*r - z*z)

            let revertices = [];
            vertices = [];
            for (let i = 0; i <= parallelsDiv; i++) {
                let t = (i / parallelsDiv) * pi2;
                let x = Math.cos(t) * r2;
                let y = Math.sin(t) * r2;
                if (n === 0) {
                    vertices.push(x, y, 0)
                } else {
                    vertices.push(x, y, z);
                    revertices.push(x, y, -z);
                }
            }
            let circle = Grid.getCircle(vertices, material);
            this.add(circle);
            if (n === 0) {
                // define the line that will receive the parallel labels
                this.parallel.object = circle
            } else {
                circle = Grid.getCircle(revertices, material);
                this.add(circle);
            }
        }
    }

    setupLabels () {
        const container = document.getElementById('labels');
        const points = {
            meridian: this.meridian.object.geometry.attributes.position.array,
            parallel: this.parallel.object.geometry.attributes.position.array
        }

        for (const [name, pos] of Object.entries(points)) {
            for (let i = 0, l = pos.length / 3; i < l; i++) {
                this[name].vertices.push(new THREE.Vector3(pos[i*3], pos[i*3+1], pos[i*3+2]));
                const elem = document.createElement('div');
                if (name === 'meridian') {
                    elem.textContent = (90 - i * 10) + '°';
                } else {
                    elem.textContent = i + 'h'
                }
                container.appendChild(elem);
                this[name].elems.push(elem);
            }
        }

    }

    static getCircle (vertices, material) {
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        return new THREE.Line(geometry, material);
    }
}
