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

    addSegment(point, starIndex, connect) {
        const count = this.object.count;
        if (connect && count > 1 && count % 2 === 0) {
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
                this.object.fillAttribute('color', colors.render);
            }
            this.selected.length = 0;
        }
    }

    delete() {
        if (this.selected.length > 0) {
            // if we want to completely delete the object if there ara no more
            // segments in it.
            // if (this.selected.length === this.object.count / 2) {
            //     this.object.dispose()
            // }
            this.selected.sort((a, b) => b - a);
            for (const index of this.selected) {
                this.object.shiftWithin(index);
                this.object.path.splice(index, 2);
                this.object.setDrawRange(0, this.object.count);
            }
            // if removed point was the first point, refill the unseen part of
            // the buffer attribute with the newly first point to avoid bounding
            // sphere "errors"
            // TODO: this may become useless if we manage to mofify the Asterism's
            // raycast method to do not test collisions of ray with points outside
            // of the drawRange (rendered part of the geometry).
            if (this.selected[0] === 0) {
                let firstPoint = this.object.getPoint(0);
                this.object.fillAttribute('position', firstPoint, this.object.count);
            }
            this.object.askForUpdate();
            this.unselect();
        } else {
            this.object.dispose();
            this.clear();
        }
    }

    clear() {
        this.unselect();
        this.object = undefined;
    }
}
