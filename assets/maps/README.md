# Map Files Documentation

## Directory Structure

This directory contains all map-related assets for the game. The files are organized as follows:

```
maps/
├── tilemap.json      # JSON export of the first level map
├── second-map.json   # JSON export of the second level map
├── map.tmx          # Tiled Map Editor source file for first level
└── second-map.tmx   # Tiled Map Editor source file for second level
```

## File Relationships

### .tmx and .json Files

- `.tmx` files are the native format used by Tiled Map Editor
  - These are XML-based files containing the complete map data
  - Used for editing maps in Tiled Map Editor
  - Not directly used by the game

- `.json` files are the exported versions used by Phaser
  - These are the actual files loaded by the game
  - Created by exporting from Tiled Map Editor
  - More efficient for web-based games
  - Easier to parse in JavaScript/TypeScript

### File Pairs

1. First Level:
   - `map.tmx` - Source file for editing in Tiled
   - `tilemap.json` - Exported file used by the game

2. Second Level:
   - `second-map.tmx` - Source file for editing in Tiled
   - `second-map.json` - Exported file used by the game

## Code Integration

The map files are referenced in the game code through the `maps.ts` constants file:

```typescript
export const MAPS = {
  firstLevel: {
    file: 'maps/tilemap.json',
    key: 'first-level',
  },
  secondLevel: {
    file: 'maps/second-map.json',
    key: 'second-level',
  },
} as const;
```

These paths are used by the Preloader scene to load the maps into the game.

## Important Notes

- Keep both .tmx and .json files in sync when making map changes
- Always edit maps in Tiled Map Editor using the .tmx files
- After making changes in Tiled, export to .json to update the game
- The .tmx files are kept for future map editing purposes
