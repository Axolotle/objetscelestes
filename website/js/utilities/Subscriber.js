import events from './EventManager.js';

/** Helper class to handle events. */
class Subscriber {
    /**
     * Setup events handling.
     * @param {EventManager} events - an EventManager instance.
     */
    constructor() {
        this.events = events;
        this.eIds = {};
    }

    /**
     * Helper method to subscribe to an event.
     * @param {string} eventName - a string stating the event.
     * @param {func} func - a callback function to execute when event is triggered.
     */
    subscribe(eventName, func) {
        this.eIds[eventName] = this.events.subscribe(eventName, func.bind(this));
    }

    /**
     * Helper method to unsubscribe to an event.
     * @param {string} eventName - a string stating the event.
     */
    unsubscribe(eventName) {
        this.events.unsubscribe(eventName, this.eIds[eventName]);
    }

    /**
     * Helper method to publish an event.
     * @param {string} eventName - a string stating the event.
     * @param {...*} args - an indifinite number of arguments to pass to the callback functions.
     */
    publish(eventName, ...args) {
        this.events.publish(eventName, ...args);
    }
}

/**
 * Callback function to execute.
 * Can be any function and may receive an indefinite series of arguments.
 * @callback func
 * @param {...*}
 */

export { Subscriber as default };
