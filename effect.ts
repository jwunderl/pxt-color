namespace color {
    const stateNamespace = "__coloreffectstate";

    //% fixedInstance whenUsed block="fade to black"
    export const FadeToBlack = new FadeEffect("fadetoblack", () => {
        return (new Fade())
            .setEndPalette(Black);
    });

    //% fixedInstance whenUsed block="fade to white"
    export const FadeToWhite = new FadeEffect("fadetowhite", () => {
        return (new Fade())
            .setEndPalette(White);
    });

    //% fixedInstance whenUsed block="darken"
    export const Darken = new FadeEffect("darken", darkenEffect, "brighten");
    function darkenEffect() {
        const f = new Fade();
        return f.mapEndHSL(hsl => {
            hsl.luminosity *= .75;
            hsl.saturation *= .9;
            return hsl;
        });
    }

    //% fixedInstance whenUsed block="brighten"
    export const Brighten = new FadeEffect("brighten", brightenEffect, "darken");
    function brightenEffect() {
        const f = new Fade();
        return f.mapEndHSL(hsl => {
            hsl.luminosity /= .75;
            hsl.saturation /= .9;
            return hsl;
        });
    }

    //% fixedInstance whenUsed block="rotate palette"
    export const RotatePalette = new FadeEffect("rotate", () => {
        const l = availableColors();
        const p = color._clone(currentPalette())

        const lastColor = p.color(l - 1);
        for (let i = l - 1; i > 1; --i) {
            p.setColor(i, p.color(i - 1));
        }
        p.setColor(1, lastColor);

        return (new Fade())
            .setEndPalette(p);
    });
}