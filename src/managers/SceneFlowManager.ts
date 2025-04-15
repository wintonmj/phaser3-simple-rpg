/**
 * @fileoverview Scene flow manager for handling scene transitions and zones
 */

import { ISceneFlowManager } from '../types/manager-interfaces';
import { Player } from '../game-objects/Player';
import { Orientation } from '../geometry/orientation';
import { InterSceneData, CustomTilemapObject } from '../types/scene-types';
import { MAP_CONTENT_KEYS } from '../constants/map-content-keys';
import { BaseManager } from './BaseManager';

/** Default player starting position */
const PLAYER_INITIAL_POSITION = {
  x: 50,
  y: 200,
};

/** Distance to shift player when transitioning between scenes */
const SCENE_TRANSITION_SHIFT = 50;

/**
 * Manages scene transitions and zones
 */
export class SceneFlowManager extends BaseManager implements ISceneFlowManager {
  private map: Phaser.Tilemaps.Tilemap;
  private player: Player;
  private transitionZones: Phaser.GameObjects.Zone[] = [];

  /**
   * Create a new SceneFlowManager
   * @param scene - The scene this manager belongs to
   */
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  /**
   * Initialize scene transition zones
   * @param map - The tilemap containing zone data
   * @param player - The player object for overlap detection
   */
  public initialize(map: Phaser.Tilemaps.Tilemap, player: Player): void {
    this.map = map;
    this.player = player;
    this.setupTransitionZones();
  }

  /**
   * Set up scene transition zones from map data
   */
  public setupTransitionZones(): void {
    const levelChangerObjectLayer = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.ZONES,
    );

    if (levelChangerObjectLayer) {
      this.transitionZones = levelChangerObjectLayer.objects.map((o) => {
        const zoneObject = o as unknown as CustomTilemapObject;
        const zone = this.scene.add.zone(
          zoneObject.x, 
          zoneObject.y, 
          zoneObject.width, 
          zoneObject.height
        );
        
        // Zone needs physics but doesn't need to move or use gravity
        this.scene.physics.add.existing(zone, true); // true = static body
        
        // Store transition data on zone for reuse
        zone.setData('targetScene', zoneObject.properties.scene);
        
        // Create overlap handler with debounce mechanism to prevent multiple triggers
        let canTransition = true;
        
        // Add the overlap check
        this.scene.physics.add.overlap(zone, this.player, () => {
          if (canTransition) {
            canTransition = false;
            this.scene.scene.start(zone.getData('targetScene'), { comesFrom: this.scene.scene.key });
          }
        });
        
        return zone;
      });
    }
  }

  /**
   * Get player's initial position based on where they came from
   * @param sceneData - Data from the previous scene
   */
  public getPlayerInitialPosition(sceneData: InterSceneData): Phaser.Math.Vector2 {
    if (!sceneData?.comesFrom) {
      return new Phaser.Math.Vector2(PLAYER_INITIAL_POSITION.x, PLAYER_INITIAL_POSITION.y);
    }

    const levelChangerObjectLayer = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.ZONES,
    );

    if (!levelChangerObjectLayer) {
      return new Phaser.Math.Vector2(PLAYER_INITIAL_POSITION.x, PLAYER_INITIAL_POSITION.y);
    }

    const levelChanger = levelChangerObjectLayer.objects.find(
      (o) => (o as unknown as CustomTilemapObject).properties.scene === sceneData.comesFrom,
    ) as unknown as CustomTilemapObject;

    if (!levelChanger) {
      return new Phaser.Math.Vector2(PLAYER_INITIAL_POSITION.x, PLAYER_INITIAL_POSITION.y);
    }

    const shift = this.calculateTransitionShift(levelChanger.properties.comesBackFrom || Orientation.Down);
    
    return new Phaser.Math.Vector2(
      levelChanger.x + levelChanger.width / 2 + shift.x,
      levelChanger.y + levelChanger.height / 2 + shift.y
    );
  }

  /**
   * Calculate the position shift when transitioning between scenes
   * @param orientation - Direction the player is coming from
   */
  public calculateTransitionShift(orientation: Orientation): Phaser.Math.Vector2 {
    switch (orientation) {
      case Orientation.Right:
        return new Phaser.Math.Vector2(SCENE_TRANSITION_SHIFT, 0);
      case Orientation.Left:
        return new Phaser.Math.Vector2(-SCENE_TRANSITION_SHIFT, 0);
      case Orientation.Up:
        return new Phaser.Math.Vector2(0, -SCENE_TRANSITION_SHIFT);
      case Orientation.Down:
        return new Phaser.Math.Vector2(0, SCENE_TRANSITION_SHIFT);
      default:
        return new Phaser.Math.Vector2(0, 0);
    }
  }

  /**
   * Clean up transition zones and resources
   */
  public shutdown(): void {
    // Destroy transition zones
    this.transitionZones.forEach(zone => {
      if (zone.active) {
        zone.destroy();
      }
    });
    
    // Clear collection
    this.transitionZones = [];
  }
} 