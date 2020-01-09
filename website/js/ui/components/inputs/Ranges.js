import { LitElement, html, css } from '../../../../../web_modules/lit-element.js';

export class Range extends LitElement {
    static get properties() {
        return {
            min: { type: Number },
            max: { type: Number },
            step: { type: Number },
        };
    }

    static get styles() {
        return css`
            :host {
                width: 100%;
            }
            input[type=range] {
                box-sizing: border-box;
                display: inline-block;
                margin: 0;
                width: 100%;
                height: 1.5rem;
                border: 1px black solid;
                border-radius: 0;
                background-color: transparent;
                -webkit-appearance: none;
            }

            input[type=range]:focus {
                outline: none;
            }

            input[type=range]::-moz-range-thumb {
                height: 1.5rem;
                width: 1rem;
                background-color: black;
                border: none;
                border-radius: 0;
                cursor: pointer;
            }
            input[type=range]::-moz-range-thumb:hover {
                background-color: #ff00ff;
                width: 1.5rem;
            }
            input[type=range]::-moz-focus-outer {
                border: 0;
            }
            input[type=range]:focus::-moz-range-thumb {
                width: calc(1.5rem - 4px);
                height: calc(1.5rem - 4px);
                border: 2px #ff00ff dashed;
            }

            input[type=range]::-webkit-slider-thumb {
              -webkit-appearance: none;
              height: 1.5rem;
              width: 1rem;
              background-color: black;
              border: none;
              border-radius: 0;
              cursor: pointer;
            }
            input[type=range]::-webkit-slider-thumb:hover {
                background-color: #ff00ff;
                width: 1.5rem;
            }
            input[type=range]:focus::-webkit-slider-thumb {
                width: 1.5rem;
                border: 2px #ff00ff dashed;
            }
        `;
    }

    constructor() {
        super();
        this.min = this.getAttribute('min');
        this.max = this.getAttribute('max');
        this.step = this.getAttribute('step');
    }
}


export class SingleRange extends Range {
    static get properties() {
        return {
            ...Range.properties,
            value: { type: Number },
        };
    }

    constructor() {
        super();
        this.value = this.getAttribute('value') || this.max;
    }

    onInput(e) {
        this.value = e.target.value;
        const ev = new CustomEvent('change', { detail: {value: this.value}});
        console.log(this.value);
        this.dispatchEvent(ev);
    }

    render() {
        return html`<input @input="${this.onInput}" type="range" min="${this.min}" max="${this.max}" step="${this.step}" />`;
    }
}


customElements.define('single-range', SingleRange);
