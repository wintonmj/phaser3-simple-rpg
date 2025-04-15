/**
 * @fileoverview Map manager for tilemap creation and layer management
 */

import { IMapManager } from '../types/manager-interfaces';
import { MapLayers } from '../types/scene-types';
import { ASSETS } from '../constants/assets';
import { MAP_CONTENT_KEYS } from '../constants/map-content-keys';
import { BaseManager } from './BaseManager';

/**
 * Manages map creation and layer operations
 */
export class MapManager extends BaseManager implements IMapManager {
  private map: Phaser.Tilemaps.Tilemap;
  private layers: MapLayers;

  /**
   * Create a new MapManager
   * @param scene - The scene this manager belongs to
   */
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  /**
   * Initialize the map with layers
   * @param mapKey - The key for the map asset
   */
  public initialize(mapKey: string): void {
    this.createMapWithLayers(mapKey);
  }

  /**
   * Get the created tilemap
   */
  public getMap(): Phaser.Tilemaps.Tilemap {
    return this.map;
  }

  /**
   * Get map layers
   */
  public getLayers(): MapLayers {
    return this.layers;
  }

  /**
   * Get spawn points for various entities from object layers
   * @param layerName - The name of the object layer
   */
  public getObjectLayer(layerName: string): Phaser.Tilemaps.ObjectLayer | undefined {
    return this.map.objects.find(o => o.name === layerName);
  }

  /**
   * Create map and its layers
   */
  private createMapWithLayers(mapKey: string): void {
    this.map = this.scene.make.tilemap({ key: mapKey });
    const tileset = this.map.addTilesetImage(ASSETS.TILESET, ASSETS.IMAGES.TILES, 16, 16, 0, 0);

    if (!tileset) {
      console.error(`Failed to load tileset ${ASSETS.TILESET}`);
      return;
    }

    this.layers = {
      terrain: this.map.createLayer(MAP_CONTENT_KEYS.layers.BACKGROUND, tileset, 0, 0),
      deco: this.map.createLayer(MAP_CONTENT_KEYS.layers.DECORATION, tileset, 0, 0),
      bridge: this.map.createLayer(MAP_CONTENT_KEYS.layers.BRIDGE, tileset, 0, 0),
    };

    // Optimize tilemap layers
    Object.values(this.layers).forEach(layer => {
      // Enable layer culling to avoid drawing offscreen tiles
      layer.setCullPadding(1, 1);
      layer.setVisible(true);
    });

    // Only add collisions to tiles that actually need them
    this.layers.terrain.setCollisionByProperty({ collides: true });
    this.layers.deco.setCollisionByProperty({ collides: true });
  }

  /**
   * Clean up resources when scene is shutdown
   */
  public shutdown(): void {
    // No specific resources to clean up for the map
    // Phaser handles tilemap destruction automatically
  }
} 