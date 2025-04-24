# TODO: Sprite Loading Optimizations

## Linear Texture Filtering for Goku

The game uses a special texture filtering optimization for the Goku sprite to improve its appearance when scaled:

- Goku's texture uses `Phaser.Textures.LINEAR` filter method instead of the default nearest-neighbor filtering that other sprites use
- This provides smoother scaling rather than the sharp pixelated scaling used for other pixel art sprites
- The implementation can be found in `src/behaviors/animation/BaseEntityAnimation.ts` in the `setupAnimations()` method

## Current Implementation

- The game configuration in `src/index.ts` has `pixelArt: true` and a `resolution` of 2, which normally makes all textures use nearest-neighbor filtering (for crisp pixel art)
- Goku sprite is one of the larger sprites in the game (64x64 according to `ENTITY_DIMENSIONS`), while most other entities are smaller (32x32)
- The special optimization for Goku allows the character to have smoother edges when scaled, rather than the typical blocky pixelated look

## Technical Details

- The special filtering is applied in `BaseEntityAnimation.setupAnimations()` when:
  - The entity type is `ENTITIES.GOKU`
  - The character has data flag `usingGokuAnimations` set to true
  - The animation sets being used are `GOKU_ANIMATIONS`
- This is a deliberate design choice where most characters maintain their pixel art style, but Goku gets a smoother appearance through linear texture filtering
- The code uses `Phaser.Textures.LINEAR` for Goku, which overrides the global `pixelArt: true` setting just for this specific texture

## Future Improvements

- [ ] Consider adding a configuration option to toggle texture filtering per entity type
- [ ] Document the visual differences between LINEAR and NEAREST texture filtering in the game's art style guide
- [ ] Evaluate performance impact of using different texture filtering methods for different sprites
- [ ] Create a utility function to easily apply texture filtering optimizations to other larger sprites 