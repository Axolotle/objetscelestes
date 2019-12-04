import { events } from './EventManager.js';


/** Helper class to handle events. */
export class Subscriber {
    /**
     * Setup events handling.
     */
    constructor() {
        this._eIds = {};
    }

    /**
     * Helper method to subscribe to an event.
     * @param {string} eventName - a string stating the event.
     * @param {func} func - a callback function to execute when event is triggered.
     */
    subscribe(eventName, func) {
        this._eIds[eventName] = events.subscribe(eventName, func.bind(this));
    }

    /**
     * Helper method to unsubscribe to an event.
     * @param {string} eventName - a string stating the event.
     */
    unsubscribe(eventName) {
        events.unsubscribe(eventName, this._eIds[eventName]);
    }

    /**
     * Helper method to publish an event.
     * @param {string} eventName - a string stating the event.
     * @param {...*} args - an indifinite number of arguments to pass to the callback functions.
     */
    publish(eventName, ...args) {
        events.publish(eventName, ...args);
    }

    hasEvent(eventName) {
        return this._eIds.hasOwnProperty(eventName);
    }
}

/**
 * Callback function to execute.
 * Can be any function and may receive an indefinite series of arguments.
 * @callback func
 * @param {...*}
 */
