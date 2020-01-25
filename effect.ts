namespace color {
    //% fixedInstance whenUsed block="fade to black"
    export const FadeToBlack = new FadeEffect(() => {
        return new Fade()
            .setEndPalette(Black);
    });

    //% fixedInstance whenUsed block="fade to white"
    export const FadeToWhite = new FadeEffect(() => {
        return new Fade()
            .setEndPalette(White);
    });

    //% fixedInstance whenUsed block="darken"
    export const Darken = new FadeEffect(() => {
        return new Fade()
            .mapEndRGB(rgb => {
                rgb.red -= 0x3F;
                rgb.green -= 0x3F;
                rgb.blue -= 0x3F;
                return rgb;
            });
    });

    //% fixedInstance whenUsed block="brighten"
    export const Brighten = new FadeEffect(() => {
        return new Fade()
            .mapEndRGB(rgb => {
                rgb.red += 0x3F;
                rgb.green += 0x3F;
                rgb.blue += 0x3F;
                return rgb;
            });
    });

    //% fixedInstance whenUsed block="rotate palette"
    export const RotatePalette = new FadeEffect(() => {
        const l = availableColors();
        const p = color._clone(currentPalette())

        const lastColor = p.color(l - 1);
        for (let i = l - 1; i > 1; --i) {
            p.setColor(i, p.color(i - 1));
        }
        p.setColor(1, lastColor);

        return new Fade()
            .setEndPalette(p);
    });
}