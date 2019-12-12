import { Subscriber } from '../../../utilities/Subscriber.js';


let _onclick;

export class Switch extends Subscriber {
    constructor(elem, baseState) {
        super();
        this.elem = elem;
        this.elem.setAttribute('aria-checked', baseState ? 'true' : 'false');

        _onclick = this.onclick.bind(this);
        this.elem.addEventListener('click', _onclick, false);
    }

    onclick() {
        let checked = this.elem.getAttribute('aria-checked') === 'true';
        if (checked) {
            this.elem.setAttribute('aria-checked', 'false');
        } else {
            this.elem.setAttribute('aria-checked', 'true');
        }
        this.onChange(!checked);
    }

    /**
     * onChange function set by the Ui editor and used to publish changes.
     */
    onChange(checked) {
        this.publish('switch-' + this.elem.id, checked);
    }
}
