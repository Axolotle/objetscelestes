import { LitElement, html, css } from '../../../../../web_modules/lit-element.js';


export class DialogZone extends LitElement {
    static get styles() {
        return css`
            :host {
                display: block;
                contain: content;
                box-sizing: border-box;
            }

            :host(.hidden) {
                display: none !important;
            }
        `;
    }

    constructor() {
        super();
    }

    render() {
        return html`<slot></slot>`;
    }

    async displayDialog(templateId, callback) {
        const clone = document.importNode(
            document.getElementById(templateId).content, true
        ).firstElementChild;
        this.appendChild(clone);
        this.classList.remove('hidden');

        await clone.updateComplete;

        clone.activate().then(response => {
            if (response) callback(response);
            this.classList.add('hidden');
            this.removeChild(clone);
        });
    }
}

customElements.define('dialog-zone', DialogZone);
