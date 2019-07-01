namespace color {
    export class PaletteTransition {
        protected startTime: number;
        protected startPalette: Palette;
        protected endPalette: Palette;
        protected duration: number;

        constructor() { }

        public isActive(): boolean {
            return this.startTime !== undefined;
        }

        public start(duration = 1000): PaletteTransition {
            init();
            this.duration = duration;
            if (!this.startPalette)
                this.startPalette = currentPalette();

            color.setUserColors(this.startPalette);
            this.startTime = game.runtime();
            activeTransition = this;
            return this;
        }

        public stop(): PaletteTransition {
            this.startPalette = undefined;
            return this;
        }

        public setStartPalette(colors: Palette): PaletteTransition {
            this.startPalette = colors.clone();
            return this;
        }

        public setStartColor(index: number, col: Color): PaletteTransition {
            if (!this.startPalette) {
                this.startPalette = currentPalette();
            }

            this.startPalette.setColor(index, col);
            return this;
        }

        public setEndPalette(colors: Palette): PaletteTransition {
            this.endPalette = colors.clone();
            return this;
        }

        public setEndColor(index: number, col: Color): PaletteTransition {
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

        public pauseUntilDone(): PaletteTransition {
            pauseUntil(() => this.startTime === undefined);
            return this;
        }

        public reverse(): PaletteTransition {
            const t = this.startPalette;

            this.startPalette = this.endPalette;
            this.endPalette = t;

            return this;
        }
    }

    class TransitionState {
        constructor(
            public state: PaletteTransition,
            public scene: scene.Scene
        ) { }
    }

    let activeTransition: PaletteTransition;
    let currentScene: scene.Scene;

    let transitionStack: TransitionState[];

    game.addScenePushHandler(() => {
        if (currentScene) {
            if (!transitionStack) transitionStack = [];

            transitionStack.push(
                new TransitionState(
                    activeTransition,
                    currentScene
                )
            );

            activeTransition = undefined;
            currentScene = undefined;
        }
    });

    game.addScenePopHandler(() => {
        const scene = game.currentScene();
        currentScene = undefined;
        activeTransition = undefined;

        if (transitionStack && transitionStack.length) {
            const nextState = transitionStack.pop();
            if (nextState.scene === scene) {
                activeTransition = nextState.state;
                currentScene = nextState.scene;
            } else {
                transitionStack.push(nextState);
            }
        }
    });


    function init() {
        if (!currentScene) {
            game.forever(() => {
                if (activeTransition && activeTransition.isActive()) {
                    const finished = activeTransition.step();
                    if (finished) {
                        activeTransition = undefined;
                    }
                }
            });
            currentScene = game.currentScene();
        }
    }

    /**
     *  Create a transition from start to end that occurs over the given duration
     */
    export function startTransition(start: Palette, end: Palette, duration = 2000) {
        if (!start || !end || start.length !== end.length)
            return;

        activeTransition = new PaletteTransition();
        activeTransition.setStartPalette(start);
        activeTransition.setEndPalette(end);
        activeTransition.start(duration)
    }

    export function startTransitionUntilDone(start: Palette, end: Palette, duration?: number) {
        startTransition(start, end, duration);
        pauseUntilTransitionDone();
    }

    export function pauseUntilTransitionDone() {
        if (activeTransition) {
            activeTransition.pauseUntilDone();
        }
    }
} 