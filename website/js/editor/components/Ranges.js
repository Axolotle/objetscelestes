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
    constructor(elem, interval, onChangeFunc) {
        this.original = elem.querySelector('input[type=range]');
        this.ghost = this.original.cloneNode();

        this.interval = interval;

        this.original.classList.add("original");
        this.ghost.classList.add("ghost");

        this.min = this.original.min;
        this.max = this.original.max;

        this.original.parentNode.insertBefore(this.ghost, this.original.nextSibling);
        
        this.onChange = onChangeFunc;
        
        this.original.addEventListener('input', this.render.bind(this), false);
        this.ghost.addEventListener('input', this.render.bind(this), false);
        this.original.addEventListener('mouseup', this.onChange, false);
        this.ghost.addEventListener('mouseup', this.onChange, false);
        this.ghost.addEventListener('mousedown', this.mousedown.bind(this), false);
    }

    get valueLow() { return Math.min(this.original.value, this.ghost.value); }
    set valueLow(value) { this.original.value = value; }

    get valueHigh() { return Math.max(this.original.value, this.ghost.value); }
    set valueHigh(value) { this.ghost.value = value; }
    
    get interval() { return [this.valueLow, this.valueHigh] }
    set interval(values) { 
        this.original.value = values[0] - 0.01;
        this.ghost.value = values[1] + 0.01;
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
    onChange() {}
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
    constructor(elem, interval, onChangeFunc) {
        super(elem, interval, onChangeFunc);
        this.minInput = elem.querySelector('.minRange');
        this.maxInput = elem.querySelector('.maxRange');

        this.minInput.value = interval[0] - 0.01;
        this.maxInput.value = interval[1] + 0.01;
        
        this.minInput.addEventListener('change', this.change.bind(this), false);
        this.maxInput.addEventListener('change', this.change.bind(this), false);
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
        this.valueLow = min > max ? max : min;
        this.valueHigh = max < min ? min : max;
        this.render();
        this.onChange();
    }
}

/**
 * Callback function to execute.
 * Can be any function and may receive an indefinite series of arguments.
 * @callback publish
 * @param {...*}
 */

export { IntervalRange, IntervalRangeNumber };
