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
        `;
    }

    render() {
        return html`<slot></slot>`;
    }

    constructor() {
        super();
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
        const actualElems = this.querySelectorAll('span');
        let len = actualElems.length > elems.length ? actualElems.length : elems.length;
        let documentFragment = document.createDocumentFragment();

        for (let i = 0; i < len; i++) {
            if (actualElems[i] && elems[i]) {
                actualElems[i].textContent = elems[i].text;
                actualElems[i].style.transform = elems[i].transform;
            } else if (!actualElems[i]){
                const elem = document.createElement('span');
                elem.textContent = elems[i].text;
                elem.style.transform = elems[i].transform;
                documentFragment.appendChild(elem);
            } else if (!elems[i]) {
                actualElems[i].remove()
            }
        }
        if (documentFragment.children.length) {
            this.appendChild(documentFragment);
        }
    }


}

customElements.define('floating-labels', FloatingLabels);
