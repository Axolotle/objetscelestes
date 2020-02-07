import { LitElement, html, css } from '../../../../../web_modules/lit-element.js';


export class FloatingLabels extends LitElement {
    static get styles() {
        return css`
            :host {
                display: block;
                contain: content;
                box-sizing: border-box;
            }
            :host(.hidden) {
                display: none;
            }
            :host(.shadow) span {
                text-shadow:
                    -1px -1px 0 #0000ff,
                     0   -1px 0 #0000ff,
                     1px -1px 0 #0000ff,
                     1px  0   0 #0000ff,
                     1px  1px 0 #0000ff,
                     0    1px 0 #0000ff,
                    -1px  1px 0 #0000ff,
                    -1px  0   0 #0000ff;
            }
            span {
                position: absolute;
            }

            .hidden {
                display: none;
            }
        `;
    }

    render() {
        return html`${this.elems.map((elem) => html`<span style="transform: ${elem.transform}">${elem.text}</span>`)}`;
    }

    constructor() {
        super();
        this.elems = [];
    }

    get visible() {
        return !this.classList.contains('hidden');
    }

    set visible(value) {
        if (value) {
            this.classList.remove('hidden');
        } else {
            this.classList.add('hidden');
        }
    }

    updateContent(elems) {
        this.elems = elems;
        this.requestUpdate().then(() => {
            this.elems = [];
        });
    }


}

customElements.define('floating-labels', FloatingLabels);
