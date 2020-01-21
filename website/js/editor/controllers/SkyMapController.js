import { SkyMap } from '../../objects3d/SkyMap.js';
import { Asterism } from '../../objects3d/Asterism.js';
import { AsterismController } from './AsterismController.js';

import { asterismColors as colors } from '../../misc/colors.js';


export class SkyMapController {
    constructor() {
        this.object = undefined;
        this.asterismCtrl = new AsterismController();
        this.selected = [];
    }

    set(object) {
        // ??TODO: use dispose() to free memory but need to recreate the object
        // if (this.object !== undefined) this.dispose();
        if (this.object !== undefined) this.object.visible = false;
        this.object = object;
        this.object.visible = true;
        this.asterismCtrl.object = undefined;
        this.selected.length = 0;
    }

    raycast(raycaster) {
        let intersect = raycaster.intersectObject(this.object, true)[0];
        if (intersect !== undefined) {
            return {
                asterism: this.object.children.indexOf(intersect.object),
                segment: intersect.index
            }
        } else {
            return null;
        }
    }

    addPoint(point, starIndex, connect) {
        if (this.selected.length !== 1) {
            let asterism = Asterism.fromFirstPoint(point, starIndex, colors.select);
            this.asterismCtrl.set(asterism);
            this.unselect();
            this.object.add(asterism);
            this.selected = [this.object.children.length - 1];
        } else {
            this.asterismCtrl.addPoint(point, starIndex, connect);
        }
    }

    select(targets, shift) {
        let asterism = this.object.children[targets.asterism];
        // Asterism is already selected
        if (this.selected.includes(targets.asterism)) {
            // Asterism is currently controlled: ask for segment selection.
            if (this.asterismCtrl.object === asterism && this.selected.length === 1) {
                this.asterismCtrl.select(targets.segment, shift);
            // Multiple asterism are selected
            } else if (this.selected.length > 1) {
                // Is combinatory: unselect targeted asterism.
                if (shift) {
                    this.unselect(targets.asterism);
                    this.asterismCtrl.set(this.object.children[this.selected[this.selected.length - 1]]);
                // Unselect everything but the targeted on and select segment
                } else {
                    this.selected.splice(this.selected.indexOf(targets.asterism), 1);
                    this.unselect();
                    this.asterismCtrl.set(asterism);
                    this.asterismCtrl.select(targets.segment);
                    this.selected = [targets.asterism];
                }
            }
        // Asterism is not selected
        } else {
            // Is non-combinatory: unselect previous selection and control the new target
            if (!shift) {
                this.asterismCtrl.set(asterism);
                this.unselect();
            // Asterism is controlled: unselect it and free the controller
            } else if (this.asterismCtrl.object !== undefined) {
                this.asterismCtrl.unselect();
                this.asterismCtrl.clear();
            }
            // Add the targeted asterism to selection
            asterism.fillAttribute('color', colors.select, 0, asterism.path.length);
            this.selected.push(targets.asterism);
        }

    }

    unselect(index) {
        if (index !== undefined) {
            let asterism = this.object.children[index];
            asterism.fillAttribute('color', colors.render, 0, asterism.path.length);
            this.selected.splice(this.selected.indexOf(index), 1);
        } else {
            // Controlled asterism has segments selected: unselect those.
            if (this.asterismCtrl.selected.length > 0) {
                this.asterismCtrl.unselect();
            // Clear controller and unselect previous selection.
            } else {
                for (const i of this.selected) {
                    this.object.children[i].fillAttribute('color', colors.render, 0, this.object.children[i].path.length);
                }
                this.selected.length = 0;
            }

        }
    }

    dispose() {
        for (const child of this.object.children) {
            this.object.remove(child);
            child.geometry.dispose();
            child.material.dispose();
        }

        this.object.parent.remove(this.object);
    }
}
