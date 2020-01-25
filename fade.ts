namespace color {
    export class Fade {
        protected startTime: number;
        protected duration: number;
        protected _startPalette: ColorBuffer;
        protected _endPalette: ColorBuffer;

        constructor() { }

        public startPalette(): ColorBuffer {
            if (!this._startPalette) {
                this._startPalette = currentPalette();
            }
            return this._startPalette;
        }

        public endPalette(): ColorBuffer {
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

        public setStartPalette(colors: ColorBuffer): Fade {
            this._startPalette = colors.slice(0, colors.length);

            console.log(colors.length + " " + this._startPalette.length)
            return this;
        }

        public setStartColor(index: number, col: Color): Fade {
            this.startPalette().setColor(index, col);
            return this;
        }

        public setEndPalette(colors: ColorBuffer): Fade {
            this._endPalette = colors.slice();
            return this;
        }

        public setEndColor(index: number, col: Color): Fade {
            this.endPalette().setColor(index, col);
            return this;
        }

        public step(): boolean {
            if (!this._endPalette || this.startTime === undefined) {
                console.log("a")
                return true;
            }

            if (!this.isActive()) {
                console.log("b")
                color.setPalette(this._endPalette);
                this.startTime = undefined;
                return true;
            }

            const time = game.runtime() - this.startTime;

            const p = new ColorBuffer(this._startPalette.length);

            console.log("c" + this._startPalette.length)
            for (let i = 0; i < p.length; ++i) {
                const col = color.partialColorTransition(
                    this._startPalette.color(i),
                    this._endPalette.color(i),
                    time / this.duration
                );
                p.setColor(i, col);
            }
            console.log(p.color(1))

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
                fade._startPalette = this._startPalette.slice(0, this._startPalette.length);
            if (this._endPalette)
                fade._endPalette = this._endPalette.slice(0, this._endPalette.length);
            return fade;
        }

        public mapEndRGB(
            h: (rgb: RGB, index: number, palette: ColorBuffer) => RGB,
            firstIndex?: number,
            lastIndex?: number
        ): Fade {
            const out = this.clone();
            const p = this.endPalette().slice(0, this._endPalette.length);

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
            h: (hsl: HSL, index: number, palette: ColorBuffer) => HSL,
            firstIndex?: number,
            lastIndex?: number
        ): Fade {
            const out = this.clone();
            const p = this.endPalette().slice(0, this.endPalette().length);

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
    export function startFade(start: ColorBuffer, end: ColorBuffer, duration = 2000) {
        console.log(start.length + " " + end.length())
        if (!start || !end || start.length !== end.length)
            return;

        activeFade = new Fade();
        activeFade.setStartPalette(start);
        activeFade.setEndPalette(end);
        activeFade.start(duration)
    }

    export function startFadeUntilDone(start: ColorBuffer, end: ColorBuffer, duration?: number) {
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