/**
 * Color library for pxt arcade
 */
//% weight=70 color="#105722" icon="\uf043" advanced=false
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
                color.unpackR(col),
                color.unpackG(col),
                color.unpackB(col)
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
                h = ((((g - b) / diff) % 6) + 6) % 6;
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

    //% fixedInstances
    export class Palette extends ColorBuffer { }

    class FadeRevert {
        constructor(
            public fade: FadeEffect,
            protected revert: (duration: number) => Fade
        ) { }

        applyRevert(duration: number) {
            return this.revert(duration).then(f => {
                const effectStack = getFadingEffectStack();
                effectStack.removeElement(this);
                return f;
            });
        }
    }

    const COLOR_FADING_EFFECT_KEY = "__colorfadingeffectstate";
    function getFadingEffectStack(): FadeRevert[] {
        let sceneState: FadeRevert[] = game.currentScene().data[COLOR_FADING_EFFECT_KEY];
        if (!sceneState) {
            sceneState = clearFadingEffectStack();
        }
        return sceneState;
    }

    function clearFadingEffectStack(): FadeRevert[] {
        return game.currentScene().data[COLOR_FADING_EFFECT_KEY] = [];
    }

    //% fixedInstances
    export class FadeEffect implements effects.BackgroundEffect {
        protected currentFade: Fade;
        protected startPalette: Palette;

        constructor(
            protected id: string,
            protected fadeFactory: () => Fade,
            protected revertsId?: string
        ) { }

        /**
         * Apply this effect to the screen's color palette
         */
        //% blockId=effectStartScreenFade
        //% block="apply fade effect %effect||over %duration ms"
        //% duration.shadow=timePicker
        //% weight=60 help=effects/start-screen-effect
        startScreenEffect(duration = 2000) {
            const effectStack = getFadingEffectStack();
            const lastEffect = effectStack.length && effectStack[effectStack.length - 1];
            const currPalette = currentPalette();
            const rev = new FadeRevert(this, duration => {
                const f = new Fade();

                return f.setEndPalette(currPalette)
                    .start(duration);
            });

            effectStack.push(rev);

            if (lastEffect) {
                lastEffect.fade.stop();
                if (this.revertsId && this.revertsId == lastEffect.fade.id) {
                    this.currentFade = lastEffect.applyRevert(duration).then(f => {
                        const effects = getFadingEffectStack();
                        effects.removeElement(rev);
                        return f;
                    });
                    return;
                }
            }
            this.startPalette = currPalette;
            this.currentFade = this.fadeFactory();

            this.currentFade.start(duration);
        }

        stop() {
            const effectStack = getFadingEffectStack();
            if (this.currentFade
                && effectStack.length
                && effectStack[effectStack.length - 1].fade === this
            ) {
                this.currentFade.stop();
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
        if (!length || length > palette.length)
            length = palette.length;
        if (!currentColors)
            currentColors = originalPalette.buf.slice();

        const fromStart = paletteOffset * 3;
        const toStart = start * 3;
        const asBuf = palette.buf;

        const copyLength = 3 * Math.clamp(0, availableColors(), length);

        for (let i = 0; i < copyLength; i++) {
            currentColors[toStart + i] = asBuf[fromStart + i];
        }

        image.setPalette(currentColors);
    }

    /**
     * Set an index in the color palette to a new color.
     *
     * @param index the index to update; must be between 1 and 15
     * @param color the color to set
     */
    //% blockId=colorSetColorAtIndex block="set color %index to %newColor || over %duration ms"
    //% weight=100
    //% index.min=1 index.max=15 index.step=1
    //% index.defl=1
    //% duration.shadow=timePicker
    //% newColor.shadow=colorsrgb
    export function setColor(index: number, newColor: number, duration?: number) {
        if (index <= 0 || index > 15)
            return;
        if (duration) {
            if (!currentColors)
                currentColors = originalPalette.buf.slice();
            const newPalette = bufferToPalette(currentColors.slice());
            newPalette.setColor(index, newColor);
            color.startFade(bufferToPalette(currentColors), newPalette, duration)
        } else {
            setPalette(hexArrayToPalette([newColor]), index | 0, 1, 0);
        }
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% blockId="colorsrgb__dup" block="red %red|green %green|blue %blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    //% help="colors/rgb"
    //% weight=95 blockGap=8
    export function __rgb(red: number, green: number, blue: number): number {
        return color.rgb(red, green, blue);
    }

     /**
     * Convert an HSV (hue, saturation, value) color to RGB
     * @param hue value of the hue channel between 0 and 255. eg: 255
     * @param sat value of the saturation channel between 0 and 255. eg: 255
     * @param val value of the value channel between 0 and 255. eg: 255
     */
    //% blockId="colorshsv__dup" block="hue %hue|sat %sat|val %val"
    //% hue.min=0 hue.max=255 sat.min=0 sat.max=255 val.min=0 val.max=255
    //% help="colors/hsv"
    //% weight=94
    export function __hsv(hue: number, sat: number, val: number) {
        // TODO: this and __rgb are already in colors.ts, just hidden.
        // Overloading them isn't working at the moment; figure out why and fix
        return color.hsv(hue, sat, val);
    }

    /**
    * Convert a color string to a color. This can be of format #RRGGBB
    * RGB(0, 0, 0), sRGB(0, 0, 0), hsl(0, 0%, 0%), or hsv(0, 0%, 0%)
    */
    //% blockId=parseColorString block="parse color $value"
    //% value.defl="#000000"
    //% weight=93
    export function parseColorString(value: string) {
        const hexValue = parseHexString(value);

        if (hexValue >= 0) return hexValue;

        const colorSpace = parseColorSpaceString(value);

        if (colorSpace >= 0) return colorSpace;

        return 0;
    }

    function parseHexString(value: string) {
        let digits = "";
        const HEX = "0123456789abcdefABCDEF"
        for (let i = 0; i < value.length; i++) {
            const current = value.charAt(i);
            if (current === " " || current === "\t" || current === "#") continue;

            if (HEX.indexOf(current) === -1) {
                return -1;
            }

            digits += current;
        }

        if (digits.length === 3) {
            let expanded = "";

            for (const char of digits) {
                expanded += char + char;
            }

            return parseInt(expanded, 16);
        }
        else if (digits.length === 6) {
            return parseInt(digits, 16);
        }
        else {
            return undefined;
        }
    }

    function parseColorSpaceString(value: string) {
        let parsingArguments = false;
        const args: string[] = [];
        let currentArg = "";
        let colorSpace = "";

        for (let i = 0; i < value.length; i++) {
            const current = value.charAt(i);
            const isWhitespace = current === " " || current === "\t";

            if (!parsingArguments) {
                if (isWhitespace) continue;
                else if (current === "(") {
                    parsingArguments = true;

                    if (!(colorSpace === "rgb" || colorSpace === "srgb" || colorSpace === "hsv" || colorSpace === "hsl")) {
                        return -1;
                    }
                }
                else {
                    colorSpace += current.toLowerCase();
                }
            }
            else if (parsingArguments) {
                if (isWhitespace) {
                    if (currentArg) {
                        args.push(currentArg)
                        currentArg = "";
                    }
                    else continue;
                }
                else if (current === "," || current === "°") {
                    if (!currentArg) {
                        return -1
                    }
                    args.push(currentArg)
                    currentArg = "";
                }
                else if ("0123456789.%".indexOf(current) !== -1) {
                    currentArg += current;
                }
                else if (current === ")") break;
                else {
                    return -1;
                }
            }
        }

        if (currentArg) {
            args.push(currentArg)
        }

        // Let opacity through, just ignore it
        if (args.length !== 3 && args.length !== 4) {
            return -1;
        }

        const parsedArgs: number[] = [];
        let index = 0;
        for (const arg of args) {
            if (arg.charAt(arg.length - 1) === "%") {
                const value = parseFloat(arg.substr(0, arg.length - 1));
                if (isNaN(value)) {
                    return -1
                }

                if (colorSpace === "rgb" || colorSpace === "srgb") {
                    parsedArgs.push(((value / 100) * 255) | 0)
                }
                else if (index === 0) {
                    return -1
                }
                else {
                    parsedArgs.push(value / 100);
                }
            }
            else {
                const value = parseFloat(arg);
                if (isNaN(value)) {
                    return -1;
                }
                parsedArgs.push(value);
            }

            index ++;
        }

        if (colorSpace === "hsv") {
            return hsv((parsedArgs[0] / 360) * 255, parsedArgs[1] * 255, parsedArgs[2] * 255)
        }
        else if (colorSpace === "hsl") {
            return new HSL(parsedArgs[0], parsedArgs[1], parsedArgs[2]).hexValue();
        }

        return rgb(parsedArgs[0], parsedArgs[1], parsedArgs[2])
    }

    /**
     * Clear the last fade effect
     */
    //% blockId=colorClearFadeEffects block="clear fade effect"
    //% weight=20
    export function clearFadeEffect() {
        const effectStack = getFadingEffectStack();
        if (effectStack.length) {
            effectStack[effectStack.length - 1].fade.stop();
            effectStack[0].applyRevert(0);
            clearFadingEffectStack();
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
        p.buf = buf;
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

        const r1 = color.unpackR(start);
        const g1 = color.unpackG(start);
        const b1 = color.unpackB(start);

        const rDiff = color.unpackR(end) - r1;
        const gDiff = color.unpackG(end) - g1;
        const bDiff = color.unpackB(end) - b1;

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
            p.buf = currentColors.slice()
            return p;
        } else {
            return _clone(originalPalette);
        }
    }

    // combine the r, g, and b components into a single number
    function toColor(r: number, g: number, b: number): Color {
        return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
    }

    export function _clone(p: Palette) {
        const out = new Palette(p.length);
        for (let i = 0; i < p.length; ++i) {
            out.setColor(i, p.color(i))
        }
        return out;
    }
}
