/**
 * @fileoverview Interfaces for entity class hierarchy
 */

import { EntityType } from '../../constants/entities';

/**
 * Interface for non-player entities
 */
export interface INonPlayerEntity {
  /** Entity type identifier */
  readonly entityType: EntityType;
  
  /** Updates entity state and behavior */
  updateEntity(): void;
  
  /** Returns if the entity is active */
  isActive(): boolean;
  
  /** Activates or deactivates the entity */
  setActive(active: boolean): void;
  
  /** Dialog key for conversation system (for friendly entities) */
  readonly dialogKey?: string;
  
  /** Handles player interaction with the entity (for friendly entities) */
  interact?(): void;
  
  /** Current health points (for hostile entities) */
  readonly hp?: number;
  
  /** Attack damage value (for hostile entities) */
  readonly attackDamage?: number;
  
  /** Enemy performs attack (for hostile entities) */
  attack?(): void;
  
  /** Enemy loses health points (for hostile entities) */
  loseHp?(damage: number): void;

  /** X position on the game world */
  readonly x: number;
  
  /** Y position on the game world */
  readonly y: number;
  
  /** Whether this entity is currently active */
  readonly active: boolean;
  
  /** Body property from Phaser physics system */
  readonly body: Phaser.Physics.Arcade.Body;
} 