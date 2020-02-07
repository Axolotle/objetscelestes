import { LitElement, html, css } from '../../../../../web_modules/lit-element.js';

import { greekAbbr, constName, starType } from '../../../misc/starDictionnary.js';


export class ObjectInfo extends LitElement {
    static get styles() {
        return css`
            :host {
                display: block;
                box-sizing: border-box;
                background-color: black;
            }
            :host(.hidden) {
                display: none;
            }
            * {
                box-sizing: border-box;
                font: inherit;
                margin: 0;
                padding: 0;
                line-height: 1.5rem;
            }

            h2 {
                margin: 0;
            }
            #sub h2 {
                padding: 0 1.5rem;

            }
            #main h2 {
                font-size: 150%;
                font-weight: bold;
            }

            .bar {
                background-color: white;
                color: black;
                padding: 1rem 1.5rem;
                margin-top: .75rem;
            }
            .bar p {
                margin: 0;
            }

            sup {
                position: relative;
                bottom: .2rem;
                margin-left: 0.1rem;
                font-size: 80% !important;
                line-height: 0;
            }

            dl .container:not(:last-of-type) {
                margin-bottom: 1rem;
            }
            #main > dl {
                padding: 1.5rem;
                padding-right: 4rem;
                position: relative;
            }

            dt, dd {
                display: inline;
                line-height: 1.5rem;
            }

            dt {
                color: #c1c1c1;
            }
            dt:after {
                content: ' :';
            }

            .highlight {
                color: white;
            }

            #help {
                position: absolute;
                display: block;
                cursor: pointer;
                width: 2rem;
                height: 2rem;
                top: 1rem;
                right: 1rem;
                background-color: blue;
                line-height: 2rem;
                font-size: inherit;
                font-weight: bold;
                text-align: center;
                border-radius: 50%;
            }

            #link {
                position: absolute;
                height: 1.5rem;
                line-height: 1.5rem;
                background-color: black;
                color: white;
                padding: 0 1rem;
            }
            #help:hover, #link:hover {
                background-color: #ff00ff;
                color: black;
            }

            .hidden {
                display: none;
            }
        `;
    }

    render() {
        return html`
        <article id="sub" class="hidden">
            <h2>${this.name}</h2>
        </article>
        <article id="main">
            <div class="bar">
                <h2>${this.name}</h2>
                <p>Constellation : <span>${this.constellation}</span></p>
            </div>
            <dl>
                <div class="container">
                    <dt>ICRS Coordinates (epoch J2000)</dt>
                    <dd>
                        <dl>
                            <div>
                                <dt>Right ascension</dt>
                                <dd class="highlight">
                                    ${this.asc[0]}<sup aria-label="hours">h</sup>
                                    ${this.asc[1]}<sup aria-label="minutes">m</sup>
                                    ${this.asc[2]}<sup aria-label="seconds">s</sup>
                                </dd>
                            </div>
                            <div>
                                <dt>Declination</dt>
                                <dd class="highlight">
                                    ${this.dec[0]}<span aria-label="degrees">°</span>
                                    ${this.dec[1]}<span aria-label="minutes">'</span>
                                    ${this.dec[2]}<span aria-label="seconds">"</span>
                                </dd>
                            </div>
                        </dl>
                    </dd>
                </div>

                <div class="container">
                    <dt>Distance from Solar System</dt>
                    <dd class="highlight">${this.sysSolDistance} pc</dd>
                </div>

                <div class="container">
                    <dt>Apparent magnitude</dt>
                    <dd class="highlight">${this.magnitude}</dd>
                </div>

                <div class="container">
                    <dt>Type</dt>
                    <dd class="highlight">${this.starType}</dd>
                </div>
                <span id="help">?</span>
            </dl>

            <a id="link" href="http://simbad.u-strasbg.fr/simbad/sim-id?Ident=${this.ref}" target="_blank">More info about the object</a>
        </article>
        `;
    }

    constructor() {
        super();
        this.name = '';
        this.constellation = '';
        this.asc = ['', '', ''];
        this.dec = ['', '', ''];
        this.sysSolDistance = '';
        this.magnitude = '';
        this.starType = '';
        this.ref = '';
    }

    firstUpdated() {
        this.main = this.shadowRoot.querySelector('#main');
        this.sub = this.shadowRoot.querySelector('#sub');
        this.visible = false;
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

    updateContent(data) {
        const [name, extraname] = ObjectInfo.parseName(data.name, data.ids);

        this.name = name + extraname;
        this.constellation = constName[extraname.slice(-3)];
        this.asc = data.ra.split(' ');
        this.dec = data.dec.split(' ');
        this.sysSolDistance = data.dist.value.toFixed(2);
        this.magnitude = data.vmag.toFixed(2);
        this.starType = starType[data.type];
        this.ref = data.name;

        this.requestUpdate();
    }

    switchDisplayStyle() {
        this.main.classList.toggle('hidden');
        this.sub.classList.toggle('hidden');
    }

    static parseName(baseName, ids) {
        let name = '';
        if (ids.includes('NAME')) {
            let i = ids.indexOf('NAME') + 5;
            name = ids.slice(i, ids.indexOf('|', i)) + ' — ';
        }
        let extraname = baseName.replace('*', '').trim();
        let greek = extraname.substring(0, 3);
        if (greek in greekAbbr) {
            extraname = extraname.replace(greek, greekAbbr[greek]);
        }
        return [name, extraname];
    }
}

customElements.define('object-info', ObjectInfo);
