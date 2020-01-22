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
                display: block;
                contain: content;
                width: 100%;
                box-sizing: content-box;
                height: 1.5rem;
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
}


export class SingleRange extends Range {
    static get properties() {
        return {
            ...super.properties,
            default: { type: Number },
        };
    }

    static get styles() {
        return [
            super.styles,
            css`
                input[type=range] {
                    background: white;
                }
            `
        ];
    }

    constructor() {
        super();
    }

    firstUpdated() {
        this.range = this.shadowRoot.querySelector('input');
        this.value = this.default !== undefined ? this.default : this.max / 2;
    }

    get value() { return this.range.value }
    set value(value) {
        this.range.value = value;
        this.onInput();
    }

    onInput() {
        const ev = new CustomEvent('range-change', {
            bubbles: true,
            composed: true,
            detail: {value: this.value}
        });
        this.dispatchEvent(ev);
    }

    render() {
        return html`
        <input type="range"
            min="${this.min}" max="${this.max}" step="${this.step}"
            @input="${this.onInput}"
        />
        `;
    }
}


export class DoubleRange extends Range {
    static get properties() {
        return {
            ...super.properties,
            default: { type: Array }
        };
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
        this.values = [this.value]
        this.onInput();
    }

    constructor() {
        super();
    }

    firstUpdated() {
        this.original = this.shadowRoot.querySelector('.original');
        this.ghost = this.shadowRoot.querySelector('.ghost');
        this.value = this.default !== undefined ? this.default : [this.min, this.max];
    }

    onInput() {
        this.updateStyle();
        const ev = new CustomEvent('range-change', {
            bubbles: true,
            composed: true,
            detail: {value: this.value}
        });
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

export class RangeBox extends LitElement {
    static get properties() {
        return {
            ...Range.properties,
            default: {type: String}
        };
    }

    static get styles() {
        return css`
            :host {
                display: block;
                contain: content;
                width: 100%;
                box-sizing: border-box;
            }

            * {
                box-sizing: border-box;
            }

            single-range, double-range {
                margin-top: .5rem;
            }

            input[type=number] {
                -moz-appearance: textfield;
                border: 0;
                width: 4rem;
                height: 1.5rem;
                margin: 0;
                padding: 0;
                background-color: white;
                font-family: inherit;
                text-align: center;
            }
            input[type=number]:focus, input[type=number]:hover {
                background-color: #ff00ff;
                color: white;
            }
            input[type=number]:invalid {
                background-color: red;
                color: white;
            }
            input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            div {
                display: flex;
            }

            label {
                display: inline-block;
                box-sizing: border-box;
                width: 100%;
                height: 1.5rem;
                line-height: 1.5rem;
                background-color: black;
                padding: 0 1rem;
            }
        `;
    }

    constructor() {
        super();
        this.abbr = this.dataset.abbr;
        this.addEventListener('range-change', this.onRangeChange, false);
    }
}

export class SingleRangeBox extends RangeBox {
    firstUpdated() {
        this.range = this.shadowRoot.querySelector('single-range');
        this.box = this.shadowRoot.querySelector('input[name="range"]');
    }

    onRangeChange(e) {
        this.box.value = e.detail.value;
    }

    onInputChange(e) {
        if (e.target.validity.badInput) return;
        this.range.value = this.box.value;
    }

    render() {
        return html`
        <div>
            <label for="range">${this.abbr}</label>
            <input @change="${this.onInputChange}" name="range" type="number" min="${this.min}" max="${this.max}" step="${this.step}"/>
        </div>
        <single-range default="${this.default}" min="${this.min}" max="${this.max}" step="${this.step}"></single-range>
        `;
    }
}


export class DoubleRangeBox extends RangeBox {
    firstUpdated() {
        this.range = this.shadowRoot.querySelector('double-range');
        this.minBox = this.shadowRoot.querySelector('input[name="minRange"]');
        this.maxBox = this.shadowRoot.querySelector('input[name="maxRange"]');
    }

    onRangeChange(e) {
        [this.minBox.value, this.maxBox.value] = e.detail.value;
    }

    onInputChange(e) {
        if (e.target.validity.badInput) return;
        this.range.value = [this.minBox.value, this.maxBox.value];
    }

    render() {
        return html`
        <div>
            <label for="minRange">min ${this.abbr}</label>
            <input @change="${this.onInputChange}" name="minRange" type="number" min="${this.min}" max="${this.max}" step="${this.step}"/>
        </div>
        <div>
            <label for="maxRange">max ${this.abbr}</label>
            <input @change="${this.onInputChange}" name="maxRange" type="number" min="${this.min}" max="${this.max}" step="${this.step}"/>
        </div>
        <double-range default="${this.default}" min="${this.min}" max="${this.max}" step="${this.step}"></double-range>
        `;
    }
}


customElements.define('single-range', SingleRange);
customElements.define('double-range', DoubleRange);
customElements.define('single-rangebox', SingleRangeBox);
customElements.define('double-rangebox', DoubleRangeBox);
