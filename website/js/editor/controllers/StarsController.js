import { Stars } from '../../objects3d/Stars.js';

import { starsColors as colors } from '../../misc/colors.js';


export class StarsController {
    constructor(data) {
        this.object = new Stars(data);
        this.data = data;

        this.selected = [];
    }

    raycast(raycaster) {
        let intersect = raycaster.intersectObject(this.object)[0];
        if (intersect !== undefined) {
            return {
                index: intersect.index,
                point: this.object.getCoordinatesArray(intersect.index),
                data: this.data[intersect.index]
            }
        } else {
            return null;
        }
    }

    select(index, shift) {
        if (!shift) this.unselect();
        this.object.setColor(colors.select, index);
        this.selected.push(index);
    }

    unselect(index) {
        if (index !== undefined) {
            this.object.setColor(colors.render, index);
            this.selected.splice(this.selected.indexOf(index), 1);
        } else {
            for (let i = 0, l = this.selected.length; i < l; i++) {
                this.object.setColor(colors.render, this.selected[i]);
            }
            this.selected.length = 0;
        }
    }
}
