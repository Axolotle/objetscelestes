export class Options {
    constructor() {
        this.drawElem = document.getElementById('drawMode');
        this.targetElem = document.getElementById('targetMode');
    }

    get drawMode () {
        return this.drawElem.checked;
    }

    get targetMode () {
        return this.targetElem.checked;
    }
}
