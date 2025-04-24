/**
 * @fileoverview Type definitions for scene-related interfaces and types
 */

import { Orientation } from '../geometry/orientation';

/**
 * Interface for data passed between scenes
 */
export interface InterSceneData {
  /** The name of the scene the player is coming from */
  comesFrom: string;
}

/**
 * Interface for map object properties
 */
export interface MapObjectProperties {
  scene?: string;
  comesBackFrom?: Orientation;
  message?: string;
  type?: string;
  shouldWander?: string;
  combatMode?: string;
}

/**
 * Type for tilemap objects with our custom properties
 */
export interface CustomTilemapObject extends Phaser.GameObjects.GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  properties: MapObjectProperties;
}

/**
 * Interface for map layers
 */
export interface MapLayers {
  terrain: Phaser.Tilemaps.TilemapLayer;
  deco: Phaser.Tilemaps.TilemapLayer;
  bridge: Phaser.Tilemaps.TilemapLayer;
}

/**
 * Interface for keyboard input state
 */
export interface KeyState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  space: boolean;
  shift: boolean;
  esc: boolean;
} 