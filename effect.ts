namespace color {
    
    //% fixedInstance whenUsed block="fade to black"
    export const fadeToBlack = new FadeEffect(() => {
        return new Fade()
            .setEndPalette(Black);
    });

    //% fixedInstance whenUsed block="fade to white"
    export const fadeToWhite = new FadeEffect(() => {
        return new Fade()
            .setEndPalette(White);
    });
}