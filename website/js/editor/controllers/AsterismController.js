import { Color } from '../../libs/three.module.js';


const _renderColor = new Color(0xff00ff).toArray();
const _selectColor = new Color(0xff0000).toArray();


export class AsterismController {
    constructor() {
        this.object = undefined;
        this.selected = [];
    }

    set(object) {
        if (this.object !== undefined) this.clear();
        this.object = object;
    }

    addPoint(point, starIndex, connect) {
        if (!connect) {
            this.object.addPoint(point, starIndex);
        } else if (this.object.count > 1) {
            this.object.duplicateLastPoint();
        }
        this.object.addPoint(point, _renderColor, starIndex);
        this.object.setDrawRange(0, this.object.count);
        this.object.askForUpdate();
    }

    select(index, shift) {
        // Is non-combinatory: unselect previous selection.
        if (!shift) this.unselect();
        // Is combinatory but segment is already selected: unselect targeted segment.
        if (shift && this.selected.includes(index)) {
            this.unselect(index);
        // Select the segment
        } else {
            this.object.setColor(_selectColor, index);
            this.selected.push(index);
        }
    }

    unselect(index) {
        if (index !== undefined) {
            this.object.setColor(_renderColor, index);
            this.selected.splice(this.selected.indexOf(index), 1);
        } else {
            for (const i of this.selected) {
                this.object.fillAttribute('color', _renderColor, 0, this.object.path.length);
            }
            this.selected.length = 0;
        }
    }

    clear() {
        this.selected.length = 0;
        this.object = undefined;
    }
}
