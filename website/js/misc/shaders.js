const pointShaders = {
    vertex: `
    attribute vec3 color;
    attribute float size;
    varying vec3 vColor;

    void main () {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 10.0 * size;
        gl_Position = projectionMatrix * mvPosition;
    }
    `,
    fragment: `
    varying vec3 vColor;

    void main () {
        gl_FragColor = vec4(vColor, 1.0);
        vec2 coord = gl_PointCoord - vec2(0.5);
        if (length(coord) > 0.5)
            discard;
    }
    `
}

export { pointShaders };
