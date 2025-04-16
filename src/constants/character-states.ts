/**
 * Centralized definition of character states for animation and behavior
 * This enum should be the single source of truth for all character states in the game
 */
export enum CharacterState {
  // Base states
  IDLE = 'idle',
  MOVE = 'move',
  DEATH = 'death',
  
  // Combat states
  ATTACK = 'attack',
  HIT = 'hit',
  
  // Weapon states
  RELOADING = 'reloading',
  SHOOTING = 'shooting',
  PUNCHING = 'punching',
  
  // Can be expanded with other categories as needed
  // ...
} 