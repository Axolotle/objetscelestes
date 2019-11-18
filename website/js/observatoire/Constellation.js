import {
    Color, Vector3, BufferAttribute, VertexColors, // Helpers
    BufferGeometry, // Geometries
    ShaderMaterial, PointsMaterial, // Materials
    Points // 3D objects
} from '../libs/three.module.js';


const _color = new Color(0x00ff00).toArray();
const _selectColor = new Color(0xff0000).toArray();
const _target = new Vector3();
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

// temp name converter for Bayer designation
// https://en.wikibooks.org/wiki/Celestia/STC_File#Bayer_Star_Names
// https://fr.wikipedia.org/wiki/Alphabet_grec
const _greek = {
    'alf': 'α', 'bet': 'β', 'gam': 'γ', 'del': 'δ',
    'eps': 'ε', 'zet': 'ζ', 'eta': 'η', 'tet': 'θ',
    'iot': 'ι', 'kap': 'κ', 'lam': 'λ', 'mu.': 'μ',
    'nu.': 'ν', 'ksi': 'ξ', 'omi': 'ο', 'pi.': 'π',
    'rho': 'ρ', 'sig': 'σ', 'tau': 'τ', 'ups': 'υ',
    'phi': 'φ', 'chi': 'χ', 'psi': 'ψ', 'ome': 'ω',
}

const _const = {
    'UMa': 'Grande Ourse (Ursa Major)'
}

const _type = {
    'Star': 'Star',
    'PM*': 'High proper-motion Star',
    'SB*': 'Spectroscopic binary',
    'Em*': 'Emission-line Star',
    '**': 'Double or multiple star',
    'RSCVn': 'Variable Star of RS CVn type',
    'PulsV*delSct': 'Variable Star of delta Sct type',
    'RotV*alf2CVn': 'Variable Star of alpha2 CVn type',
}

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
            vertexShader: _vertexShader,
            fragmentShader: _fragmentShader,
            depthTest: false
        });
        // const shaderMaterial = new PointsMaterial({vertexColors: VertexColors, size: 10, sizeAttenuation: false, depthTest: false})

        super(geometry, shaderMaterial);
        this.matrixAutoUpdate = false;
        this.name = 'Stars';
        this.renderOrder = 2;
        this.geometry.scale(10,10,10);

        // Custom properties
        this.selected = null;
        this.infos = stars;
        this.labels = [];
        this.setupLabels();

    }

    get minMaxMag () {
        return [
            this.infos[0].vmag,
            this.infos[this.infos.length-1].vmag
        ]
    }

    getTarget(index) {
        if (index === undefined) {
            if (this.selected === null) return null;
            index = this.selected;
        }
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

    updateDrawRange (min, max) {
        let minIdx = this.infos.findIndex(star => star.vmag >= min);
        let maxIdx = this.infos.findIndex(star => star.vmag >= max);
        this.geometry.setDrawRange(minIdx < 0 ? this.infos.length : minIdx , maxIdx < 0 ? this.infos.length : maxIdx)
    }

    displayInfos (sub) {
        let star = this.infos[this.selected];

        // Maybe modify data instead of parsing stuff
        let name = '';
        if (star.ids.includes('NAME')) {
            let i = star.ids.indexOf('NAME') + 5;
            name = star.ids.slice(i, star.ids.indexOf('|', i)) + ' — ';
        }
        let extraname = star.name.replace('*', '').trim();
        let greek = extraname.substring(0, 3);
        if (greek in _greek) {
            extraname = extraname.replace(greek, _greek[greek]);
        }
        name += extraname;
        if (sub) {
            document.querySelector('#subCard h2').textContent = name;
            document.getElementById('subCard').classList.remove('hide');
            document.getElementById('mainCard').classList.add('hide');
            return;
        } else {
            document.getElementById('subCard').classList.add('hide');
            document.getElementById('mainCard').classList.remove('hide');
        }

        document.querySelector('#mainCard h2').textContent = name;
        // Constellation name
        document.getElementById('constellation').textContent = _const[extraname.slice(-3)];
        // Position
        let ra = star.ra.split(' ');
        document.getElementById('asc').innerHTML = ra[0] + '<sup>h</sup> ' + ra[1] + '<sup>m</sup> ' + ra[2] + '<sup>s</sup>';
        let dec = star.dec.split(' ');
        document.getElementById('dec').textContent = dec[0] + '° ' + dec[1] + '\' ' + dec[2] + '"';
        // Distance
        document.getElementById('dist').textContent = star.dist.value.toFixed(2) + ' pc';
        // Vmag
        document.getElementById('mag').textContent = star.vmag.toFixed(2);
        // Type
        document.getElementById('type').textContent = _type[star.type];
        // URL to symbad query
        document.getElementById('simbad').href = 'http://simbad.u-strasbg.fr/simbad/sim-id?Ident=' + star.name;
    }

    hideInfos () {
        document.getElementById('subCard').classList.add('hide');
        document.getElementById('mainCard').classList.add('hide');
    }

    setupLabels () {
        const container = document.getElementById('starsLabels');
        for (let i = 0, l = this.infos.length; i < l; i++) {
            const elem = document.createElement('div');
            // FIXME Rework naming
            let name = this.infos[i].name.replace('*', '').replace('UMa', '').trim();
            let greek = name.substring(0, 3);
            if (greek in _greek) {
                name = name.replace(greek, _greek[greek]);
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
