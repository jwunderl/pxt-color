namespace color {
    export class PaletteTransition {
        protected startTime: number;
        public start: Palette;
        public end: Palette;
        public duration: number;

        constructor() { }

        public isActive() {
            return this.startTime !== undefined;
        }

        public activate(duration = 1000) {
            init();
            if (!this.start)
                this.start = currentPalette();

            color.setUserColors(this.start);
            this.startTime = game.runtime();
        }

        public stop() {
            this.start = undefined;
        }

        public setStartPalette(colors: Palette): PaletteTransition {
            this.start = colors;
            return this;
        }

        public setStartColor(index: number, col: Color): PaletteTransition {
            if (!this.start) {
                this.start = currentPalette();
            }

            this.start.setColor(index, col);
            return this;
        }

        public setEndPalette(colors: Palette): PaletteTransition {
            this.end = colors;
            return this;
        }

        public setEndColor(index: number, col: Color): PaletteTransition {
            if (!this.end) {
                this.end = currentPalette();
            }

            this.end.setColor(index, col);
            return this;
        }

        public step(): boolean {
            if (!this.end || !this.isActive()) {
                return true;
            }

            const time = game.runtime() - this.startTime;

            if (time < this.duration) {
                const p = new Palette(this.start.length);

                for (let i = 0; i < p.length; ++i) {
                    const col = color.partialColorTransition(
                        this.start.color(i),
                        this.end.color(i),
                        time / this.duration
                    );
                    p.setColor(i, col);
                }

                color.setUserColors(p);
                return false;
            } else {
                color.setUserColors(this.end);
                this.startTime = undefined;
                return true;
            }
        }

        public pauseUntilDone() {
            pauseUntil(() => this.startTime === undefined);
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

    export function startTransition(start: Palette, end: Palette, duration = 2000) {
        if (!start || !end || start.length !== end.length)
            return;

        activeTransition = new PaletteTransition();
        activeTransition.setStartPalette(start);
        activeTransition.setEndPalette(end);
        activeTransition.activate(duration)
    }

    export function pauseUntilTransitionDone() {
        if (activeTransition) {
            activeTransition.pauseUntilDone();
        }
    }
} 