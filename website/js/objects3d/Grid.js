import {
    Vector3, Float32BufferAttribute, // Helpers
    LineBasicMaterial, // Materials
    BufferGeometry, // Geometries
    Group, Line // 3D objects
} from '../../../web_modules/three.js';


const _pos = new Vector3();

export class Grid extends Group {
    constructor () {
        super();

        this.parallel = null;
        this.meridian = null;

        this.draw();
    }

    getLabelsPosition(space) {
        const w = space.offsetWidth;
        const h = space.offsetHeight;
        const elems = [];
        for (const line of ['meridian', 'parallel']) {
            for (let i = 0, l = this[line].length; i < l; i += 3) {
                const elem = {};
                _pos.set(this[line][i], this[line][i+1], this[line][i+2]);
                // this is needed if the sphere is moved
                // _pos.applyMatrix4(line.object.matrixWorld)
                _pos.project(space.camera);
                if (Math.abs(_pos.z) <= 1) {
                    const x = (_pos.x *  .5 + .5) * w;
                    const y = (_pos.y * -.5 + .5) * h;
                    if (x < -20 || x > w + 20 || y < -20 || y > h + 20) {
                        continue;
                    }
                    elem.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
                    elem.text = line === 'meridian'
                        ? (90 - (i / 3) * 10) + '°'
                        : (i / 3) + 'h';
                    elems.push(elem);
                }
            }
        }
        return elems;
    }

    draw () {
        const material = new LineBasicMaterial({color: 0xffff00, linewidth: 1});
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
                if (i === 0) this.meridian = meridian.geometry.attributes.position.array;
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
                this.parallel = circle.geometry.attributes.position.array;
            } else {
                circle = Grid.getCircle(revertices, material);
                this.add(circle);
            }
        }
    }

    static getCircle (vertices, material) {
        let geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        return new Line(geometry, material);
    }
}
