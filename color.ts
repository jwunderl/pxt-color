namespace color {
    /**
     * The default palette buffer for the project
     */
    export const defaultPalette = hex`__palette`;

    // A color in hex format, between 0x000000 and 0xFFFFFF
    export type Color = number;
    let currentColors: Buffer;

    /**
     * A color in RGB format
     */
    export interface RGB {
        r: number;
        b: number;
        g: number;
    }

    /**
     * A collection of colors
     */
    export class Palette {
        protected buf: Buffer;

        constructor(length = 0xF) {
            this.buf = control.createBuffer((length) * 3);
        }

        get length() {
            return this.buf.length / 3;
        }

        setColor(index: number, color: Color) {
            if (index < 0 || index >= this.length) return;

            const start = index * 3;
            this.buf[start] = r(color);
            this.buf[start + 1] = g(color);
            this.buf[start + 2] = b(color);
        }

        getColor(index: number): Color {
            if (index < 0 || index >= this.length)
                return -1;

            const start = index * 3;
            return toColor(
                this.buf[start],
                this.buf[start + 1],
                this.buf[start + 2]
            );
        }

        buffer(): Buffer {
            return this.buf.slice();
        }
    }

    /**
     * Dynamically set all or part of the game's current palette
     *
     * @param palette The colors to set
     * @param start The index to start setting colors at
     * @param length The number of colors to copy
     * @param pOffset The offset to start copying from the palette
     */
    export function setUserColors(palette: Palette, start = 0, length = 0, paletteOffset = 0) {
        if (!currentColors)
            currentColors = defaultPalette.slice();
        if (!length || length > palette.length)
            length = palette.length;

        const fromStart = paletteOffset * 3;
        const toStart = start * 3;

        const copyLength = 3 * Math.clamp(0, availableColors(), length);

        for (let i = 0; i < copyLength; i++) {
            currentColors[toStart + i] = palette.getColor(fromStart + i);
        }

        image.setPalette(currentColors);
    }

    export function resetColorsToDefault() {
        image.setPalette(defaultPalette);
    }

    /**
     * Returns the number of colors available in the palette
     */
    export function availableColors(): number {
        return defaultPalette.length / 3;
    }

    /**
     * Converts an array of RGB colors into a palette buffer
     */
    export function rgbToPalette(colors: RGB[]): Palette {
        return hexToPalette(colors && colors.map(rgbToNumber));
    }

    /**
     * Converts an array of hex colors into a palette buffer
     */
    export function hexToPalette(colors: Color[]): Palette {
        const numColors = Math.min(colors.length, availableColors());
        const p = new Palette(numColors);

        if (colors && colors.length) {
            for (let i = 0; i < numColors; i++) {
                p.setColor(i, colors[i]);
            }
        }

        return p;
    }

    /**
     * Creates a palette from a gradient between two colors.
     *
     * @param start The start color
     * @param end The end color
     * @param steps The number of colors to generate;
     */
    export function gradient(start: Color, end: Color, steps = 0xF): Palette {
        if (steps < 2)
            return undefined;

        const r1 = r(start);
        const g1 = g(start);
        const b1 = b(start);

        const rSlope = colorSlope(r1, r(end), steps);
        const gSlope = colorSlope(g1, g(end), steps);
        const bSlope = colorSlope(b1, b(end), steps);

        const grad = new Palette(steps);

        grad.setColor(0, start);
        grad.setColor(steps - 1, end);
        for (let i = 1; i < steps - 1; i++) {
            grad.setColor(i, toColor(r1 - i * rSlope, g1 - i * gSlope, b1 - i * bSlope));
        }

        return grad;
    }

    function colorSlope(a: Color, b: Color, steps: number) {
        return (a - b) / steps;
    }

    /**
     * Converts an RGB to a hex number (rgb format)
     */
    export function rgbToNumber(rgb: RGB): Color {
        return toColor(rgb.r, rgb.g, rgb.b);
    }

    // return components of color
    function r(color: number): Color {
        return (color >> 16) & 0xff;
    }

    function g(color: number): Color {
        return (color >> 8) & 0xff;
    }

    function b(color: number): Color {
        return color & 0xff;
    }
    function toColor(r: number, g: number, b: number): Color {
        return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
    }
}