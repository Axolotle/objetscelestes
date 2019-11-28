import { Vector2 } from '../../libs/three.module.js';

export default class Mouse extends Vector2 {
    setFromPage(canvas, pageX, pageY) {
        this.set(
            (pageX - canvas.width * 0.5) / (canvas.width * 0.5),
            (canvas.height + 2 * -pageY) / canvas.width
        )
    }
}
