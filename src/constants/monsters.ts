export const ENTITIES = {
  HOSTILE: {
    TREANT: 'treant',
    MOLE: 'mole',
    // Future hostile entities...
  },
  FRIENDLY: {
    GOKU: 'goku',
    VILLAGER: 'villager',
    // Future friendly entities...
  }
} as const;

// Keep the original export for backward compatibility during refactoring
export const MONSTERS = {
  mole: ENTITIES.HOSTILE.MOLE,
  treant: ENTITIES.HOSTILE.TREANT,
} as const;
