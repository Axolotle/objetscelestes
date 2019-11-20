import { Observatoire } from './observatoire/Observatoire.js';


let sw = true;

// Register service worker to control making site work offline
if (sw && 'serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('serviceWorker.js')
    .then(function() { console.log('Service Worker Registered'); });
}

window.onload = async () => {
    let obs = new Observatoire();
    let data = await getJSON('data/UMa.json');
    obs.init(data, 10);
};


function getJSON(uri) {
	return fetch(uri).then(response => response.json());
}
