namespace color {
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

        color(index: number): Color {
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

        loadBuffer(buf: Buffer) {
            this.buf = buf;
        }

        toHexArray() {
            const output: Color[] = [];

            for (let i = 0; i < this.length; ++i) {
                output.push(this.color(i));
            }

            return output;
        }

        toString(): string {
            return this.toHexArray().join(",");
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
            currentColors = defaultPalette.buffer();
        if (!length || length > palette.length)
            length = palette.length;

        const fromStart = paletteOffset * 3;
        const toStart = start * 3;

        const copyLength = 3 * Math.clamp(0, availableColors(), length);

        for (let i = 0; i < copyLength; i++) {
            currentColors[toStart + i] = palette.color(fromStart + i);
        }

        image.setPalette(currentColors);
    }

    export function resetColorsToDefault() {
        setUserColors(defaultPalette);
    }

    /**
     * Returns the number of colors available in the palette
     */
    export function availableColors(): number {
        return defaultPalette.length;
    }

    /**
     * Converts an array of RGB colors into a palette buffer
     */
    export function rgbToPalette(colors: RGB[]): Palette {
        return hexArrayToPalette(colors && colors.map(rgbToNumber));
    }

    export function bufferToPalette(buf: Buffer): Palette {
        const p = new Palette(buf.length / 3);
        p.loadBuffer(buf);
        return p;
    }

    /**
     * Converts an array of hex colors into a palette buffer
     */
    export function hexArrayToPalette(colors: Color[]): Palette {
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

        const grad = new Palette(steps);

        grad.setColor(0, start);
        grad.setColor(steps - 1, end);

        for (let i = 1; i < steps - 1; i++) {
            const col = partialColorTransition(start, end, i / steps);
            grad.setColor(i, col);
        }

        return grad;
    }

    function colorSlope(a: Color, b: Color, steps: number) {
        return (a - b) / steps;
    }

    /**
     * Returns the color that is the given percentage between start and end
     *
     * @param start the initial color (returned if percent is <= 0)
     * @param end the final color (returned if percent is >= 1)
     * @param the percentage between 0 and 1
     */
    export function partialColorTransition(start: Color, end: Color, percentage: number) {
        if (percentage <= 0) return start;
        else if (percentage >= 1) return end;

        const r1 = r(start);
        const g1 = g(start);
        const b1 = b(start);

        const rDiff = r(end) - r1;
        const gDiff = g(end) - g1;
        const bDiff = b(end) - b1;

        return toColor(
            r1 + Math.round(rDiff * percentage),
            g1 + Math.round(gDiff * percentage),
            b1 + Math.round(bDiff * percentage)
        );
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

    // combine the r, g, and b components into a single number
    function toColor(r: number, g: number, b: number): Color {
        return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
    }
}