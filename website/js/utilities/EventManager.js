import { getGuid } from './utils.js';

/** Implementation of a PubSub class. */
export const events = {
    /** Setup events object. */
    events: {},

    /**
     * Publish an event by executing every functions attached to this event with
     * given arguments.
     * @param {string} eventName - a string stating the event.
     * @param {...*} args - indefinite series of arguments of any type.
     */
    publish (eventName, ...args) {
        if (!this.events[eventName]) return false;
        for (const subscriber of this.events[eventName]) {
            subscriber.fn(...args);
        }
    },

    /**
     * Subscribe to a event and define the function to execute.
     * @param {string} eventName - a string stating the event.
     * @param {fn} fn - a callback function to execute when event is triggered.

     * @return {string} the GUID attached to the callback function.
     */
    subscribe (eventName, fn) {
        if (!this.events[eventName]) this.events[eventName] = [];
        const id = getGuid();
        this.events[eventName].push({fn, id});
        return id;
    },

    /**
     * Delete the event and its callback.
     * @param {string} eventName - a string stating the event.
     * @param {string} id - the GUID attached to the callback function.
     */
    unsubscribe (eventName, id) {
        const e = this.events[eventName];
        if (!e) return false;
        for (let i = 0, l = e.length; i < l; i++) {
            if (e[i].id === id) e.splice(i, 1);
            return true;
        }
        return false;
    }
}
