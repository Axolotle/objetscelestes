import * as THREE from '../libs/three.module.js';


export class Asterism extends THREE.Line {
    constructor (point, rendererElem, camera) {
        const MAX = 50;

        const material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 1, depthTest: false});
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX * 3), 3));
        geometry.setDrawRange(0, 2);
        point.toArray(geometry.attributes.position.array, 0);
        point.toArray(geometry.attributes.position.array, 3);
        super(geometry, material);
        this.drawCount = 2;
        
        this.camera = camera;
        this.renderElem = rendererElem;
        this.initListeners();
    }

    addPoint (point) {
        let positions = this.geometry.attributes.position.array;
        point.toArray(positions, (this.drawCount -1) * 3);
        point.toArray(positions, this.drawCount * 3);
        this.drawCount++;
        this.geometry.setDrawRange(0, this.drawCount);
        this.geometry.attributes.position.needsUpdate = true;
    }
    
    // EVENTS LISTENERS
    
    initListeners (rendererElem) {
		this.renderElem.addEventListener('mousemove', this);
        this.renderElem.addEventListener('contextmenu', this)
	}
    
    handleEvent(event) {
        if (event.repeat) return;
	  	this[event.type](event);
    }
    
    // display a line from last point to mouse position while drawing
    // from https://stackoverflow.com/a/13091694
    mousemove (event) {
        var v = new THREE.Vector3(
            (event.clientX / window.innerWidth) * 2 - 1,
            - (event.clientY / window.innerHeight) * 2 + 1,
            0.5
        );
        v.unproject(this.camera);
        v.sub(this.camera.position).normalize();
        var distance = - this.camera.position.z / v.z;
        var pos = this.camera.position.clone().add(v.multiplyScalar(distance));

        let positions = this.geometry.attributes.position.array;
        pos.toArray(positions, (this.drawCount - 1) * 3);;
        this.geometry.attributes.position.needsUpdate = true;
    }
    
    contextmenu (event) {
        event.preventDefault();
        this.renderElem.removeEventListener('contextmenu', this);
        this.renderElem.removeEventListener('mousemove', this);
        this.drawCount--;
        this.geometry.setDrawRange(0, this.drawCount);
    }
}
