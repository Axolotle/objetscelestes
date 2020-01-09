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


export class DoubleRange extends Range {
    static get properties() {
        const prop ={
            ...Range.properties,
            valueLow: { type: Number },
            valueHigh: { type: Number },
            value: { type: Array },
        }
        console.log(prop);
        return prop ;
    }

    static get styles() {
        return [
            super.styles,
            css`
                input.original {
                    position: absolute;
                    width: calc(100% - 2rem - 2px);
                }
                input.original::-moz-range-thumb {
                    transform: scale(1); /* FF doesn't apply position it seems */
                    z-index: 1;
                }
                input.original::-webkit-slider-thumb {
                    position: relative;
                    z-index: 2;
                }

                input.ghost {
                    position: relative;
                    background: var(--track-background);
                    --track-background: linear-gradient(to right,
                            transparent var(--low), var(--range-color) 0,
                            var(--range-color) var(--high), transparent 0
                        ) no-repeat 0 50% / 100% 100%;
                    --range-color: hsl(240, 100%, 100%);
                }
                input.ghost::-moz-range-track {
                    background: var(--track-background);
                }
                input.ghost::-webkit-slider-runnable-track {
                    background: var(--track-background);
                }
            `
        ];
    }

    get valueLow() { return Math.min(this.original ? this.original.value : this.min, this.ghost ? this.ghost.value : this.max); }
    set valueLow(value) { this.original.value = value; }

    get valueHigh() { return Math.max(this.original ? this.original.value : this.min, this.ghost ? this.ghost.value : this.max); }
    set valueHigh(value) { this.ghost.value = value; }

    get value() { return [this.valueLow, this.valueHigh] }
    set value(values) {
        this.original.value = values[0];
        this.ghost.value = values[1];
    }

    constructor() {
        super();
        this.updateComplete.then(() => {
            this.original = this.shadowRoot.querySelector('.original');
            this.ghost = this.shadowRoot.querySelector('.ghost');
            this.valueLow = this.min;
            this.valueHigh = this.max;
            this.updateStyle();
        });
    }

    onInput() {
        this.updateStyle();
        const ev = new CustomEvent('change', { detail: {value: this.value}});
        console.log(this.value);
        this.dispatchEvent(ev);
    }

    onMousedown(e) {
        // Find the horizontal position that was clicked
        let clickValue = this.min + (this.max - this.min) * e.offsetX / this.ghost.offsetWidth;
        let middleValue = (this.valueHigh + this.valueLow)/2;
        if ( (this.valueLow == this.ghost.value) == (clickValue > middleValue) ) {
            // Click is closer to input element and we swap thumbs
            this.original.value = this.ghost.value;
        }
    }

    updateStyle() {
        this.ghost.style.setProperty(
            "--low",
            100 * ((this.valueLow - this.min) / (this.max - this.min)) + 1 + "%"
        );
        this.ghost.style.setProperty(
            "--high",
            100 * ((this.valueHigh - this.min) / (this.max - this.min)) - 1 + "%"
        );
    }

    render() {
        return html`
            <input
                @input="${this.onInput}"
                class="original" type="range"
                min="${this.min}" max="${this.max}" step="${this.step}"
            />
            <input
                @input="${this.onInput}" @mousedown="${this.onMousedown}"
                class="ghost" type="range"
                min="${this.min}" max="${this.max}" step="${this.step}"
            />
        `;
    }
}


customElements.define('single-range', SingleRange);
customElements.define('double-range', DoubleRange);
