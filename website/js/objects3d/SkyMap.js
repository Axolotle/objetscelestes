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
        for (const child of this.object.children) {
            child.dispose(child);
        }

        this.parent.remove(this);
    }

    static hydrate(skyMapData, stars) {
        let skyMap = new SkyMap(skyMapData.name);
        for (const asterismData of skyMapData.asterisms) {
            skyMap.add(Asterism.hydrate(asterismData, stars));
        }

        return skyMap;
    }
}
