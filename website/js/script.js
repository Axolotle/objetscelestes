// import { initComponents } from './ui/index.js';
import { Observatoire } from './observatoire/Observatoire.js';
// import { Ui } from './ui/Ui.js';
import { Editor } from './editor/Editor.js';
import { UiFactory } from './ui/UiFactory.js';
import { SkyMap } from './objects3d/SkyMap.js';



let sw = false;

// Register service worker to control making site work offline
if (sw && 'serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('serviceWorker.js')
    .then(function() { console.log('Service Worker Registered'); });
}

window.onload = async () => {
    let canvas = document.getElementById('canvas');
    let data = await getJSON('data/UMa.json');
    let obs = new Observatoire(data, {target: [0, 0, 0]}, canvas);

    let editor = new Editor(obs.scene, obs.cameraCtrl, obs.starsCtrl, canvas);

    document.getElementById('dollyMode').addEventListener('switch', (e) => obs.cameraCtrl.switchMode(e.detail));
    document.getElementById('drawMode').addEventListener('switch', (e) => editor.drawMode = e.detail);
    canvas.addEventListener('leftclick', (e) => editor.onclick(e.detail));
    canvas.addEventListener('rightclick', () => editor.onrightclick());

    let testList = document.querySelector('#test');
    testList.addEventListener('select-change', (e) => {
        console.log('select-change', e.detail);
    });

    testList.addItem({content: 'coucou', id: 'coucouc'})

    let testMap = SkyMap.hydrate({
        name: 'to',
        asterisms: [
            {
                name: 'aste',
                path: [1, 4, 4, 6, 2, 3]
            },
            {
                name: 'aste2',
                path: [10, 12, 12, 5, 14, 13]
            },
            {
                name: 'aste3',
                path: [21, 15, 15, 18]
            }
        ]
    }, obs.starsCtrl.object);

    editor.setMap(testMap);

    obs.animate();
};

function initUiComponents(ui) {
    let magn = ui.add('IntervalRangeNumber', document.getElementById('magnitude'), [1.75, 3.32]);
    magn.onChange = () => { ui.publish('magnitude-change', magn.interval); };
    let drawMode = ui.add('Switch', document.getElementById('drawMode'), false);
    let dollyMode = ui.add('Switch', document.getElementById('dollyMode'), false);
    let card = ui.add('Card', document.getElementById('card'));
}

function getJSON(uri) {
	return fetch(uri).then(response => response.json());
}
