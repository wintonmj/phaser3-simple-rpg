export const ENTITIES = {
  PLAYER: 'player',
  TREANT: 'treant',
  MOLE: 'mole',
  GOKU: 'goku',
  WIZARD: 'wizard',
  FEMALE_VILLAGER: 'female_villager',
} as const;

// Define the entity type as a union of all possible entity values
export type EntityType = typeof ENTITIES[keyof typeof ENTITIES];
