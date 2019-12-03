import { Observatoire } from './observatoire/Observatoire.js';
import { Ui } from './editor/Ui.js';


let sw = false;

// Register service worker to control making site work offline
if (sw && 'serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('serviceWorker.js')
    .then(function() { console.log('Service Worker Registered'); });
}

window.onload = async () => {
    let obs = new Observatoire();
    let data = await getJSON('data/UMa.json');
    obs.init({stars: data, grid: true, cameraDistance: 0});

    let ui = new Ui(document.getElementById('canvas'));
    initUiComponents(ui);
    let editor;
};

function initUiComponents(ui) {
    let magn = ui.add('IntervalRangeNumber', document.getElementById('magnitude'), [1.75, 3.32]);
    magn.onChange = () => { ui.publish('magnitude-change', magn.interval); };
}

function getJSON(uri) {
	return fetch(uri).then(response => response.json());
}
