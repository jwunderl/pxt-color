namespace color {
    class PaletteTransition {
        protected startTime: number;

        constructor (
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
                }

                color.setUserColors(p);
                return false;
            } else {
                color.setUserColors(this.end);
                return true;
            }
        }
    }

    let activeTransition: PaletteTransition;
    let started = false;

    function init() {
        if (!started) {
            game.forever(() => {
                if (activeTransition) {
                    const finished = activeTransition.step();
                    if (finished) {
                        activeTransition = undefined;
                    }
                }
            });
            started = true;
        }
    }

    function startPaletteTransition(start: Palette, end: Palette, duration: number) {
        if (!start || !end || start.length !== end.length)
            return;
        init();
        activeTransition = new PaletteTransition(start, end, duration);
    }

} 