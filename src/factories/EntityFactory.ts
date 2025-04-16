/**
 * @fileoverview Factory for creating game entities using behavior composition
 */

import { AbstractScene } from '../scenes/AbstractScene';
import { ENTITIES } from '../constants/entities';
import { Player } from '../game-objects/Player';
import { Treant } from '../game-objects/enemies/Treant';
import { Mole } from '../game-objects/enemies/Mole';
import { INonPlayerEntity } from '../types/entities/entity-interfaces';

/**
 * Factory for creating game entities
 * 
 * Centralizes entity creation logic and dependencies to make the system more extensible.
 * Uses behavior composition to define entity behaviors.
 */
export class EntityFactory {
  private scene: AbstractScene;

  /**
   * Create a new EntityFactory
   * @param scene - The scene to create entities in
   */
  constructor(scene: AbstractScene) {
    this.scene = scene;
  }

  /**
   * Create player entity
   * @param x - X position
   * @param y - Y position
   * @returns Newly created player
   */
  public createPlayer(x: number, y: number): Player {
    return new Player(this.scene, x, y);
  }

  /**
   * Create a non-player entity of the specified type
   * @param type - Entity type identifier from ENTITIES constant
   * @param x - X position
   * @param y - Y position
   * @returns The created entity or null if invalid type
   */
  public createEntity(type: string, x: number, y: number): INonPlayerEntity | null {
    // Hostile entity types
    if (type === ENTITIES.TREANT) {
      return this.createTreant(x, y);
    }
    if (type === ENTITIES.MOLE) {
      return this.createMole(x, y);
    }
    
    // Friendly entity types
    if (type === ENTITIES.GOKU) {
      // This would be implemented when Goku NPC is added
      console.warn('Goku entity creation not yet implemented');
      return null;
    }
    if (type === ENTITIES.WIZARD) {
      // This would be implemented when Wizard NPC is added
      console.warn('Wizard entity creation not yet implemented');
      return null;
    }
    if (type === ENTITIES.FEMALE_VILLAGER) {
      // This would be implemented when FemaleVillager NPC is added
      console.warn('Female Villager entity creation not yet implemented');
      return null;
    }
    
    console.warn(`EntityFactory: Unknown entity type "${type}"`);
    return null;
  }

  /**
   * Create a Treant entity
   * @param x - X position
   * @param y - Y position
   * @returns Treant entity
   */
  private createTreant(x: number, y: number): Treant {
    return new Treant(this.scene, x, y);
  }

  /**
   * Create a Mole entity
   * @param x - X position
   * @param y - Y position
   * @returns Mole entity
   */
  private createMole(x: number, y: number): Mole {
    return new Mole(this.scene, x, y);
  }
} 