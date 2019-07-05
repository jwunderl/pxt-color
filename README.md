# pxt-color

## set palette

Dynamically set all or part of the game's current palette

@param palette The colors to set
@param start [optional] The index to start setting colors at (by default, 0)
@param length [optional] The number of colors to copy (by default, all)
@param pOffset [optional] The offset to start copying from the palette (by default, 0)

## fade from palette to palette

Create a Fade from one palette to another that occurs over the given duration

@param start the palette to start from
@param end the palette to end at
@param duration [optional] how long it should take (by default, 2 seconds)

## apply fade effect

Apply an effect to alter the screen's color palette.

@param duration how long the effect should take (by default, 2 seconds)

## pause until current fade done

Pause until the current fade is completed. This can be useful when you want a fade to occur after another has completed.

## clear fade effect

Clear the last fade effect, by resetting the palette to what it was before that effect.

## Supported targets

* for PXT/arcade
(The metadata above is needed for package search.)
