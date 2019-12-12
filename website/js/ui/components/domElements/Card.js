import { Subscriber } from '../../../utilities/Subscriber.js';
import { greekAbbr, constName, starType } from '../../../misc/starDictionnary.js';


export class Card extends Subscriber {
    constructor(elem) {
        super();
        this.elem = elem;

        this.subscribe('star-selected', this.onselection);
        this.subscribe('mouse-rightclick', () => this.visible = false);
        this.subscribe('switch-drawMode', this.switchDisplayStyle);
    }

    get visible() {
        return !this.elem.classList.contains('hide');
    }

    set visible(value) {
        if (value) {
            this.elem.classList.remove('hide');
        } else {
            this.elem.classList.add('hide');
        }
    }

    onselection(star) {
        let [name, extraname] = Card.parseName(star.name, star.ids);
        this.elem.querySelector('#subCard h2').textContent = name + extraname;
        this.elem.querySelector('#mainCard h2').textContent = name + extraname;

        // Constellation name
        this.elem.querySelector('#constellation').textContent = constName[extraname.slice(-3)];
        // Position
        let ra = star.ra.split(' ');
        this.elem.querySelector('#asc').innerHTML = ra[0] + '<sup>h</sup> ' + ra[1] + '<sup>m</sup> ' + ra[2] + '<sup>s</sup>';
        let dec = star.dec.split(' ');
        this.elem.querySelector('#dec').textContent = dec[0] + '° ' + dec[1] + '\' ' + dec[2] + '"';
        // Distance
        this.elem.querySelector('#dist').textContent = star.dist.value.toFixed(2) + ' pc';
        // Vmag
        this.elem.querySelector('#mag').textContent = star.vmag.toFixed(2);
        // Type
        this.elem.querySelector('#type').textContent = starType[star.type];
        // URL to symbad query
        this.elem.querySelector('#simbad').href = 'http://simbad.u-strasbg.fr/simbad/sim-id?Ident=' + star.name;

        this.visible = true;
    }

    switchDisplayStyle(minified) {
        let main = this.elem.querySelector('#mainCard');
        let sub = this.elem.querySelector('#subCard');
        if (minified) {
            sub.classList.remove('hide');
            main.classList.add('hide');
        } else {
            sub.classList.add('hide');
            main.classList.remove('hide');
        }
    }

    static parseName(baseName, ids) {
        let name = '';
        if (ids.includes('NAME')) {
            let i = ids.indexOf('NAME') + 5;
            name = ids.slice(i, ids.indexOf('|', i)) + ' — ';
        }
        let extraname = baseName.replace('*', '').trim();
        let greek = extraname.substring(0, 3);
        if (greek in greekAbbr) {
            extraname = extraname.replace(greek, greekAbbr[greek]);
        }
        return [name, extraname];
    }
}
