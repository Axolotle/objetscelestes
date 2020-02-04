import { LitElement, html, css } from '../../../../../web_modules/lit-element.js';

import { keys } from '../../../utilities/keys.js';


export class ListBox extends LitElement {
    static get properties() {
        return {
            multiple: { type: Boolean},
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

            ul[role=listbox] {
                position: relative;
                overflow-y: auto;
                width: 100%;
                max-height: var(--max-height, 100%);
                padding: 0;
                margin: 0;
                background-color: black;
            }

            li {
                padding: 0;
                min-height: 23px;
            }

            li[role=option] {
                position: relative;
                padding-left: 1rem;
                line-height: 23px;
            }
            .focused {
                background-color: #ff00ff;
                color: black;
            }
            ul[role=listbox]:not([aria-multiselectable]) li[aria-selected=true] {
                background-color: #ff00ff;
            }

            ul[aria-multiselectable] li[role=option] {
                padding-left: 2rem;
            }
            ul[aria-multiselectable] li[role=option]::before {
                content: '';
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

            ul[aria-multiselectable] li.focused::before {
                background-color:#ff00ff;
            }

            ul[aria-multiselectable] li[aria-selected=true]::before {
                background-color: #ff00ff;
            }
            ul[aria-multiselectable] li[aria-selected=true].focused::before {
                background-color: white;
            }

            ul[role=group] {
                padding: 0;
                margin: 0;
            }
            ul[role=group]::before {
                content: attr(aria-label);
                display: block;
                width: calc(100% - 3.5rem);
                background-color: white;
                color: grey;
                min-height: 23px;
                line-height: 23px;
                padding: 0 1rem;
            }
            ul[role=group] li:first-child::after {
                content: ' ';
                position: absolute;
                top: -23px;
                right: 0;
                width: 0;
                border-left: 23px solid white;
                border-top: 23px solid transparent;
                height: 0;
            }

            /* add a dashed line to separate group from ungrouped li */
            li:not([role=option]) + li[role=option] {
                margin-top: 2px;
            }
            li:not([role=option]) + li[role=option]::after {
                content: '';
                display: block;
                position: relative;
                top: calc(-1.5rem - 2px);
                left: -2rem;
                border-top: 2px dashed white;
                width: calc(100% + 2rem);
            }
        `;
    }

    get activeDescendant() {
        if (this._activeDescendantId) {
            return this.shadowRoot.querySelector('#' + this._activeDescendantId);
        } else {
            return null;
        }
    }
    set activeDescendant(id) {
        this._activeDescendantId = id;
        this.list.setAttribute('aria-activedescendant', id);
    }

    constructor() {
        super();
        this._activeDescendantId = null;
        this.list = null;

        const multiple = this.getAttribute('multiple');
        this.multiple = multiple !== null && multiple !== 'false';

        this.addEventListener('focus', this.redirectFocus.bind(this));
    }

    render() {
        return html`
        <ul role="listbox" tabindex="0"
            aria-labelledby="exp_elem" ?aria-multiselectable="${this.multiple}"
            @click="${this.onClick}" @mousedown="${this.onMousedown}"
            @keydown="${this.onKeydown}" @focus="${this.onUlFocus}"
        >
        </ul>
        `;
    }

    firstUpdated() {
        this.list = this.shadowRoot.querySelector('[role=listbox]');
        const l = this.children.length;
        for (let i = 0; i < l; i++) {
            this.list.appendChild(this.children[0]);
        }

        const defaultValue = this.shadowRoot.querySelector('[role=option][aria-selected]');
        if (defaultValue) {
            this.focusItem(defaultValue);
        }
    }

    /**
    * Redirect the custom element's focus to the [role=listbox] element.
    */
    redirectFocus() {
        this.list.focus();
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
            this.list.focus();
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
        const elem = this.activeDescendant;
        if (!elem) return;

        switch (key) {
            case keys.UP:
                e.preventDefault();
                this.focusPreviousItem(elem);
                break;
            case keys.DOWN:
                e.preventDefault();
                this.focusNextItem(elem);
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
                this.toggleSelectItem(elem);
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
        const detail = Array.isArray(nodes) ? {elems: nodes} : {elem: nodes};
        const ev = new CustomEvent('change', {detail});
        this.dispatchEvent(ev);
    }

    /**
    * Focus on the first option
    */
    focusFirstItem() {
        const firstElem = this.shadowRoot.querySelector('[role=option]');
        if (firstElem) this.focusItem(firstElem);
    }

    /**
    * Focus on the last option
    */
    focusLastItem() {
        let lastElem = this.list.lastElementChild;
        if (lastElem && lastElem.getAttribute('role') !== 'option') {
            lastElem = lastElem.querySelector('[role=option]:last-of-type');
        }
        if (lastElem) this.focusItem(lastElem);
    }

    focusNextItem(elem) {
        let nextElem = elem.nextElementSibling;
        if (nextElem && nextElem.getAttribute('role') !== 'option') {
            nextElem = nextElem.querySelector('[role=option]');
        } else if (!nextElem && elem.parentElement.getAttribute('role') === 'group') {
            nextElem = elem.parentElement.parentElement.nextElementSibling;
        }
        if (nextElem && nextElem.getAttribute('role') !== 'option') {
            nextElem = nextElem.querySelector('[role=option]');
        }
        if (nextElem) this.focusItem(nextElem);
    }

    focusPreviousItem(elem) {
        let prevElem = elem.previousElementSibling;
        if (prevElem && prevElem.getAttribute('role') !== 'option') {
            prevElem = prevElem.querySelector('[role=option]:last-of-type');
        } else if (!prevElem && elem.parentElement.getAttribute('role') === 'group') {
            prevElem = elem.parentElement.parentElement.previousElementSibling;
        }
        if (prevElem && prevElem.getAttribute('role') !== 'option') {
            prevElem = prevElem.querySelector('[role=option]:last-of-type');
        }
        if (prevElem) {
            this.focusItem(prevElem);
        }
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
            this.selectChange(elem);
        }
        elem.classList.add('focused');
        this.activeDescendant = elem.id;

        const list = this.list;
        if (list.scrollHeight > list.clientHeight) {
            const scrollBottom = list.clientHeight + list.scrollTop;
            const elemBottom = elem.offsetTop + elem.offsetHeight;
            if (elemBottom > scrollBottom) {
                list.scrollTop = elemBottom - list.clientHeight;
            }
            else if (elem.offsetTop < list.scrollTop) {
                list.scrollTop = elem.offsetTop;
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
            this.selectChange(this.shadowRoot.querySelectorAll('[role=option]'));
        }
    }

    addItem({value, id, group}) {
        const elem = document.createElement('li');
        elem.setAttribute('role', 'option');
        elem.setAttribute('id', id);
        elem.textContent = value;
        const container = group ? this.list.querySelector('#' + group) : this.list;
        container.appendChild(elem);
        
        return elem;
    }
}


customElements.define('list-box', ListBox);
