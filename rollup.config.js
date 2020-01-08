import cleaner from 'rollup-plugin-cleaner';
import { terser } from 'rollup-plugin-terser';
import copy from "rollup-plugin-copy";


export default {
    input: [
        './website/js/script.js',
        './web_modules/lit-element.js',
        './web_modules/three.js',
    ],
    output: [{
        dir: './build/js/',
        format: 'esm'
    }],
    plugins: [
        cleaner({
            targets: ['./build/']
        }),
        terser(), // minification
        copy({
            targets: [
                { src: ['./website/index.html', './website/stylesheet.css'], dest: './build/' },
                { src: './website/data/UMa.json', dest: './build/data/' }
            ]
        }),
    ]
};
