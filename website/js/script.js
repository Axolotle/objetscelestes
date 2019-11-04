import { Observatoire } from './observatoire/Observatoire.js';


window.onload = async () => {
    var obs = new Observatoire();
    var data = await getJSON('data/UMa.json');
    obs.init(data, 0.001)
};

function getJSON(uri) {
	return fetch(uri).then(response => response.json());
}
