namespace color {
    export class Fade {
        protected startTime: number;
        protected startPalette: Palette;
        protected endPalette: Palette;
        protected duration: number;

        constructor() { }

        public isActive(): boolean {
            return this.startTime !== undefined;
        }

        public start(duration = 1000): Fade {
            init();
            this.duration = duration;
            if (!this.startPalette)
                this.startPalette = currentPalette();

            color.setUserColors(this.startPalette);
            this.startTime = game.runtime();
            activeFade = this;
            return this;
        }

        public startUntilDone(duration?: number): Fade {
            this.start(duration);
            return this.pauseUntilDone();
        }

        public stop(): Fade {
            this.startPalette = undefined;
            return this;
        }

        public setStartPalette(colors: Palette): Fade {
            this.startPalette = colors.clone();
            return this;
        }

        public setStartColor(index: number, col: Color): Fade {
            if (!this.startPalette) {
                this.startPalette = currentPalette();
            }

            this.startPalette.setColor(index, col);
            return this;
        }

        public setEndPalette(colors: Palette): Fade {
            this.endPalette = colors.clone();
            return this;
        }

        public setEndColor(index: number, col: Color): Fade {
            if (!this.endPalette) {
                this.endPalette = currentPalette();
            }

            this.endPalette.setColor(index, col);
            return this;
        }

        public step(): boolean {
            if (!this.endPalette || !this.isActive()) {
                return true;
            }

            const time = game.runtime() - this.startTime;

            if (time < this.duration) {
                const p = new Palette(this.startPalette.length);

                for (let i = 0; i < p.length; ++i) {
                    const col = color.partialColorTransition(
                        this.startPalette.color(i),
                        this.endPalette.color(i),
                        time / this.duration
                    );
                    p.setColor(i, col);
                }

                color.setUserColors(p);
                return false;
            } else {
                color.setUserColors(this.endPalette);
                this.startTime = undefined;
                return true;
            }
        }

        public pause(duration: number): Fade {
            pause(duration);
            return this;
        }

        public pauseUntilDone(): Fade {
            pauseUntil(() => this.startTime === undefined);
            return this;
        }

        public reverse(): Fade {
            const t = this.startPalette;

            this.startPalette = this.endPalette;
            this.endPalette = t;

            return this;
        }

        public clone(): Fade {
            const fade = new Fade();
            fade.startPalette = this.startPalette.clone();
            fade.endPalette = this.endPalette.clone();
            return fade;
        }

        public mapEndRGB(h: (rgb: RGB) => RGB): Fade {
            const p = this.endPalette.clone();

            for (let i = 0; i < p.length; ++i) {
                const initRGB = RGB.fromHexValue(p.color(i));
                const applied = h(initRGB);
                p.setColor(i, applied.hexValue());
            }

            const out = this.clone();
            out.setEndPalette(p);

            return out;
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
                if (activeFade && activeFade.isActive()) {
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
    export function startFade(start: Palette, end: Palette, duration = 2000) {
        if (!start || !end || start.length !== end.length)
            return;

        activeFade = new Fade();
        activeFade.setStartPalette(start);
        activeFade.setEndPalette(end);
        activeFade.start(duration)
    }

    export function startFadeUntilDone(start: Palette, end: Palette, duration?: number) {
        startFade(start, end, duration);
        pauseUntilFadeDone();
    }

    export function pauseUntilFadeDone() {
        if (activeFade) {
            activeFade.pauseUntilDone();
        }
    }
} 