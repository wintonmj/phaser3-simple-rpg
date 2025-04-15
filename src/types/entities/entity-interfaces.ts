/**
 * @fileoverview Interfaces for entity class hierarchy
 */

import { EntityType, FriendlyEntityType, HostileEntityType } from '../../constants/entities';

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
}

/**
 * Interface for friendly entities (NPCs)
 */
export interface IFriendlyEntity extends INonPlayerEntity {
  /** Friendly entity type identifier */
  readonly entityType: FriendlyEntityType;
  
  /** Dialog key for conversation system */
  readonly dialogKey?: string;
  
  /** Handles player interaction with the entity */
  interact(): void;
}

/**
 * Interface for hostile entities (monsters)
 */
export interface IHostileEntity extends INonPlayerEntity {
  /** Hostile entity type identifier */
  readonly entityType: HostileEntityType;
  
  /** Current health points */
  readonly hp: number;
  
  /** Attack damage value */
  readonly attackDamage: number;
  
  /** Enemy performs attack */
  attack(): void;
  
  /** Enemy loses health points */
  loseHp(damage: number): void;
} 