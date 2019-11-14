export class Options {
    constructor() {
        this.drawElem = document.getElementById('drawMode');
        this.targetElem = document.getElementById('targetMode');
    }
    
    init (stars) {
        this.initRange(document.querySelector('.starRange'), stars);
    }
    
    // modified version of https://github.com/leaverou/multirange by Lea Verou (MIT License)
    initRange (input, stars) {
        var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
        var values = stars.minMaxMag;
        var min = +(input.min || 0);
        var max = +(input.max || 6.5);
        var ghost = input.cloneNode();
        
        input.classList.add("multirange", "original");
        ghost.classList.add("multirange", "ghost");
        
        input.value = values[0] - 0.01;
        ghost.value = values[1] + 0.01;
        
        input.parentNode.insertBefore(ghost, input.nextSibling);
        
        Object.defineProperty(input, "originalValue", descriptor.get ? descriptor : {
            // Fuck you Safari >:(
            get: function() { return this.value; },
            set: function(v) { this.value = v; }
        });
        
        Object.defineProperties(input, {
            valueLow: {
                get: function() { return Math.min(this.originalValue, ghost.value); },
                set: function(v) { this.originalValue = v; },
                enumerable: true
            },
            valueHigh: {
                get: function() { return Math.max(this.originalValue, ghost.value); },
                set: function(v) { ghost.value = v; },
                enumerable: true
            }
        });
        
        if (descriptor.get) {
            // Again, fuck you Safari
            Object.defineProperty(input, "value", {
                get: function() { return this.valueLow + "," + this.valueHigh; },
                set: function(v) {
                    var values = v.split(",");
                    this.valueLow = values[0];
                    this.valueHigh = values[1];
                    update();
                },
                enumerable: true
            });
        }
        
        if (typeof input.oninput === "function") {
            ghost.oninput = input.oninput.bind(input);
        }
        
        function update() {
            ghost.style.setProperty("--low", 100 * ((input.valueLow - min) / (max - min)) + 1 + "%");
            ghost.style.setProperty("--high", 100 * ((input.valueHigh - min) / (max - min)) - 1 + "%");
        }
        
        function end() {
            stars.updateDrawRange(input.valueLow, input.valueHigh);
        }
        
        ghost.addEventListener("mousedown", function passClick(evt) {
            // Find the horizontal position that was clicked
            let clickValue = min + (max - min)*evt.offsetX / this.offsetWidth;
            let middleValue = (input.valueHigh + input.valueLow)/2;
            if ( (input.valueLow == ghost.value) == (clickValue > middleValue) ) {
                // Click is closer to input element and we swap thumbs
                input.value = ghost.value;
            }
        });
        input.addEventListener("input", update);
        ghost.addEventListener("input", update);
        input.addEventListener("mouseup", end);
        ghost.addEventListener("mouseup", end);
        
        update();
    }
    
    get drawMode () {
        return this.drawElem.checked;
    }
    
    get targetMode () {
        return this.targetElem.checked;
    }
    
    
}
