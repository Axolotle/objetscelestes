import * as components from './ui/components/index.js';
import { Observatoire } from './observatoire/Observatoire.js';
import { Editor } from './editor/Editor.js';
import { SkyMap } from './objects3d/SkyMap.js';
import { initDB } from './utilities/storage.js';

let sw = false;
// Register service worker to control making site work offline
if (sw && 'serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('serviceWorker.js')
    .then(function() { console.log('Service Worker Registered'); });
}

const defaultSkyMapData = [
    {
        name: 'Wiki',
        group: 'default',
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
    const visibilitySelect = document.getElementById('visibility-checkbox');

    const data = await getJSON('data/UMa.json');

    const obs = new Observatoire(data, {target: [0, 0, 0]}, space.camera, starCard);
    const editor = new Editor(obs.scene, obs.cameraCtrl, obs.starsCtrl, space.canvas);

    drawButton.addEventListener('switch', (e) => {
        editor.drawMode = e.detail;
        starCard.switchDisplayStyle();
    }, false);
    dollyButton.addEventListener('switch', (e) =>{
        obs.cameraCtrl.switchMode(e.detail);
    }, false);

    // canvas click
    space.addEventListener('leftclick', (e) => editor.onclick(e.detail), false);
    space.addEventListener('rightclick', () => editor.onrightclick(), false);
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
    space.addEventListener('keydown', (e) => {
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
            case 'KeyS':
                if (e.ctrlKey) {
                    e.preventDefault();
                    const maps = editor.skyMaps.children.forEach(map => {
                        if (map.userData.group === 'custom') {
                            storage.save(map.deshydrate());
                        }
                    });
                }
        }
    }, false);

    // magnitude
    magRange.addEventListener('change', (e) => {
        obs.stars.updateDrawRange(e.detail.value);
    }, false);

    // layer
    domLayerSelect.addEventListener('change', e => {
        editor.setMap(e.detail.elem.dataset.id);
    }, false);
    // layer-add
    document.getElementById('add-layer').addEventListener('click', () => {
        document.querySelector('dialog-zone').displayDialog('t-add-layer', response => {
            const map = new SkyMap(response.name, 'custom');
            editor.addMap(map);
            const data = {
                name: response.name,
                id: map.uuid,
                group: 'custom',
                asterisms: []
            }
            const elem = domLayerSelect.addItem(data);
            console.log(elem);
            domLayerSelect.focusItem(elem);
        })
    }, false);
    // layer-remove
    document.getElementById('remove-layer').addEventListener('click', () => {
        document.querySelector('dialog-zone').displayDialog('t-delete-layer', () => {
            const id = editor.deleteMap();
            storage.deleteItem(id);
            const elem = domLayerSelect.activeDescendant;
            elem.parentElement.removeChild(elem);
            domLayerSelect.focusFirstItem();
        })
    }, false);
    // layer-duplicate
    document.getElementById('duplicate-layer').addEventListener('click', () => {
        document.querySelector('dialog-zone').displayDialog('t-duplicate-layer', response => {
            const map = editor.skyMapCtrl.object.deepClone(response.name, 'custom');
            editor.addMap(map);
            const data = map.deshydrate();
            const elem = domLayerSelect.addItem(data);
            domLayerSelect.focusItem(elem);
        })
    }, false);
    // layer-rename
    document.getElementById('rename-layer').addEventListener('click', () => {
        document.querySelector('dialog-zone').displayDialog('t-rename-layer', response => {
            const map = editor.skyMapCtrl.object;
            const elem = domLayerSelect.activeDescendant;
            map.name = response.name;
            elem.textContent = response.name;
            domLayerSelect.onFocusChange(elem);
        })
    }, false);

    // visibility
    visibilitySelect.addEventListener('change', e => {
        const elems = {
            'vis-grid': [obs.grid, gridLabels],
            'vis-stars': [starLabels]
        }
        for (const elem of e.detail.elem) {
            let isVisible = elem.getAttribute('aria-selected') === 'true';
            for (const obj of elems[elem.id]) {
                obj.visible = isVisible;
            }
        }
    }, false);

    // init skyMaps
    const storage = await initDB();

    const skymaps = defaultSkyMapData.forEach(data => {
        const map = SkyMap.hydrate(data, obs.starsCtrl.object);
        editor.addMap(map);
        data.id = map.uuid;
        domLayerSelect.addItem(data);
    });
    storage.get().then(customSkyMapData => {
        customSkyMapData.forEach(data => {
            const map = SkyMap.hydrate(data, obs.starsCtrl.object);
            editor.addMap(map);
            data.id = map.uuid;
            domLayerSelect.addItem(data);
        });
    });
    domLayerSelect.focusLastItem();

    // save
    document.getElementById('save').addEventListener('click', e => {
        e.preventDefault();
        const maps = editor.skyMaps.children.forEach(map => {
            if (map.userData.group === 'custom') {
                storage.save(map.deshydrate());
            }
        })
    }, false);

    // export
    document.getElementById('export').addEventListener('click', e => {
        const maps = editor.skyMaps.children.filter(
            map => map.userData.group === 'custom'
        ).map(
            map => map.deshydrate()
        );

        var dataStr = encodeURIComponent(JSON.stringify(maps));
        e.target.setAttribute('href', 'data:text/json;charset=utf-8,' + dataStr);
        setTimeout(() => {
            e.target.setAttribute("href", '')
        }, 500);
    }, false);

    space.canvas.focus();

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
