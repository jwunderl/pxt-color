namespace color.transition {
    class PaletteTransition {
        protected startTime: number;

        constructor(
            public start: Palette,
            public end: Palette,
            public duration: number
        ) {
            this.startTime = game.runtime();
            color.setUserColors(start);
        }

        step(): boolean {
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
                return true;
            }
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
                if (activeTransition) {
                    const finished = activeTransition.step();
                    if (finished) {
                        activeTransition = undefined;
                    }
                }
            });
            currentScene = game.currentScene();
        }
    }

    export function start(start: Palette, end: Palette, duration: number) {
        if (!start || !end || start.length !== end.length)
            return;

        init();
        activeTransition = new PaletteTransition(start, end, duration);
    }

    export function pauseUntilDone() {
        pauseUntil(() => !activeTransition);
    }
} 