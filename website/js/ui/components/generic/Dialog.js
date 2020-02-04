import { LitElement, html, css } from '../../../../../web_modules/lit-element.js';


export class DialogInput extends LitElement {
    static get properties() {
        return {};
    }

    static get styles() {
        return css`
            :host {
                display: block;
                /* contain: content; */
                box-sizing: border-box;
            }
            :host(.hidden) {
                display: none;
            }

            * {
                font: inherit;
                box-sizing: border-box;
            }
            *:focus {
                outline: 2px #ff00ff dashed;
            }
            *::-moz-focus-inner {
                border: 0;
            }

            [role="dialog"] {
                min-width: 20rem;
                max-width: 50vw;
            }
            [type=submit], #cancel {
                height: 2rem;
                line-height: 2rem;
                background-color: black;
                color: white;
                border: none;
            }
            button:active, input:active, #cancel:active {
                background-color: #ff00ff;
                color: black;
            }
        `;
    }

    constructor() {
        super();
    }

    render() {
        return html`
        <div role="dialog" aria-modal="true" aria-labelledby="dialog-label">
            <form @keyup=${this.onKeyup}>
                <slot id="dialog-label" name="title"></slot>
                <slot name="choice"></slot>
                <input type="submit" value="${this.dataset.submitmsg || 'SUBMIT'}">
                <button id="cancel">Cancel</button>
            </form>
        </div>
        `;
    }

    get FirstFocusable() {
        let firstFocusable = this.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!firstFocusable.length) {
            return this.shadowRoot.querySelector('[type=submit], #cancel');
        }
        return firstFocusable[0];
    }

    getData(elems) {
        const data = {
            submitted: this.shadowRoot.querySelector('[type=submit]').value
        };

        for (const elem of elems) {
            data[elem.name] = elem.value;
        }
        
        return data;
    }

    areValid(elems) {
        for (const elem of elems) {
            if (!elem.checkValidity()) return false;
        }
        return true;
    }

    activate() {
        this.FirstFocusable.focus();
        return new Promise((resolve, reject) => {
            this.shadowRoot.querySelector('form').addEventListener('submit', e => {
                e.preventDefault();
                if (e.explicitOriginalTarget.id === 'cancel') {
                    resolve(null);
                } else {
                    // since inputs or other dom nodes are in light dom, the form
                    // has no children, therefore it cannot check its validity on its own.
                    const elems = this.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    if (!this.areValid(elems)) return;
                    resolve(this.getData(elems));
                }
            });
        })
    }
}


customElements.define('dialog-input', DialogInput);
