/**
 * @fileoverview Abstract base scene class that provides common functionality for all game scenes.
 * This class handles map creation, player initialization, camera setup, and basic game mechanics.
 * 
 */

// Type imports
import { InterSceneData, MapLayers } from '../types/scene-types';

// Game object imports
import { Player } from '../game-objects/Player';
import { NonPlayerEntity } from '../game-objects/entities/NonPlayerEntity';

// Manager imports
import { MapManager } from '../managers/MapManager';
import { EntityManager } from '../managers/EntityManager';
import { SpatialManager } from '../managers/SpatialManager';
import { PhysicsManager } from '../managers/PhysicsManager';
import { InputManager } from '../managers/InputManager';
import { CameraManager } from '../managers/CameraManager';
import { SceneFlowManager } from '../managers/SceneFlowManager';

/**
 * Abstract base class for all game scenes.
 * Provides common functionality for map creation, player initialization, and game mechanics.
 */
export abstract class AbstractScene extends Phaser.Scene {
  /** Map for the scene */
  private mapManager: MapManager;
  /** Entity management (player, NPCs, monsters) */
  private entityManager: EntityManager;
  /** Spatial partitioning and entity culling */
  private spatialManager: SpatialManager;
  /** Physics and collision handling */
  private physicsManager: PhysicsManager;
  /** Input processing */
  private inputManager: InputManager;
  /** Camera management */
  private cameraManager: CameraManager;
  /** Scene transitions and flow */
  private sceneFlowManager: SceneFlowManager;
  
  /** Map key for the scene */
  public mapKey: string;

  /** References to important game objects (for backward compatibility) */
  public player: Player;
  public cursors: CursorKeys;
  public map: Phaser.Tilemaps.Tilemap;
  public layers: MapLayers;
  public monsters: NonPlayerEntity[] = [];
  public monsterGroup: Phaser.Physics.Arcade.Group;

  /**
   * Creates an instance of AbstractScene.
   * @param key - The scene key
   * @param mapKey - The key for the map asset
   */
  constructor(key: string, mapKey: string) {
    super(key);
    this.mapKey = mapKey;
  }

  /**
   * Main update loop - delegates to specialized managers
   */
  public update(): void {
    // Update input state
    this.inputManager.update();
    
    // Update entity positions and states
    this.entityManager.update();
    
    // Update camera
    this.cameraManager.update();
    
    // Update spatial partitioning
    this.spatialManager.update(
      this.cameraManager.getCameraBounds(),
      new Phaser.Math.Vector2(this.player.x, this.player.y)
    );
    
    // Process batched physics operations
    this.physicsManager.processBatchedPhysics();
  }

  /**
   * Scene shutdown handler - delegates to all managers
   */
  public shutdown(): void {
    // Clean up in reverse order of dependency
    this.sceneFlowManager.shutdown();
    this.inputManager.shutdown();
    this.cameraManager.shutdown();
    this.physicsManager.shutdown();
    this.spatialManager.shutdown();
    this.entityManager.shutdown();
    this.mapManager.shutdown();
  }

  /**
   * Initialize the scene - create and initialize all managers
   */
  protected init(data: InterSceneData): void {
    // Initialize all manager instances
    this.initializeManagers();
    
    // Initialize managers in dependency order
    this.mapManager.initialize(this.mapKey);
    
    // Store references for backward compatibility
    this.map = this.mapManager.getMap();
    this.layers = this.mapManager.getLayers();
    
    // Initialize spatial manager with map dimensions
    this.spatialManager.initialize(this.map.widthInPixels, this.map.heightInPixels);
    
    // Setup physics world
    this.physicsManager.initialize(this.map.widthInPixels, this.map.heightInPixels);
    
    // Initialize entities
    this.entityManager.initialize(this.map, data);
    
    // Store references for backward compatibility
    this.player = this.entityManager.getPlayer();
    this.monsters = this.entityManager.getMonsters();
    
    // Register entities with spatial manager
    this.spatialManager.registerEntities([
      this.player,
      ...this.monsters
    ]);
    
    // Set up physics colliders
    this.physicsManager.setupColliders(
      this.player,
      this.layers,
      this.monsters
    );
    
    // Store monsterGroup for backward compatibility
    this.monsterGroup = this.physicsManager.createGroup(this.monsters);
    
    // Initialize scene transitions
    this.sceneFlowManager.initialize(this.map, this.player);
    
    // Initialize camera to follow player
    this.cameraManager.initialize(
      this.map.widthInPixels,
      this.map.heightInPixels,
      this.player
    );
    
    // Initialize input handling
    this.inputManager.initialize();
    
    // Set up keyboard shortcuts
    this.inputManager.setupKeyboardShortcuts(this);
    
    // Store cursors for backward compatibility
    this.cursors = this.inputManager.getCursors();
  }
  
  /**
   * Create manager instances
   */
  private initializeManagers(): void {
    this.mapManager = new MapManager(this);
    this.entityManager = new EntityManager(this);
    this.spatialManager = new SpatialManager(this);
    this.physicsManager = new PhysicsManager(this);
    this.inputManager = new InputManager(this);
    this.cameraManager = new CameraManager(this);
    this.sceneFlowManager = new SceneFlowManager(this);
  }

  /**
   * Get the input manager instance
   */
  public getInputManager(): InputManager {
    return this.inputManager;
  }
}
