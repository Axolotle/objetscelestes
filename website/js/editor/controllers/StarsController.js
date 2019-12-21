import { Color } from '../../libs/three.module.js';
import { Stars } from '../../objects3d/Stars.js';


const _renderColor = new Color(0x00ff00).toArray();
const _selectColor = new Color(0xff0000).toArray();


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
                point: this.object.getCoordinatesVector(intersect.index),
                data: this.data[intersect.index]
            }
        } else {
            return null;
        }
    }

    select(index, shift) {
        if (!shift) this.unselect();
        this.object.setColor(_selectColor, index);
        this.selected.push(index);
    }

    unselect(index) {
        if (index !== undefined) {
            this.object.setColor(_renderColor, index);
            this.selected.splice(this.selected.indexOf(index), 1);
        } else {
            for (let i = 0, l = this.selected.length; i < l; i++) {
                this.object.setColor(_renderColor, this.selected[i]);
            }
            this.selected.length = 0;
        }
    }
}
