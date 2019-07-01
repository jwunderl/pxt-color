namespace color {
    /**
     * The default palette buffer for the project
     */
    //% whenUsed
    export const defaultPalette = bufferToPalette(hex`__palette`);

    //% whenUsed
    export const Adafruit = hexArrayToPalette([
        0x000000,
        0x17ABFF,
        0xDF2929,
        0xC600FF,
        0xFF007D,
        0x00FF72,
        0xe5FF00,
        0x0034FF,
        0xFFFFFF,
        0x00EFFF,
        0xFF0000,
        0x7400DB,
        0x636363,
        0xFF7a00,
        0x2D9F00,
        0x000000
    ]);

    //% whenUsed
    export const Arcade = hexArrayToPalette([
        0x000000,
        0xFFFFFF,
        0xFF2121,
        0xFF93C4,
        0xFF8135,
        0xFFF609,
        0x249CA3,
        0x78DC52,
        0x003FAD,
        0x87F2FF,
        0x8E2EC4,
        0xA4839F,
        0x5C406c,
        0xE5CDC4,
        0x91463d,
        0x000000
    ]);

    //% whenUsed
    export const Matte = hexArrayToPalette([
        0x000000,
        0x1D2B53,
        0x7E2553,
        0x008751,
        0xAB5236,
        0x5F574F,
        0xC2C3C7,
        0xFFF1E8,
        0xFF004D,
        0xFFA300,
        0xFFEC27,
        0x00E436,
        0x29ADFF,
        0x83769C,
        0xFF77A8,
        0xFFCCAA
    ]);

    //% whenUsed
    export const GrayScale = hexArrayToPalette([
        0x000000,
        0xFFFFFF,
        0xEDEDED,
        0xDBDBDB,
        0xC8C8C8,
        0xB6B6B6,
        0xA4A4A4,
        0x929292,
        0x808080,
        0x6D6D6D,
        0x5B5B5B,
        0x494949,
        0x373737,
        0x242424,
        0x121212,
        0x000000
    ]);

    //% whenUsed
    export const Black = color.gradient(0x000000, 0x000000, 16);

    //% whenUsed
    export const White = color.gradient(0xFFFFFF, 0xFFFFFF, 16)
} 