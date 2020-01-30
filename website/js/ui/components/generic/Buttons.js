import { LitElement, html, css } from '../../../../../web_modules/lit-element.js';


export class ButtonSwitch extends LitElement {
    static get properties() {
        return {
            checked: { attribute: true, reflect: true },
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
            :focus {
                outline: none;
            }
            * {
                font: inherit;
                box-sizing: border-box;
            }

            button {
                display: flex;
                height: calc(1.5rem + 4px);
                width: 100%;
                margin: 0;
                padding: 0;
                border: none;
                background-color: transparent;
                outline: none;
                border: 2px transparent dashed;
            }
            button:focus {
                outline: none;
                border: 2px #ff00ff dashed;
            }
            button::-moz-focus-inner {
                border: 0;
            }

            .button {
                padding: 0 1rem;
                display: inline-block;
                height: 1.5rem;
                line-height: 1.5rem;
                background-color: white;
                color: black;
            }
            button[aria-checked=false] :nth-child(1) {
                background-color: #ff00ff;
            }
            button[aria-checked=true] :nth-child(3) {
                background-color: #ff00ff;
            }

            #separator {
                display: inline-block;
                position: relative;
                width: 100%;
                height: .5rem;
                margin-top: .5rem;
                background-color: white;
            }
            #separator::before {
                content: ' ';
                display: inline-block;
                margin-top: -.5rem;
                position:absolute;
                width: 1.5rem;
                height: 1.5rem;
                background-color: black;
            }
            button[aria-checked=true] #separator::before {
                right: 0;
            }
            button[aria-checked=false] #separator::before {
                left: 0;
            }


        `;
    }

    constructor() {
        super();
        this.checked = this.getAttribute('checked') || 'false';
    }

    render() {
        return html`
        <button role="switch" aria-checked="${this.checked}" @click="${this.onClick}">
            <span aria-hidden="true" class="button">${this.dataset.unpressed}</span>
            <span id="separator"></span>
            <span class="button">${this.dataset.pressed}</span>
        </button>
        `;
    }

    onClick() {
        const button = this.shadowRoot.querySelector('button');
        const checked = button.getAttribute('aria-checked') === 'true';
        if (checked) {
            this.checked = 'false';
        } else {
            this.checked = 'true';
        }
        this.dispatchEvent(new CustomEvent('switch', {
            detail: this.checked === 'true'
        }));
    }
}


customElements.define('button-switch', ButtonSwitch);
