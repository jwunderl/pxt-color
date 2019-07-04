namespace color {
    /**
     * The original palette buffer for the project
     * 
     * This **must** be defined first in this file because others palettes
     * may be defined relative to this palette
     */
    //% fixedInstance whenUsed block="original"
    export const originalPalette = bufferToPalette(hex`__palette`);

    //% fixedInstance whenUsed block="adafruit"
    export const Adafruit = bufferToPalette(hex`
        000000
        17ABFF
        DF2929
        C600FF
        FF007D
        00FF72
        e5FF00
        0034FF
        FFFFFF
        00EFFF
        FF0000
        7400DB
        636363
        FF7a00
        2D9F00
        000000
    `);

    //% fixedInstance whenUsed block="matte"
    export const Matte = bufferToPalette(hex`
        000000
        1D2B53
        7E2553
        008751
        AB5236
        5F574F
        C2C3C7
        FFF1E8
        FF004D
        FFA300
        FFEC27
        00E436
        29ADFF
        83769C
        FF77A8
        FFCCAA
    `);

    //% fixedInstance whenUsed block="gray scale"
    export const GrayScale = bufferToPalette(hex`
        000000
        FFFFFF
        EDEDED
        DBDBDB
        C8C8C8
        B6B6B6
        A4A4A4
        929292
        808080
        6D6D6D
        5B5B5B
        494949
        373737
        242424
        121212
        000000
    `);

    // https://lospec.com/palette-list/poke14
    //% fixedInstance whenUsed block="poke"
    export const Poke = bufferToPalette(hex`
        000000
        ffffff
        e8958b
        d45362
        612431
        f5dc8c
        cc8945
        8f3f29
        c0fac2
        5dd48f
        417d53
        6cadeb
        5162c2
        24325e
        1b1221
        000000
    `);

    // https://lospec.com/palette-list/warioware-diy
    //% fixedInstance whenUsed block="DIY"
    export const DIY = bufferToPalette(hex`
        000000
        ffffff
        f8d898
        f8a830
        c04800
        f80000
        c868e8
        10c0c8
        2868c0
        089050
        70d038
        f8f858
        787878
        c0c0c0
        f8f8f8
        000000
    `);

    // https://lospec.com/palette-list/still-life
    //% fixedInstance whenUsed block="still life"
    export const StillLife = bufferToPalette(hex`
        000000
        3f2811
        7a2222
        d13b27
        e07f8a
        5d853a
        68c127
        b3e868
        122615
        513155
        286fb8
        9b8bff
        a8e4d4
        cc8218
        c7b581
        000000
    `);

    // https://lospec.com/palette-list/steam-lords, missing 0xa0b9ba
    //% fixedInstance whenUsed block="steam punk"
    export const SteamPunk = bufferToPalette(hex`
        000000
        213b25
        3a604a
        4f7754
        a19f7c
        77744f
        775c4f
        603b3a
        3b2137
        170e19
        2f213b
        433a60
        4f5277
        65738c
        7c94a1
        c0d1cc
    `)

    // https://lospec.com/palette-list/sweetie-16, missing 0x73eff7
    //% fixedInstance whenUsed block="sweet"
    export const Sweet = bufferToPalette(hex`
        000000
        1a1c2c
        5d275d
        b13e53
        ef7d57
        ffcd75
        a7f070
        38b764
        257179
        29366f
        3b5dc9
        41a6f6
        f4f4f4
        94b0c2
        566c86
        333c57
    `);

    // https://lospec.com/palette-list/na16, missing 0x70377f
    //% fixedInstance whenUsed block="adventure"
    export const Adventure = bufferToPalette(hex`
        000000
        8c8fae
        584563
        3e2137
        9a6348
        d79b7d
        f5edba
        c0c741
        647d34
        e4943a
        9d303b
        d26471
        7ec4c1
        34859d
        17434b
        1f0e1c
    `);

    //% fixedInstance whenUsed block="arcade"
    export const Arcade = bufferToPalette(hex`
        000000
        FFFFFF
        FF2121
        FF93C4
        FF8135
        FFF609
        249CA3
        78DC52
        003FAD
        87F2FF
        8E2EC4
        A4839F
        5C406c
        E5CDC4
        91463d
        000000
    `);

    //% fixedInstance whenUsed block="black"
    export const Black = bufferToPalette(hex`
        000000
        000000
        000000
        000000
        000000
        000000
        000000
        000000
        000000
        000000
        000000
        000000
        000000
        000000
        000000
        000000
    `);

    //% fixedInstance whenUsed block="white"
    export const White = bufferToPalette(hex`
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
        FFFFFF
    `);
} 