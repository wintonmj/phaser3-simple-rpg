/**
 * @fileoverview Game manager scene that handles game state and registry.
 * Manages player health, events, and scene coordination.
 */

import { REGISTRY_KEYS } from '../constants/registry';
import { SCENES } from '../constants/scenes';
import { EVENTS } from '../constants/events';

/**
 * Game manager scene that handles game state and registry.
 * Manages player health, events, and scene coordination.
 * 
 * @class GameManager
 * @extends {Phaser.Scene}
 */
export class GameManager extends Phaser.Scene {
  /**
   * Creates an instance of GameManager.
   * Initializes the scene with the appropriate scene key.
   */
  constructor() {
    super(SCENES.GAME_MANAGER);
  }

  /**
   * Gets the player's current health points from the registry.
   * 
   * @returns {number} The player's current health points
   */
  public get playerHp(): number {
    return this.registry.get(REGISTRY_KEYS.PLAYER.HP);
  }

  /**
   * Sets the player's health points in the registry and emits an update event.
   * 
   * @param {number} newHp - The new health points value
   */
  public set playerHp(newHp: number) {
    this.registry.set(REGISTRY_KEYS.PLAYER.HP, newHp);
    this.events.emit(EVENTS.UPDATE_HP);
  }

  /**
   * Creates the game manager scene and launches the HUD scene.
   */
  protected create() {
    this.scene.launch(SCENES.HUD);
  }
}
