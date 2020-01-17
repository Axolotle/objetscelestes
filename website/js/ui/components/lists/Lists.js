import { LitElement, html, css } from '../../../../../web_modules/lit-element.js';

import { keys } from '../../../utilities/keys.js';


export class ListBox extends LitElement {
    static get properties() {
        return {
            multiple: { type: Boolean },
        };
    }

    static get styles() {
        return css`
            :host {
                display: block;
                width: 100%;
                box-sizing: border-box;
                position: relative;
                max-height: 8rem;
                overflow-y: auto;
            }

            ul {
                width: 100%;
                background-color: black;
                padding: 0;
                margin: 0;
            }

            ::slotted(li) {
                position: relative;
                min-height: 1.5rem;
                padding: 0 1rem !important;
                line-height: 1.5rem !important;
            }
            ::slotted(.focused) {
                background-color: #ff00ff;
            }
            :not([aria-multiselectable="true"]) ::slotted(li[aria-selected='true']) {
                background-color: #ff00ff;
            }

            [aria-multiselectable="true"] ::slotted(li) {
                padding: 0 1.75rem !important;
            }
            [aria-multiselectable="true"] ::slotted(li)::before {
                content: ' ';
                margin-right: 1.5rem;
                box-sizing: border-box;
                display: inline-block;
                width: 1rem;
                height: 1rem;
                position: absolute;
                top: .25rem;
                left: .5rem;
                border-radius: 100%;
                background-color: black;
            }

            [aria-multiselectable="true"] ::slotted(.focused)::before {
                background-color:#ff00ff;
            }

            [aria-multiselectable="true"] ::slotted(li[aria-selected='true'])::before {
                background-color: #ff00ff;
            }
            [aria-multiselectable="true"] ::slotted(li[aria-selected='true'].focused)::before {
                background-color: white;
            }
        `;
    }

    get activeDescendant() {
        if (this._activeDescendentId) {
            return this.querySelector('#' + this._activeDescendentId);
        } else {
            return null;
        }
    }
    set activeDescendant(id) {
        this._activeDescendentId = id;
        this.shadowRoot.querySelector('ul').setAttribute('aria-activedescendant', id);
    }

    constructor() {
        super();
        this._activeDescendantId = null;
        const multiple = this.getAttribute('multiple');
        this.multiple = multiple !== null && multiple !== 'false';
        this.addEventListener('focus', this.redirectFocus.bind(this));
    }

    render() {
        return html`
            <ul role="listbox" tabindex="0"
                aria-labelledby="exp_elem" aria-multiselectable="${this.multiple}"
                @click="${this.onClick}" @mousedown="${this.onMousedown}"
                @keydown="${this.onKeydown}" @focus="${this.onUlFocus}"
            >
                <slot></slot>
            </ul>
        `;
    }

    firstUpdated() {
        const defaultValue = this.querySelector('li[aria-selected]');
        if (defaultValue) {
            this.focusItem(defaultValue);
        }
    }

    /**
    * Redirect the custom element's focus to the [role=listbox] element.
    */
    redirectFocus() {
        this.shadowRoot.querySelector('ul').focus();
        this.onFocus();
    }

    /**
    * If there is no activeDescendant, focus on the first option.
    */
    onFocus() {
        if (this.activeDescendant) return;
        this.focusFirstItem();
    }

    /**
    * Avoid bubbling of focus that would retrigger focus event.
    * @param {Event} e - The focus event object
    */
    onUlFocus(e) {
        e.stopImmediatePropagation();
    }

    /**
    * Check if an item is clicked on. If so, focus on it and select it.
    * @param {Event} e - The click event object
    */
    onClick(e) {
        if (e.target.getAttribute('role') === 'option') {
            this.focusItem(e.target);
            this.toggleSelectItem(e.target);
        }
    }

    /**
    * Check if custom element is actually focused and avoid unecessary focus
    * event to trigger.
    * @param {Event} e - The mousedown event object
    */
    onMousedown(e) {
        e.stopImmediatePropagation();
        if (document.activeElement != this) {
            this.shadowRoot.querySelector('ul').focus();
        } else {
            e.preventDefault();  //stops default browser action (focus)
        }
    }

    /**
    * Handle various keyboard controls; UP/DOWN will shift focus; SPACE selects
    * an item.
    * @param {Event} e - The keydown event object
    */
    onKeydown(e) {
        const key = e.code;
        let nextElem = this.activeDescendant;
        if (!nextElem) return;

        switch (key) {
            case keys.UP:
            case keys.DOWN:
                e.preventDefault();
                if (key === keys.UP) {
                    nextElem = nextElem.previousElementSibling;
                } else {
                    nextElem = nextElem.nextElementSibling;
                }
                if (nextElem) this.focusItem(nextElem);
                break;
            case keys.HOME:
                e.preventDefault();
                this.focusFirstItem();
                break;
            case keys.END:
                e.preventDefault();
                this.focusLastItem();
                break;
            case keys.SPACE:
                e.preventDefault();
                this.toggleSelectItem(nextElem);
                break;
        }
    }

    onFocusChange() {

    }

    /**
    * Triggers a custom event 'select-change' with list of selected element.
    * @param {Array} nodes - an array of selected nodes
    */
    selectChange(nodes) {
        const ev = new CustomEvent('select-change', {
            bubbles: true,
            detail: {elems: nodes}
        });
        this.dispatchEvent(ev);
    }

    /**
    * Focus on the first option
    */
    focusFirstItem() {
        const firstElem = this.querySelector('[role="option"]');
        if (firstElem) this.focusItem(firstElem);
    }

    /**
    * Focus on the last option
    */
    focusLastItem() {
        const lastElem = this.querySelector('[role="option"]:last-of-type');
        if (lastElem) this.focusItem(lastElem);
    }

    /**
    * Focus on the specified item
    * @param {HTMLElement} elem - The element to focus
    */
    focusItem(elem) {
        if (this.activeDescendant) {
            this.defocusItem(this.activeDescendant);
        }
        if (!this.multiple) {
            elem.setAttribute('aria-selected', 'true');
            this.selectChange([elem]);
        }
        elem.classList.add('focused');
        this.activeDescendant = elem.id;

        if (this.scrollHeight > this.clientHeight) {
            const scrollBottom = this.clientHeight + this.scrollTop;
            const elemBottom = elem.offsetTop + elem.offsetHeight;
            if (elemBottom > scrollBottom) {
                this.scrollTop = elemBottom - this.clientHeight;
            }
            else if (elem.offsetTop < this.scrollTop) {
                this.scrollTop = elem.offsetTop;
            }
        }

        this.onFocusChange(elem);
    }

    /**
    * Defocus the specified item
    * @param {HTMLElement} elem - The element to defocus
    */
    defocusItem(elem) {
        if (!elem) return;
        if (!this.multiple) {
            elem.removeAttribute('aria-selected');
        }
        elem.classList.remove('focused');
    }

    /**
    * Toggle the aria-selected value
    * @param {HTMLElement} elem - The element to select
    */
    toggleSelectItem(elem) {
        if (this.multiple) {
            elem.setAttribute(
                'aria-selected',
                elem.getAttribute('aria-selected') === 'true' ? 'false' : 'true'
            );
            this.selectChange(this.querySelectorAll('[aria-selected=true]'));
        }
    }

    addItem({content, id}) {
        const elem = document.createElement('li');
        elem.setAttribute('role', 'option');
        elem.setAttribute('id', id);
        elem.textContent = content;
        this.appendChild(elem);
    }
}

customElements.define('list-box', ListBox);
