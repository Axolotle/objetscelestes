import { segmentColors as colors } from '../../misc/colors.js';


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
        this.object.addPoint(point, colors.render, starIndex);
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
            this.object.setColor(colors.select, index);
            this.selected.push(index);
        }
    }

    unselect(index) {
        if (index !== undefined) {
            this.object.setColor(colors.render, index);
            this.selected.splice(this.selected.indexOf(index), 1);
        } else {
            for (const i of this.selected) {
                this.object.fillAttribute('color', colors.render, 0, this.object.path.length);
            }
            this.selected.length = 0;
        }
    }

    clear() {
        this.selected.length = 0;
        this.object = undefined;
    }
}
