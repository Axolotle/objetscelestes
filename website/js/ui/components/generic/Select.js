import { LitElement, html, css } from '../../../../../web_modules/lit-element.js';

import { keys } from '../../../utilities/keys.js';
import { ListBox } from './Lists.js';


export class ListSelect extends ListBox {
    static get properties() {
        return {
            ...super.properties,
            label: { type: String },
        };
    }

    static get styles() {
        return [
            super.styles,
            css`
            button {
                box-sizing: border-box;
                position: relative;
                width: 100%;
                min-height: 30px;
                padding: 0 1rem;
                background-color: black;
                color: white;
                font: inherit;
                text-align: left;
                border: none;
            }
            button:hover {
              background: #ff00ff;
              color: black;
            }
            button:focus {
                outline: 2px #ff00ff dashed;
            }
            button::after {
                position: absolute;
                content: " ";
                width: 0;
                height: 0;
                right: 5px;
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
            }
            button:not([aria-expanded])::after {
                top: 7px;
                border-top: 15px solid white;
            }
            button[aria-expanded="true"]::after {
                bottom: 7px;
                border-bottom: 15px solid white;
            }
            button::-moz-focus-inner {
                border: 0;
            }

            /* inverted colors */
            :host(.inverted) button {
                background-color: white;
                color: black;
            }
            :host(.inverted) button:not([aria-expanded])::after {
                border-top: 15px solid black;
            }
            :host(.inverted) button[aria-expanded="true"]::after {
                border-bottom: 15px solid black;
            }

            span#exp_elem {
                display: block;
                height: 2rem;
                line-height: 2rem;
                margin-top: -0.5rem;
            }

            .hidden {
                display: none;
            }
            `
        ];
    }

    render() {
        if (this.multiple) {
            return html`
            <button name="button" id="exp_elem"
                aria-haspopup="listbox" aria-labelledby="exp_elem"
                @click="${this.onButtonClick}" @keyup="${this.onButtonKeyup}"
                @wheel="${this.onButtonWheel}"
            >${this.label}
            </button>
            ${super.render()}
            `;

        } else {
            return html`
            <span id="exp_elem">${this.label}</span>
            <button name="button" id="exp_button"
                aria-haspopup="listbox" aria-labelledby="exp_elem exp_button"
                @click="${this.onButtonClick}" @keyup="${this.onButtonKeyup}"
                @wheel="${this.onButtonWheel}"
            >
            </button>
            ${super.render()}
            `;
        }
    }

    constructor() {
        super();
        this.button = null;
    }

    firstUpdated() {
        this.button = this.shadowRoot.querySelector('button');
        super.firstUpdated();

        this.list.classList.add('hidden');
        this.addEventListener('blur', this.dropup.bind(this));
    }

    onFocusChange(node) {
        if (this.multiple) return;

        this.button.textContent = node.textContent;
    }

    onButtonClick() {
        if (this.button.hasAttribute('aria-expanded')) {
            this.dropup();
        } else {
            this.dropdown();
        }
    }

    onButtonWheel(e) {
        if (Math.sign(e.deltaY) === -1) {
            this.focusPreviousItem(this.activeDescendant);
        } else {
            this.focusNextItem(this.activeDescendant);
        }
    }

    onButtonKeyup(e) {
        switch (e.code) {
            case keys.UP:
            case keys.DOWN:
                e.preventDefault();
                this.dropdown();
                this.onKeydown(e);
                break;
        }
    }

    dropdown() {
        this.list.classList.remove('hidden');
        this.button.setAttribute('aria-expanded', 'true');
        this.redirectFocus();
    }

    dropup() {
        this.list.classList.add('hidden');
        this.button.removeAttribute('aria-expanded');
        this.button.focus();
    }

    onKeydown(e) {
        super.onKeydown(e);
        switch (e.code) {
            case keys.RETURN:
            case keys.ESCAPE:
                e.preventDefault();
                this.dropup();
                break;
        }
    }
}

customElements.define('list-select', ListSelect);
