import { Group } from '../../../web_modules/three.js';
import { Asterism } from './Asterism.js';


export class SkyMap extends Group {
    constructor(name) {
        super();
        this.name = name || 'Sans titre';
        this.visible = false;
    }

    deshydrate() {
        return {
            name: this.name,
            asterisms: this.children.map(ast => ast.hydrate())
        }
    }

    dispose() {
        for (const child of this.children) {
            child.dispose();
        }

        this.parent.remove(this);
    }

    deepClone(name) {
        return new SkyMap(name).deepCopy(this);
    }

    deepCopy(source) {
        for (let i = 0, l = source.children.length; i < l; i++) {
            this.add(source.children[i].deepClone());
        }
        
        return this;
    }

    static hydrate(skyMapData, stars) {
        let skyMap = new SkyMap(skyMapData.name);
        for (const asterismData of skyMapData.asterisms) {
            skyMap.add(Asterism.hydrate(asterismData, stars));
        }

        return skyMap;
    }
}
