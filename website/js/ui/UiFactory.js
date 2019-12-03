import * as components from './components/index.js';


const registeredTypes = new Map();

for (let name in components) {
    registeredTypes.set(name, components[name])
}

export const UiFactory = {
    register(clsName, cls) {
        if (!registeredTypes.has(clsName)) {
            registeredTypes.set(clsName, cls);
        } else {
            console.warn(`${clsName} is already registered.`)
        }
    },

    create(clsName, elem, params) {
        if (!registeredTypes.has(clsName)) {
            console.error(`${clsName} is not registered, can't create instance of ${clsName}.`);
            return null;
        }
        let cls = registeredTypes.get(clsName);
        return new cls(elem, params);
    }
}
