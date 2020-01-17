import { LitElement, html, css } from '../../../../../web_modules/lit-element.js';

import { keys } from '../../../utilities/keys.js';
import { ListBox } from '../lists/Lists.js';


export class ListSelect extends LitElement {
    static get styles() {
        return css`
            :host {
                display: block;
                width: 100%;
            }

            button {
                box-sizing: border-box;
                position: relative;
                width: 100%;
                min-height: 2rem;
                padding: 0 calc(1rem - 2px);
                border: 2px black solid;
                background-color: black;
                color: white;
                font: inherit;
                text-align: left;
            }
            button:hover {
              border-color: #ff00ff;
              background: #ff00ff;
              color: black;
            }
            button:focus {
                border: 2px #ff00ff dashed;
                outline: none;
            }
            button::after {
                width: 0;
                height: 0;
                border-left: 1rem solid transparent;
                border-right: 1rem solid transparent;
                content: " ";
                position: absolute;
                z-index: 10;
                right: -2px;
            }
            button:not([aria-expanded])::after {
                border-top: 1rem solid white;
                top: -2px;
            }
            button[aria-expanded="true"]::after {
                border-bottom: 1rem solid white;
                bottom: -2px;
            }
            button::-moz-focus-inner {
                border: 0;
            }

            .hidden {
                display: none;
            }
        `;
    }

    constructor() {
        super();
    }

    render() {
        return html`
            <span id="exp_elem">${this.dataset.label}</span>
            <button name="button" id="exp_button"
                aria-haspopup="listbox" aria-labelledby="exp_elem exp_button"
                @click="${this.dropdown}" @keyup="${this.checkShow}"
                @mousedown="${this.onMousedown}"
            >
            </button>
            <slot></slot>
        `;
    }

    firstUpdated() {
        const list = this.querySelector('list-box');
        list.onFocusChange = this.onFocusChange.bind(this);
        list.classList.add('hidden');
        list.addEventListener('keydown', this.checkHide.bind(this));
        list.addEventListener('blur', this.dropup.bind(this));

        const defaultValue = list.activeDescendant;
        if (defaultValue) this.onFocusChange(defaultValue);
    }

    onFocusChange(node) {
        const button = this.shadowRoot.querySelector('button');
        button.textContent = node.textContent;
    }

    checkShow(e) {
        switch (e.code) {
            case keys.UP:
            case keys.DOWN:
                e.preventDefault();
                this.dropdown();
                this.querySelector('list-box').onKeydown(e);
                break;
        }
    }

    checkHide(e) {
        switch (e.code) {
            case keys.RETURN:
            case keys.ESCAPE:
                e.preventDefault();
                this.dropup();
                break;
        }
    }

    dropdown() {
        const list = this.querySelector('list-box');
        const button = this.shadowRoot.querySelector('button');

        list.classList.remove('hidden');
        button.setAttribute('aria-expanded', 'true');
        list.redirectFocus();
    }

    dropup() {
        const list = this.querySelector('list-box');
        const button = this.shadowRoot.querySelector('button');

        list.classList.add('hidden');
        button.removeAttribute('aria-expanded');
        button.focus();
    }

    addItem(item) {
        this.querySelector('list-box').addItem(item);
    }
}


customElements.define('list-select', ListSelect);
