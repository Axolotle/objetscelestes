import { Observatoire } from './observatoire/Observatoire.js';
import Ui from './editor/Ui.js';
import { IntervalRangeNumber } from './editor/components/index.js';


let sw = false;

// Register service worker to control making site work offline
if (sw && 'serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('serviceWorker.js')
    .then(function() { console.log('Service Worker Registered'); });
}

window.onload = async () => {
    let obs = new Observatoire();
    let ui = new Ui(document.getElementById('canvas'));
    
    initUiComponents(ui);
    
    let data = await getJSON('data/UMa.json');
    obs.init({stars: data, grid: true, cameraDistance: 10});
};

function initUiComponents(ui) {
    let magnitudeRange = new IntervalRangeNumber(
        document.getElementById('starMag'),
        [1.76, 3.31],
        () => { ui.publish('starMag-change', magnitudeRange.interval);}
    );
}

function getJSON(uri) {
	return fetch(uri).then(response => response.json());
}
