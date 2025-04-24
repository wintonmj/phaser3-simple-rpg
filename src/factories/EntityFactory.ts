/**
 * @fileoverview Factory for creating game entities using behavior composition
 */

import { AbstractScene } from '../scenes/AbstractScene';
import { ENTITIES, EntityType } from '../constants/entities';
import { Player } from '../game-objects/Player';
import { Treant } from '../game-objects/enemies/Treant';
import { Mole } from '../game-objects/enemies/Mole';
import { INonPlayerEntity } from '../types/entities/entity-interfaces';
import { getDimensionsForEntity } from '../constants/entity-animations';
import { Character } from '../game-objects/Character';
import { NonPlayerEntity } from '../game-objects/entities/NonPlayerEntity';
import { GokuNPC } from '../game-objects/npcs/GokuNPC';

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
    const player = new Player(this.scene, x, y);
    this.applyEntityScale(player, ENTITIES.PLAYER);
    return player;
  }

  /**
   * Create a non-player entity of the specified type
   * @param type - Entity type identifier from ENTITIES constant
   * @param x - X position
   * @param y - Y position
   * @returns The created entity or null if invalid type
   */
  public createEntity(type: string, x: number, y: number): INonPlayerEntity | null {
    let entity: INonPlayerEntity | null = null;
    
    // Hostile entity types
    if (type === ENTITIES.TREANT) {
      entity = this.createTreant(x, y);
    }
    else if (type === ENTITIES.MOLE) {
      entity = this.createMole(x, y);
    }
    // Friendly entity types
    else if (type === ENTITIES.GOKU) {
      entity = this.createGoku(x, y);
    }
    else if (type === ENTITIES.WIZARD) {
      // This would be implemented when Wizard NPC is added
      console.warn('Wizard entity creation not yet implemented');
      return null;
    }
    else if (type === ENTITIES.FEMALE_VILLAGER) {
      // This would be implemented when FemaleVillager NPC is added
      console.warn('Female Villager entity creation not yet implemented');
      return null;
    }
    else {
      console.warn(`EntityFactory: Unknown entity type "${type}"`);
      return null;
    }
    
    // Apply scale if entity was created
    if (entity) {
      this.applyEntityScale(entity as NonPlayerEntity, type as EntityType);
    }
    
    return entity;
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
  
  /**
   * Create a Goku NPC entity
   * @param x - X position
   * @param y - Y position
   * @returns Goku NPC entity
   */
  private createGoku(x: number, y: number): GokuNPC {
    return new GokuNPC(this.scene, x, y);
  }
  
  /**
   * Apply the appropriate scale from ENTITY_DIMENSIONS to an entity
   * @param entity - The entity to apply scale to
   * @param entityType - The type of entity
   */
  private applyEntityScale(entity: Character, entityType: EntityType): void {
    const dimensions = getDimensionsForEntity(entityType);
    if (dimensions.scale !== undefined) {
      entity.setScale(dimensions.scale);
    }
  }
} 