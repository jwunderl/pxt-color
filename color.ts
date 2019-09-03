/**
 * Color library for pxt arcade
 */
//% weight=70 color="#105722" icon="\uf043"
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

        toString(): string {
            return `RGB(${this._r}, ${this._g}, ${this._b})`;
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
            this.h = h < 0 ? 360 + h : h;
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

        toString(): string {
            return `HSL(${this.h}, ${this.s}, ${this.l})`;
        }

        // https://gist.github.com/vahidk/05184faf3d92a0aa1b46aeaa93b07786
        hexValue(): Color {
            const chroma = (1 - Math.abs(2 * this.luminosity - 1)) * this.saturation;
            const hp = this.hue / 60.0;
            // second largest component of this color
            const x = chroma * (1 - Math.abs((hp % 2) - 1));

            // 'point along the bottom three faces of the RGB cube'
            let rgb1: number[];
            if (this.hue === undefined)
                rgb1 = [0, 0, 0];
            else if (hp <= 1)
                rgb1 = [chroma, x, 0];
            else if (hp <= 2)
                rgb1 = [x, chroma, 0];
            else if (hp <= 3)
                rgb1 = [0, chroma, x];
            else if (hp <= 4)
                rgb1 = [0, x, chroma];
            else if (hp <= 5)
                rgb1 = [x, 0, chroma];
            else if (hp <= 6)
                rgb1 = [chroma, 0, x];

            // lightness match component
            let m = this.luminosity - chroma * 0.5;
            return toColor(
                Math.round(255 * (rgb1[0] + m)),
                Math.round(255 * (rgb1[1] + m)),
                Math.round(255 * (rgb1[2] + m))
            );
        }

        // https://gist.github.com/vahidk/05184faf3d92a0aa1b46aeaa93b07786
        static fromHexValue(col: Color): HSL {
            const rgb = RGB.fromHexValue(col);

            const r = rgb.red / 255;
            const g = rgb.green / 255;
            const b = rgb.blue / 255;

            const max = Math.max(Math.max(r, g), b);
            const min = Math.min(Math.min(r, g), b);

            const diff = max - min;
            let h;
            if (diff === 0)
                h = 0;
            else if (max === r)
                h = (g - b) / diff % 6;
            else if (max === g)
                h = (b - r) / diff + 2;
            else if (max === b)
                h = (r - g) / diff + 4;

            let l = (min + max) / 2;
            let s = diff === 0
                ? 0
                : diff / (1 - Math.abs(2 * l - 1));

            return new HSL(h * 60, s, l);
        }
    }

    /**
     * A collection of colors
     */
    //% fixedInstances
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

    // store the last palette and fade so that it can be cleared
    let lastPaletteBeforeFade: Palette;
    let lastEffect: FadeEffect;

    //% fixedInstances
    export class FadeEffect implements effects.BackgroundEffect {
        protected currentFade: Fade;

        constructor(protected fadeFactory: () => Fade) { }

        /**
         * Apply this effect to the screen's color palette
         */
        //% blockId=effectStartScreenFade
        //% block="apply fade effect %effect||over %duration ms"
        //% duration.shadow=timePicker
        //% weight=60 help=effects/start-screen-effect
        startScreenEffect(duration = 2000) {
            if (lastEffect) lastEffect.stop();
            lastEffect = this;
            lastPaletteBeforeFade = currentPalette();
            this.currentFade = this.fadeFactory();

            this.currentFade.start(duration);
        }

        stop() {
            if (lastEffect == this) {
                lastEffect = undefined;
                if (this.currentFade) {
                    this.currentFade.stop();
                }
            }
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
    //% blockId=colorSetPalette block="set color palette to %palette"
    //% weight=90
    export function setPalette(palette: Palette, start = 0, length = 0, paletteOffset = 0) {
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

    /**
     * Clear the last fade effect
     */
    //% blockId=colorClearFadeEffects block="clear fade effect"
    //% weight=20
    export function clearFadeEffect() {
        if (lastEffect) {
            lastEffect.stop()
        }

        if (lastPaletteBeforeFade) {
            setPalette(lastPaletteBeforeFade)
            lastPaletteBeforeFade = undefined;
        }
    }

    export function resetColorsToDefault() {
        setPalette(originalPalette);
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
        return hexArrayToPalette(colors && colors.map(hsl => hsl.hexValue()));
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