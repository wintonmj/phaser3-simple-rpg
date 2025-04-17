import { Character } from '../game-objects/Character';
import { Orientation } from '../geometry/orientation';
import { AbstractScene } from '../scenes/AbstractScene';

// Define a flexible attack context
export interface AttackContext {
  source: Character;           // Character performing the attack
  direction: Orientation;      // Direction of attack
  target?: Character;          // Optional specific target
  position?: { x: number, y: number }; // Optional position for targeted attacks
  scene: AbstractScene;        // Reference to scene for creating effects/projectiles
} 