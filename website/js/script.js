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

const skyMapData = [
    {
        name: 'Custom 1',
        type: 'custom',
        id: 'custom1',
        asterisms: [
            { name: 'aste', path: [1, 4, 4, 6, 2, 3] },
            { name: 'aste2', path: [10, 12, 12, 5, 14, 13] },
            { name: 'aste3', path: [21, 15, 15, 18] }
        ]
    },
    {
        name: 'Custom 2',
        type: 'custom',
        id: 'custom2',
        asterisms: [
            { name: 'aste', path: [10, 4, 4, 6, 15, 3] },
        ]
    },
    {
        name: 'Wiki',
        type: 'default',
        id: 'wiki',
        asterisms: [
            { name: 'Grande Ourse', path: [2, 3, 3, 0, 0, 10, 10, 5, 5, 4, 4, 1, 1, 10] },
        ]
    }
];

window.onload = async () => {
    const space = document.querySelector('space-canvas');

    const starCard = document.querySelector('object-info');
    const gridLabels = document.querySelector('#coordinates');
    const starLabels = document.querySelector('#starsNames');

    const data = await getJSON('data/UMa.json');

    const obs = new Observatoire(data, {target: [0, 0, 0]}, space.camera, starCard);
    const editor = new Editor(obs.scene, obs.cameraCtrl, obs.starsCtrl, space.canvas);

    document.getElementById('dollyMode').addEventListener('switch', (e) =>{
        obs.cameraCtrl.switchMode(e.detail);
    });
    document.getElementById('drawMode').addEventListener('switch', (e) => {
        editor.drawMode = e.detail;
        starCard.switchDisplayStyle();
    });


    space.addEventListener('leftclick', (e) => editor.onclick(e.detail));
    space.addEventListener('rightclick', () => editor.onrightclick());
    // camera events
    space.addEventListener('drag', (e) => obs.cameraCtrl.onDrag(e), false);
    space.addEventListener('zoom', (e) => obs.cameraCtrl.onWheel(e), false);

    document.getElementById('magRange').addEventListener('change', (e) => {
        obs.stars.updateDrawRange(e.detail.value);
    });

    // layer handling
    const domLayerSelect = document.getElementById('layer-select');
    domLayerSelect.addEventListener('change', e => {
        editor.setMap(e.detail.elem.textContent);
    });
    const skymaps = skyMapData.forEach(data => {
        const map = SkyMap.hydrate(data, obs.starsCtrl.object);
        editor.addMap(map);
        domLayerSelect.addItem({
            value: data.name,
            id: data.id,
            group: 'layer-' + data.type
        });
    });
    domLayerSelect.focusLastItem();

    animate();

    function animate() {
        requestAnimationFrame(animate);
        space.renderer.render(obs.scene, space.camera);
        gridLabels.updateContent(obs.grid.getLabelsPosition(space));
        starLabels.updateContent(obs.stars.getLabelsPosition(space));
    }
};

function getJSON(uri) {
	return fetch(uri).then(response => response.json());
}
