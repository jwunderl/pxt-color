namespace color {
    export class Fade {
        protected startTime: number;
        protected duration: number;
        protected _startPalette: Palette;
        protected _endPalette: Palette;

        constructor() { }

        public startPalette(): Palette {
            if (!this._startPalette) {
                this._startPalette = currentPalette();
            }
            return this._startPalette;
        }

        public endPalette(): Palette {
            if (!this._endPalette) {
                this._endPalette = currentPalette();
            }
            return this._endPalette;
        }

        public isActive(): boolean {
            return this.startTime !== undefined
                && this.duration !== undefined
                && this.startTime + this.duration > game.runtime();
        }

        public start(duration = 1000): Fade {
            init();
            this.duration = duration;

            color.setPalette(this.startPalette());
            this.startTime = game.runtime();
            activeFade = this;
            return this;
        }

        public startUntilDone(duration?: number): Fade {
            this.start(duration);
            return this.pauseUntilDone();
        }

        public stop(): Fade {
            this.startTime = undefined;
            return this;
        }

        public setStartPalette(colors: Palette): Fade {
            this._startPalette = _clone(colors);
            return this;
        }

        public setStartColor(index: number, col: Color): Fade {
            this.startPalette().setColor(index, col);
            return this;
        }

        public setEndPalette(colors: Palette): Fade {
            this._endPalette = _clone(colors);
            return this;
        }

        public setEndColor(index: number, col: Color): Fade {
            this.endPalette().setColor(index, col);
            return this;
        }

        public step(): boolean {
            if (!this._endPalette || this.startTime === undefined) {
                return true;
            }

            if (!this.isActive()) {
                color.setPalette(this._endPalette);
                this.startTime = undefined;
                return true;
            }

            const time = game.runtime() - this.startTime;

            const p = new Palette(this._startPalette.length);

            for (let i = 0; i < p.length; ++i) {
                const col = color.partialColorTransition(
                    this._startPalette.color(i),
                    this._endPalette.color(i),
                    time / this.duration
                );
                p.setColor(i, col);
            }

            color.setPalette(p);
            return false;
        }

        public then(h: (fade: Fade) => void): Fade {
            h(this);
            return this;
        }

        public pauseUntilDone(): Fade {
            pauseUntil(() => !this.isActive());
            return this;
        }

        public reverse(): Fade {
            const t = this._startPalette;

            this._startPalette = this._endPalette;
            this._endPalette = t;

            return this;
        }

        public clone(): Fade {
            const fade = new Fade();
            if (this._startPalette)
                fade._startPalette = _clone(this._startPalette);
            if (this._endPalette)
                fade._endPalette = _clone(this._endPalette);
            return fade;
        }

        public mapEndRGB(
            h: (rgb: RGB, index: number, palette: Palette) => RGB,
            firstIndex?: number,
            lastIndex?: number
        ): Fade {
            const out = this.clone();
            const p = _clone(this.endPalette());

            firstIndex = firstIndex | 0;
            lastIndex = lastIndex === undefined
                ? p.length - 1
                : Math.min(p.length - 1, lastIndex);

            for (let i = firstIndex; i <= lastIndex; ++i) {
                const initRGB = RGB.fromHexValue(p.color(i));
                const applied = h(initRGB, i, p);
                p.setColor(i, applied.hexValue());
            }

            return out
                .setEndPalette(p);
        }

        public mapEndHSL(
            h: (hsl: HSL, index: number, palette: Palette) => HSL,
            firstIndex?: number,
            lastIndex?: number
        ): Fade {
            const out = this.clone();
            const p = _clone(this.endPalette());

            firstIndex = firstIndex | 0;
            lastIndex = lastIndex === undefined
                ? p.length - 1
                : Math.min(p.length - 1, lastIndex);

            for (let i = firstIndex; i <= lastIndex; ++i) {
                const initHSL = HSL.fromHexValue(p.color(i));
                const applied = h(initHSL, i, p);
                p.setColor(i, applied.hexValue());
            }

            return out
                .setEndPalette(p);
        }
    }

    class FadeState {
        constructor(
            public state: Fade,
            public scene: scene.Scene
        ) { }
    }

    let activeFade: Fade;
    let currentScene: scene.Scene;

    let FadeStack: FadeState[];

    game.addScenePushHandler(() => {
        if (currentScene) {
            if (!FadeStack) FadeStack = [];

            FadeStack.push(
                new FadeState(
                    activeFade,
                    currentScene
                )
            );

            activeFade = undefined;
            currentScene = undefined;
        }
    });

    game.addScenePopHandler(() => {
        const scene = game.currentScene();
        currentScene = undefined;
        activeFade = undefined;

        if (FadeStack && FadeStack.length) {
            const nextState = FadeStack.pop();
            if (nextState.scene === scene) {
                activeFade = nextState.state;
                currentScene = nextState.scene;
            } else {
                FadeStack.push(nextState);
            }
        }
    });


    function init() {
        if (!currentScene) {
            game.forever(() => {
                if (activeFade) {
                    const finished = activeFade.step();

                    if (finished) {
                        activeFade = undefined;
                    }
                }
            });
            currentScene = game.currentScene();
        }
    }

    /**
     *  Create a Fade from start to end that occurs over the given duration
     */
    //% blockId=colorStartFade block="fade from %start to %end||over %duration ms"
    //% weight=80
    //% duration.shadow=timePicker
    export function startFade(start: Palette, end: Palette, duration = 2000) {
        if (!start || !end || start.length !== end.length)
            return;

        color.clearFadeEffect();

        activeFade = new Fade();
        activeFade.setStartPalette(start);
        activeFade.setEndPalette(end);
        activeFade.start(duration)
    }

    /**
     *  Create a Fade from the current palette to end that occurs over the given duration
     */
    //% blockId=colorStartFadeFromCurrent block="fade to %end||over %duration ms"
    //% weight=79
    //% duration.shadow=timePicker
    export function startFadeFromCurrent(end: Palette, duration = 2000) {
        startFade(currentPalette(), end, duration);
    }

    export function startFadeUntilDone(start: Palette, end: Palette, duration?: number) {
        startFade(start, end, duration);
        pauseUntilFadeDone();
    }

    /**
     * Pause until the current fade is completed
     */
    //% blockId=colorPauseUntilFadeDone block="pause until current fade done"
    //% weight=50
    export function pauseUntilFadeDone() {
        if (activeFade) {
            activeFade.pauseUntilDone();
        }
    }
}