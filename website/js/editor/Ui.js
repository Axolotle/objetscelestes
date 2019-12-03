import { Mouse } from './components/abstract/Mouse.js';
import { Keyboard } from './components/abstract/Keyboard.js';
import { UiFactory } from './UiFactory.js';


export class Ui {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouse = new Mouse(canvas);
        this.keyboard = new Keyboard(canvas);
    }

    add(clsName, elem, ...params) {
        return UiFactory.create(clsName, elem, ...params);
    }
}
