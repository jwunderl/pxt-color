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
    export const White = color.gradient(0xFFFFFF, 0xFFFFFF, 16);

    // https://lospec.com/palette-list/poke14
    //% whenUsed
    export const Poke = hexArrayToPalette([
        0x000000,
        0xffffff,
        0xe8958b,
        0xd45362,
        0x612431,
        0xf5dc8c,
        0xcc8945,
        0x8f3f29,
        0xc0fac2,
        0x5dd48f,
        0x417d53,
        0x6cadeb,
        0x5162c2,
        0x24325e,
        0x1b1221,
        0x000000
    ]);

    // https://lospec.com/palette-list/warioware-diy
    //% whenUsed
    export const DIY = hexArrayToPalette([
        0x000000,
        0xffffff,
        0xf8d898,
        0xf8a830,
        0xc04800,
        0xf80000,
        0xc868e8,
        0x10c0c8,
        0x2868c0,
        0x089050,
        0x70d038,
        0xf8f858,
        0x787878,
        0xc0c0c0,
        0xf8f8f8,
        0x000000
    ]);

    // https://lospec.com/palette-list/still-life
    //% whenUsed
    export const StillLife = hexArrayToPalette([
        0x000000,
        0x3f2811,
        0x7a2222,
        0xd13b27,
        0xe07f8a,
        0x5d853a,
        0x68c127,
        0xb3e868,
        0x122615,
        0x513155,
        0x286fb8,
        0x9b8bff,
        0xa8e4d4,
        0xcc8218,
        0xc7b581,
        0x000000
    ]);

    // https://lospec.com/palette-list/steam-lords, missing 0xa0b9ba
    //% whenUsed
    export const SteamPunk = hexArrayToPalette([
        0x000000,
        0x213b25,
        0x3a604a,
        0x4f7754,
        0xa19f7c,
        0x77744f,
        0x775c4f,
        0x603b3a,
        0x3b2137,
        0x170e19,
        0x2f213b,
        0x433a60,
        0x4f5277,
        0x65738c,
        0x7c94a1,
        0xc0d1cc
    ])

    // https://lospec.com/palette-list/sweetie-16, missing 0x73eff7
    //% whenUsed
    export const Sweet = hexArrayToPalette([
        0x000000,
        0x1a1c2c,
        0x5d275d,
        0xb13e53,
        0xef7d57,
        0xffcd75,
        0xa7f070,
        0x38b764,
        0x257179,
        0x29366f,
        0x3b5dc9,
        0x41a6f6,
        0xf4f4f4,
        0x94b0c2,
        0x566c86,
        0x333c57
    ]);

    // https://lospec.com/palette-list/na16, missing 0x70377f
    //% whenUsed
    export const Adventure = hexArrayToPalette([
        0x000000,
        0x8c8fae,
        0x584563,
        0x3e2137,
        0x9a6348,
        0xd79b7d,
        0xf5edba,
        0xc0c741,
        0x647d34,
        0xe4943a,
        0x9d303b,
        0xd26471,
        0x7ec4c1,
        0x34859d,
        0x17434b,
        0x1f0e1c
    ]);
} 