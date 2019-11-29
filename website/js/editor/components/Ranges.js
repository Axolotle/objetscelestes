/**
 * Implementation of a custom range composed of 2 ranges inputs.
 * It allows selection of an interval.
 */
class IntervalRange {
    // some code have been taken from https://github.com/leaverou/multirange by Lea Verou (MIT License)
    /**
     * @param {Object} elem - an DOM object containing an input[type=range].
     * @param {Array} interval - Initial values of the interval.
     */
    constructor(elem, interval) {
        this.original = elem.querySelector('input[type=range]');
        this.ghost = this.original.cloneNode();

        this.min = this.original.min;
        this.max = this.original.max;

        this.valueLow = interval ? interval[0] : this.min;
        this.valueHigh = interval ? interval[1] : this.max;

        this.original.classList.add("original");
        this.ghost.classList.add("ghost");

        this.original.parentNode.insertBefore(this.ghost, this.original.nextSibling);

        this.original.addEventListener('input', this.render.bind(this), false);
        this.ghost.addEventListener('input', this.render.bind(this), false);
        this.original.addEventListener('mouseup', () => {this.onChange()}, false);
        this.ghost.addEventListener('mouseup', () => {this.onChange()}, false);
        this.ghost.addEventListener('mousedown', this.mousedown.bind(this), false);

        if (this.__proto__.constructor.name === 'IntervalRange') this.render();
    }

    get valueLow() { return Math.min(this.original.value, this.ghost.value); }
    set valueLow(value) { this.original.value = value; }

    get valueHigh() { return Math.max(this.original.value, this.ghost.value); }
    set valueHigh(value) { this.ghost.value = value; }

    get interval() { return [this.valueLow, this.valueHigh] }
    set interval(values) {
        this.original.value = values[0];
        this.ghost.value = values[1];
        this.render();
    }

    /** Change the style of the range accordingly. */
    render() {
        this.ghost.style.setProperty(
            "--low",
            100 * ((this.valueLow - this.min) / (this.max - this.min)) + 1 + "%"
        );
        this.ghost.style.setProperty(
            "--high",
            100 * ((this.valueHigh - this.min) / (this.max - this.min)) - 1 + "%"
        );
    }

    /**
     * On mousedown check which thumb is closest to click zone.
     * @param {Object} e - an DOM event object from input[type=range].
     */
    mousedown(e) {
        // Find the horizontal position that was clicked
        let clickValue = this.min + (this.max - this.min) * e.offsetX / this.ghost.offsetWidth;
        let middleValue = (this.valueHigh + this.valueLow)/2;
        if ( (this.valueLow == this.ghost.value) == (clickValue > middleValue) ) {
            // Click is closer to input element and we swap thumbs
            this.original.value = this.ghost.value;
        }
    }

    /**
     * onChange function set by the Ui editor and used to publish changes.
     */
    onChange() { }
}


/**
 * Implementation of a custom range composed of 2 inputs[type=range] and 2 others
 * inputs[type=number] to display and modify the IntervalRange values.
 * It allows selection of an interval.
 */
class IntervalRangeNumber extends IntervalRange {
    /**
     * @param {Object} elem - an DOM object containing an input[type=range].
     * @param {Array} interval - Initial values of the interval.
     */
    constructor(elem, interval) {
        super(elem, interval);
        this.minInput = elem.querySelector('.minRange');
        this.maxInput = elem.querySelector('.maxRange');

        this.minInput.value = this.valueLow;
        this.maxInput.value = this.valueHigh;

        this.minInput.addEventListener('change', this.change.bind(this), false);
        this.maxInput.addEventListener('change', this.change.bind(this), false);
        this.render();
    }

    /** Change the style of the range accordingly and update inputs[type=number] values. */
    render() {
        super.render();
        this.minInput.value = this.valueLow;
        this.maxInput.value = this.valueHigh;
    }

    /**
     * On input[type=number] changes reset high and low values.
     * @param {Object} e - an DOM event object from inputs[type=number].
     */
    change(e) {
        if (e.target.validity.badInput) return;
        let min = this.minInput.value;
        let max = this.maxInput.value;
        this.interval = [min, max]
        this.onChange();
    }
}


export { IntervalRange, IntervalRangeNumber };
