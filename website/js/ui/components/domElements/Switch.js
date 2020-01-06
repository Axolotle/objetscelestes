export class ButtonSwitch extends HTMLButtonElement {
    static get observedAttributes() {
        return ['aria-checked'];
    }

    connectedCallback() {
        this.setAttribute('role', 'switch');
        this.setAttribute('aria-checked', 'false');
        this.addEventListener('click', this.onclick);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const e = new CustomEvent('switch', { detail: newValue === 'true' });
        this.dispatchEvent(e);
    }

    onclick() {
        const checked = this.getAttribute('aria-checked') === 'true';
        if (checked) {
            this.setAttribute('aria-checked', 'false');
        } else {
            this.setAttribute('aria-checked', 'true');
        }
    }
}

customElements.define('button-switch', ButtonSwitch, {extends: 'button'});
