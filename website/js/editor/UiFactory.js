import { IntervalRange, IntervalRangeNumber } from './components/Ranges.js'

const UiFactory = {

    _registeredTypes: new Map([
        ['IntervalRange', IntervalRange],
        ['IntervalRangeNumber', IntervalRangeNumber]
    ]),

    register(clsName, cls) {
        if (!UiFactory._registeredTypes.has(clsName)) {
            UiFactory._registeredTypes.set(clsName, cls);
        } else {
            console.warn(`${clsName} is already registered.`)
        }
    },

    create(clsName, elem, params) {
        if (!UiFactory._registeredTypes.has(clsName)) {
            console.error(`${clsName} is not registered, can't create instance of ${clsName}.`);
            return null;
        }
        let cls = this._registeredTypes.get(clsName);
        return new cls(elem, params);
    }
}

export { UiFactory as default };
