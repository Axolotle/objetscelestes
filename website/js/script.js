import * as components from './ui/components/index.js';
import { Observatoire } from './observatoire/Observatoire.js';
import { Editor } from './editor/Editor.js';
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

    const drawButton = document.getElementById('drawMode');
    const dollyButton = document.getElementById('dollyMode');
    const magRange = document.getElementById('magRange');
    const starCard = document.querySelector('object-info');
    const gridLabels = document.querySelector('#coordinates');
    const starLabels = document.querySelector('#starsNames');

    const domLayerSelect = document.getElementById('layer-select');

    const data = await getJSON('data/UMa.json');

    const obs = new Observatoire(data, {target: [0, 0, 0]}, space.camera, starCard);
    const editor = new Editor(obs.scene, obs.cameraCtrl, obs.starsCtrl, space.canvas);

    drawButton.addEventListener('switch', (e) => {
        editor.drawMode = e.detail;
        starCard.switchDisplayStyle();
    });
    dollyButton.addEventListener('switch', (e) =>{
        obs.cameraCtrl.switchMode(e.detail);
    });

    // canvas click
    space.addEventListener('leftclick', (e) => editor.onclick(e.detail));
    space.addEventListener('rightclick', () => editor.onrightclick());
    // canvas mouse movement
    space.addEventListener('drag', (e) => obs.cameraCtrl.onDrag(e.detail), false);
    space.addEventListener('zoom', (e) => obs.cameraCtrl.onWheel(e.detail), false);
    space.addEventListener('roll', (e) => obs.cameraCtrl.roll(e.detail.value), false);
    space.addEventListener('move', (e) => {
        if (editor.preDrawer.active) {
            editor.preDrawer.update(e.detail.mouse, space.camera);
        }
    }, false);
    // canvas keyboard
    space.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'Delete':
                if (editor.drawMode) {
                    editor.skyMapCtrl.delete();
                }
                break;
            case 'KeyR':
                drawMode.onClick();
                break;
            case 'KeyF':
                dollyMode.onClick();
        }
    }, false);

    // magnitude
    magRange.addEventListener('change', (e) => {
        obs.stars.updateDrawRange(e.detail.value);
    });

    // layer
    domLayerSelect.addEventListener('change', e => {
        editor.setMap(e.detail.elem.textContent);
    });

    // init
    const skymaps = skyMapData.forEach(data => {
        const map = SkyMap.hydrate(data, obs.starsCtrl.object);
        editor.addMap(map);
        domLayerSelect.addItem({
            value: data.name,
            id: data.id,
            group: 'layer-' + data.type
        });
    });

    space.canvas.focus();
    domLayerSelect.focusLastItem();

    animate();

    function animate() {
        requestAnimationFrame(animate);
        if (space.animating) space.animateKeys();
        space.renderer.render(obs.scene, space.camera);
        gridLabels.updateContent(obs.grid.getLabelsPosition(space));
        starLabels.updateContent(obs.stars.getLabelsPosition(space));
    }
};

function getJSON(uri) {
	return fetch(uri).then(response => response.json());
}
