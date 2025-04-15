export const ENTITIES = {
  HOSTILE: {
    TREANT: 'treant',
    MOLE: 'mole',
    // Future hostile entities...
  },
  FRIENDLY: {
    GOKU: 'goku',
    WIZARD: 'wizard',
    FEMALE_VILLAGER: 'female_villager',
    // Future friendly entities...
  }
} as const;

// Keep the original export for backward compatibility during refactoring
export const MONSTERS = {
  mole: ENTITIES.HOSTILE.MOLE,
  treant: ENTITIES.HOSTILE.TREANT,
} as const;

// Type definitions for entity types
export type HostileEntityType = typeof ENTITIES.HOSTILE[keyof typeof ENTITIES.HOSTILE];
export type FriendlyEntityType = typeof ENTITIES.FRIENDLY[keyof typeof ENTITIES.FRIENDLY];
export type EntityType = HostileEntityType | FriendlyEntityType;
