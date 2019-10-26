
window.onload = async () => {
    var obs = new Observatoire();
    var data = await getJSON('data/UMa.json');
    obs.init(data)
};

function getJSON(uri) {
	return fetch(uri).then(response => response.json());
}
