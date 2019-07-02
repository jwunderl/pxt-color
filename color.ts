namespace color {
    let currentColors: Buffer;

    // A color in hex format, between 0x000000 and 0xFFFFFF
    export type Color = number;

    /**
     * A color in RGB format
     */
    export class RGB {
        protected _r: number;
        protected _g: number;
        protected _b: number;

        constructor(red: number, green: number, blue: number) {
            this.red = red;
            this.green = green;
            this.blue = blue;
        }

        get red(): number {
            return this._r;
        }
        set red(v: number) {
            this._r = Math.clamp(0, 255, v);
        }

        get green(): number {
            return this._g;
        }
        set green(v: number) {
            this._g = Math.clamp(0, 255, v);
        }

        get blue(): number {
            return this._b;
        }
        set blue(v: number) {
            this._b = Math.clamp(0, 255, v);
        }

        hexValue(): Color {
            return toColor(
                this.red,
                this.green,
                this.blue
            );
        }

        static fromHexValue(col: Color): RGB {
            return new RGB(
                red(col),
                green(col),
                blue(col)
            );
        }
    }

    /**
     * A color in HSL format
     */
    export class HSL {
        protected h: number;
        protected s: number;
        protected l: number;

        constructor(hue: number, saturation: number, luminosity: number) {
            this.hue = hue;
            this.saturation = saturation;
            this.luminosity = luminosity;
        }

        get hue(): number {
            return this.h;
        }
        set hue(v: number) {
            const h = v % 360;
            this.h = h < 0 ? 360 - h : h;
        }

        get saturation(): number {
            return this.s;
        }
        set saturation(v: number) {
            this.s = Math.clamp(0, 1, v);
        }

        get luminosity(): number {
            return this.l;
        }
        set luminosity(v: number) {
            this.l = Math.clamp(0, 1, v);
        }

        hexValue(): Color {
            return hslToNumber(this);
        }
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
            if (color < 0 || color > 0xFFFFFF) return;

            const start = index * 3;
            this.buf[start] = red(color);
            this.buf[start + 1] = green(color);
            this.buf[start + 2] = blue(color);
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
            this.buf = buf.slice();
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

        clone(): Palette {
            const p = new Palette();
            p.loadBuffer(this.buffer());
            return p;
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
            currentColors = originalPalette.buffer();
        if (!length || length > palette.length)
            length = palette.length;

        const fromStart = paletteOffset * 3;
        const toStart = start * 3;
        const asBuf = palette.buffer();

        const copyLength = 3 * Math.clamp(0, availableColors(), length);

        for (let i = 0; i < copyLength; i++) {
            currentColors[toStart + i] = asBuf[fromStart + i];
        }

        image.setPalette(currentColors);
    }

    export function resetColorsToDefault() {
        setUserColors(originalPalette);
    }

    /**
     * Returns the number of colors available in the palette
     */
    export function availableColors(): number {
        return originalPalette.length;
    }

    /**
     * Converts an array of RGB colors into a palette buffer
     */
    export function rgbArrayToPalette(colors: RGB[]): Palette {
        return hexArrayToPalette(colors && colors.map(rgbToNumber));
    }

    /**
     * Converts an array of HSL colors into a palette buffer
     */
    export function hslArrayToPalette(colors: HSL[]): Palette {
        return hexArrayToPalette(colors && colors.map(hslToNumber));
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
     * The final length of the palette will be steps + offset
     *
     * @param start The start color
     * @param end The end color
     * @param steps The number of colors to generate
     * @param offset The index to start filling in colors from
     */
    export function gradient(start: Color, end: Color, steps = 0xF, offset = 0): Palette {
        if (steps < 2)
            return undefined;

        const grad = new Palette(steps + offset);

        grad.setColor(0, start);
        grad.setColor(steps - 1, end);

        for (let i = 0; i < steps; i++) {
            const col = partialColorTransition(start, end, i / (steps - 1));
            grad.setColor(i + offset, col);
        }

        return grad;
    }

    /**
     * Returns the color that is the given percentage between start and end
     *
     * @param start the initial color (returned if percent is <= 0)
     * @param end the final color (returned if percent is >= 1)
     * @param the percentage between 0 and 1
     */
    export function partialColorTransition(start: Color, end: Color, percentage: number) {
        if (percentage <= 0) {
            return start;
        } else if (percentage >= 1) {
            return end;
        }

        const r1 = red(start);
        const g1 = green(start);
        const b1 = blue(start);

        const rDiff = red(end) - r1;
        const gDiff = green(end) - g1;
        const bDiff = blue(end) - b1;

        return toColor(
            r1 + Math.round(rDiff * percentage),
            g1 + Math.round(gDiff * percentage),
            b1 + Math.round(bDiff * percentage)
        );
    }

    /**
     * Converts an RGB to a hex number
     */
    export function rgbToNumber(rgb: RGB): Color {
        return toColor(rgb.red, rgb.green, rgb.blue);
    }

    /**
     * Converts an HSL to a hex number
     * 
     * based off https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
     */
    export function hslToNumber(hsl: HSL): Color {
        let r0 = hsl.luminosity;
        let g0 = hsl.luminosity;
        let b0 = hsl.luminosity;

        if (hsl.saturation !== 0) {
            const toRGB = (p: number, q: number, t: number) => {
                if (t < 0) {
                    t += 1;
                } else if (t > 1) {
                    t -= 1;
                }

                if (t < 1 / 6) {
                    return p + (q - p) * 6 * t;
                } else if (t < 1 / 2) {
                    return q;
                } else if (t < 2 / 3) {
                    return p + (q - p) * (2 / 3 - t) * 6;
                } else {
                    return p;
                }
            }

            const q = hsl.luminosity < 0.5 ?
                hsl.luminosity * (1 + hsl.saturation)
                :
                hsl.luminosity + hsl.saturation - hsl.luminosity * hsl.saturation;
            const p = 2 * hsl.luminosity - q;

            r0 = toRGB(p, q, hsl.hue + 1 / 3);
            g0 = toRGB(p, q, hsl.hue);
            b0 = toRGB(p, q, hsl.hue - 1 / 3);
        }

        return rgbToNumber(
            new RGB(
                Math.round(r0 * 255),
                Math.round(g0 * 255),
                Math.round(b0 * 255)
            )
        );
    }

    export function currentPalette() {
        if (currentColors) {
            const p = new Palette(availableColors());
            p.loadBuffer(currentColors);
            return p;
        } else {
            return originalPalette.clone();
        }
    }

    // return components of color
    function red(color: number): Color {
        return (color >> 16) & 0xff;
    }

    function green(color: number): Color {
        return (color >> 8) & 0xff;
    }

    function blue(color: number): Color {
        return color & 0xff;
    }

    // combine the r, g, and b components into a single number
    function toColor(r: number, g: number, b: number): Color {
        return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
    }
}