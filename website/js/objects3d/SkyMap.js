import { Group } from '../../../web_modules/three.js';
import { Asterism } from './Asterism.js';


export class SkyMap extends Group {
    constructor(name, group) {
        super();
        this.name = name || 'Sans titre';
        this.visible = false;

        this.userData.group = group;
    }

    deshydrate() {
        return {
            name: this.name,
            id: this.uuid,
            group: this.userData.group,
            asterisms: this.children.map(ast => ast.hydrate())
        }
    }

    dispose() {
        for (const child of this.children) {
            child.dispose();
        }

        this.parent.remove(this);
    }

    deepClone(name, group) {
        return new SkyMap(name, group).deepCopy(this);
    }

    deepCopy(source) {
        for (let i = 0, l = source.children.length; i < l; i++) {
            this.add(source.children[i].deepClone());
        }

        return this;
    }

    static hydrate(data, stars) {
        let skyMap = new SkyMap(data.name, data.group);
        if (data.id) skyMap.uuid = data.id;
        for (const asterismData of data.asterisms) {
            skyMap.add(Asterism.hydrate(asterismData, stars));
        }

        return skyMap;
    }
}
