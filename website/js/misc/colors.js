import { Color } from '../../../web_modules/three.js';

export const colors = {
    black: new Color(0x000000).toArray(),
    red: new Color(0xff0000).toArray(),
    green: new Color(0x00ff00).toArray(),
    pink: new Color(0xff00ff).toArray()
};

export const starsColors = {
    render: colors.green,
    select: colors.red
};

export const segmentColors = {
    render: colors.pink,
    select: colors.red
};

export const asterismColors = {
    render: colors.black,
    select: colors.pink
};
