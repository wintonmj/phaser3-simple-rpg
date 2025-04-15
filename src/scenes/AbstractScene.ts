/**
 * @fileoverview Abstract base scene class that provides common functionality for all game scenes.
 * This class handles map creation, player initialization, camera setup, and basic game mechanics.
 */

// Core imports
import { Orientation } from '../geometry/orientation';
import { SCENES } from '../constants/scenes';
import { ASSETS } from '../constants/assets';
import { MAP_CONTENT_KEYS } from '../constants/map-content-keys';
import { MONSTERS } from '../constants/monsters';

// Game object imports
import { Player } from '../game-objects/Player';
import { Npc } from '../game-objects/Npc';
import { Monster } from '../game-objects/enemies/Monster';
import { Treant } from '../game-objects/enemies/Treant';
import { Mole } from '../game-objects/enemies/Mole';

// Type imports
import { InterSceneData, CustomTilemapObject, MapLayers, KeyState } from '../types/scene-types';

/** Camera lerp factor for smooth camera movement */
const CAMERA_LERP = 1;

/** Default player starting position */
const PLAYER_INITIAL_POSITION = {
  x: 50,
  y: 200,
};

/** Distance to shift player when transitioning between scenes */
const SCENE_TRANSITION_SHIFT = 50;

/** Distance threshold for monster updates (in pixels) */
const MONSTER_UPDATE_DISTANCE = 400;

/** Object pool sizes */
const POOL_SIZES = {
  PARTICLES: 50,
  PROJECTILES: 20,
};

/**
 * Abstract base class for all game scenes.
 * Provides common functionality for map creation, player initialization, and game mechanics.
 */
export abstract class AbstractScene extends Phaser.Scene {
  /** The player character */
  public player: Player;
  /** Keyboard input controls */
  public cursors: CursorKeys;
  /** Array of NPCs in the scene */
  public npcs: Npc[] = [];
  /** Array of monsters in the scene */
  public monsters: Monster[] = [];
  /** The tilemap for the scene */
  public map: Phaser.Tilemaps.Tilemap;
  /** Physics group for monsters */
  public monsterGroup: Phaser.Physics.Arcade.Group;
  /** Map layers for different terrain types */
  public layers: MapLayers;
  /** Key for the map asset */
  public mapKey: string;
  /** Keyboard state */
  private keyState: KeyState = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
    shift: false,
  };
  /** Scene transition zones */
  private transitionZones: Phaser.GameObjects.Zone[] = [];
  /** Single keyboard handler */
  private keyboardHandler: (event: KeyboardEvent) => void;
  /** Spatial grid for monster culling */
  private spatialGrid: Map<string, Monster[]> = new Map();
  /** Grid cell size for spatial partitioning */
  private gridCellSize = MONSTER_UPDATE_DISTANCE;
  /** Object pools */
  protected objectPools: Record<string, Phaser.GameObjects.Group> = {};
  /** Last known player grid position */
  private lastPlayerGridPos: { x: number; y: number } = { x: 0, y: 0 };

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
   * Main update loop
   */
  public update(): void {
    this.updateKeyState();
    
    // Only recalculate spatial grid when player moves to a new grid cell
    const gridX = Math.floor(this.player.x / this.gridCellSize);
    const gridY = Math.floor(this.player.y / this.gridCellSize);
    
    if (gridX !== this.lastPlayerGridPos.x || gridY !== this.lastPlayerGridPos.y) {
      this.lastPlayerGridPos = { x: gridX, y: gridY };
      this.updateSpatialGrid();
    }
    
    this.updateMonstersInRange();
    this.player.updatePlayer(this.keyState);
  }

  /**
   * Get current keyboard state
   */
  private updateKeyState(): void {
    this.keyState.left = this.cursors.left.isDown;
    this.keyState.right = this.cursors.right.isDown;
    this.keyState.up = this.cursors.up.isDown;
    this.keyState.down = this.cursors.down.isDown;
    this.keyState.space = this.cursors.space.isDown;
    this.keyState.shift = this.cursors.shift.isDown;
  }

  /**
   * Update spatial partitioning grid
   */
  private updateSpatialGrid(): void {
    this.spatialGrid.clear();
    
    this.monsters.forEach(monster => {
      const gridX = Math.floor(monster.x / this.gridCellSize);
      const gridY = Math.floor(monster.y / this.gridCellSize);
      const key = `${gridX},${gridY}`;
      
      if (!this.spatialGrid.has(key)) {
        this.spatialGrid.set(key, []);
      }
      
      const monsters = this.spatialGrid.get(key);
      if (monsters) {
        monsters.push(monster);
      }
    });
  }

  /**
   * Update only monsters within range of the player
   */
  private updateMonstersInRange(): void {
    // Get player's grid cell and adjacent cells
    const playerGridX = Math.floor(this.player.x / this.gridCellSize);
    const playerGridY = Math.floor(this.player.y / this.gridCellSize);
    
    // Check 3x3 grid of cells around player
    for (let x = playerGridX - 1; x <= playerGridX + 1; x++) {
      for (let y = playerGridY - 1; y <= playerGridY + 1; y++) {
        const key = `${x},${y}`;
        const monsters = this.spatialGrid.get(key) || [];
        
        monsters.forEach(monster => {
          // Final distance check for monsters in adjacent cells
          const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y, 
            monster.x, monster.y
          );
          
          if (distance <= MONSTER_UPDATE_DISTANCE) {
            monster.updateMonster();
          }
        });
      }
    }
  }

  /**
   * Scene shutdown handler - performs cleanup
   */
  public shutdown(): void {
    // Remove keyboard event handler
    if (this.keyboardHandler) {
      this.input.keyboard.off('keydown', this.keyboardHandler, this, false);
    }
    
    // Clean up physics
    if (this.monsterGroup) {
      this.monsterGroup.clear(true, true);
    }
    
    // Destroy transition zones
    this.transitionZones.forEach(zone => {
      zone.destroy();
    });
    
    // Deactivate monsters instead of destroying
    this.monsters.forEach(monster => {
      if (monster.active) {
        monster.setActive(false);
      }
    });
    
    // Clear arrays
    this.monsters = [];
    this.npcs.forEach(npc => npc.destroy());
    this.npcs = [];
    this.spatialGrid.clear();
    
    // Clear all colliders
    this.physics.world.colliders.destroy();
    
    // Clear scene references
    this.transitionZones = [];
  }

  /**
   * Initialize the scene
   */
  protected init(data: InterSceneData): void {
    this.createObjectPools();
    this.createMapWithLayers();
    this.setupPhysicsWorld();
    this.initializePlayer(data);
    this.initializeNPCs();
    this.initializeMonsters();
    this.updateSpatialGrid();
    this.setupSceneTransitions();
    this.addColliders();
    this.initCamera();
    this.setupOptimizedKeyboardControls();
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  /**
   * Set up the physics world bounds
   */
  private setupPhysicsWorld(): void {
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    
    // Set physics debug configuration if in development mode
    if (process.env.NODE_ENV === 'development') {
      this.physics.world.drawDebug = false; // Only enable when needed
    }
  }

  /**
   * Create map and its layers
   */
  private createMapWithLayers(): void {
    this.map = this.make.tilemap({ key: this.mapKey });
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

    // Optimize layer collision setup
    this.layers.terrain.setCollisionByProperty({ collides: true });
    this.layers.deco.setCollisionByProperty({ collides: true });
  }

  /**
   * Initialize the player character
   */
  private initializePlayer(data: InterSceneData): void {
    const levelChangerObjectLayer = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.ZONES,
    );
    const playerPosition = this.getPlayerInitialPosition(levelChangerObjectLayer, data);
    this.player = new Player(this, playerPosition.x, playerPosition.y);
  }

  /**
   * Initialize NPCs in the scene
   */
  private initializeNPCs(): void {
    const npcsMapObjects = this.map.objects.find(o => o.name === MAP_CONTENT_KEYS.objects.NPCS);
    const npcs = (npcsMapObjects?.objects || []) as unknown as CustomTilemapObject[];
    
    this.npcs = npcs.map(npc => {
      return new Npc(
        this, 
        npc.x, 
        npc.y, 
        npc.properties.message || ''
      );
    });
  }

  /**
   * Initialize monsters in the scene with distance-based activation
   */
  private initializeMonsters(): void {
    const monstersMapObjects = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.MONSTERS,
    );
    const monsters = (monstersMapObjects?.objects || []) as unknown as CustomTilemapObject[];

    this.monsters = monsters.map((monster: CustomTilemapObject): Monster | null => {
      switch (monster.name) {
        case MONSTERS.treant:
          return new Treant(this, monster.x, monster.y);
        case MONSTERS.mole:
          return new Mole(this, monster.x, monster.y);
        default:
          return null;
      }
    }).filter((monster): monster is Monster => monster !== null);
  }

  /**
   * Set up scene transitions
   */
  private setupSceneTransitions(): void {
    const levelChangerObjectLayer = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.ZONES,
    );

    if (levelChangerObjectLayer) {
      this.transitionZones = levelChangerObjectLayer.objects.map((o) => {
        const zoneObject = o as unknown as CustomTilemapObject;
        const zone = this.add.zone(zoneObject.x, zoneObject.y, zoneObject.width, zoneObject.height);
        this.physics.add.existing(zone);
        
        // Store transition data on zone for reuse
        zone.setData('targetScene', zoneObject.properties.scene);
        
        // Create overlap handler
        this.physics.add.overlap(zone, this.player, () => {
          this.scene.start(zone.getData('targetScene'), { comesFrom: this.scene.key });
        });
        
        return zone;
      });
    }
  }

  /**
   * Create object pools for frequently used objects
   */
  private createObjectPools(): void {
    // Create pools for common objects
    this.objectPools.particles = this.add.group({
      maxSize: POOL_SIZES.PARTICLES,
      active: false,
      createCallback: (particle) => {
        this.physics.world.enable(particle);
        if (particle.body) {
          (particle.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        }
      }
    });
    
    this.objectPools.projectiles = this.add.group({
      maxSize: POOL_SIZES.PROJECTILES,
      active: false,
      createCallback: (projectile) => {
        this.physics.world.enable(projectile);
      }
    });
  }

  /**
   * Add physics colliders
   */
  private addColliders(): void {
    // Create groups once and reuse
    this.monsterGroup = this.physics.add.group(this.monsters);
    const npcGroup = this.physics.add.group(this.npcs);
    
    // Create composite collider for solid world objects
    const solidLayers = [this.layers.terrain, this.layers.deco];
    
    // Add colliders for solid layers - use collider optimization
    solidLayers.forEach(layer => {
      // Make sure to only add collision tiles to the physics world
      layer.setCollisionByProperty({ collides: true });
      this.physics.add.collider(this.player, layer);
      
      // Add collider for all monsters
      this.physics.add.collider(this.monsterGroup, layer);
      
      this.physics.add.collider(npcGroup, layer);
    });
    
    // Entity collisions - use a single collider with a callback
    this.physics.add.collider(
      this.monsterGroup, 
      this.player, 
      (_player: Player, monster: Monster) => {
        monster.attack();
      }
    );
    
    // NPC collisions
    this.physics.add.collider(npcGroup, npcGroup);
    this.physics.add.collider(npcGroup, this.player);
    
    // NPC interactions - use a single overlap handler for all NPCs
    const interactionHandler = (_player: Player, npc: Npc) => {
      npc.talk();
    };
    
    this.physics.add.overlap(npcGroup, this.player, interactionHandler);
  }

  /**
   * Initialize the camera
   */
  private initCamera(): void {
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, CAMERA_LERP, CAMERA_LERP);
  }

  /**
   * Set up optimized keyboard controls with a single event handler
   */
  private setupOptimizedKeyboardControls(): void {
    // Create a key map to avoid switch statements in the handler
    const keyActionMap: Record<string, () => void> = {
      '1': () => {
        if (this.scene.key !== SCENES.FIRST_LEVEL) {
          this.scene.start(SCENES.FIRST_LEVEL, { comesFrom: this.scene.key });
        }
      },
      '2': () => {
        if (this.scene.key !== SCENES.SECOND_LEVEL) {
          this.scene.start(SCENES.SECOND_LEVEL, { comesFrom: this.scene.key });
        }
      }
    };
    
    // Use a single keyboard handler for all shortcuts
    this.keyboardHandler = (event: KeyboardEvent) => {
      const action = keyActionMap[event.key];
      if (action) {
        action();
      }
    };
    
    this.input.keyboard.on('keydown', this.keyboardHandler);
  }

  /**
   * Get the initial player position based on scene transition data
   */
  private getPlayerInitialPosition(
    levelChangerObjectLayer: Phaser.Tilemaps.ObjectLayer | undefined,
    data: InterSceneData,
  ): { x: number; y: number } {
    if (!data?.comesFrom || !levelChangerObjectLayer) {
      return PLAYER_INITIAL_POSITION;
    }

    const levelChanger = levelChangerObjectLayer.objects.find(
      (o) => (o as unknown as CustomTilemapObject).properties.scene === data.comesFrom,
    ) as unknown as CustomTilemapObject;

    if (!levelChanger) {
      return PLAYER_INITIAL_POSITION;
    }

    const shift = this.calculateTransitionShift(levelChanger.properties.comesBackFrom || Orientation.Down);
    
    return {
      x: levelChanger.x + levelChanger.width / 2 + shift.x,
      y: levelChanger.y + levelChanger.height / 2 + shift.y,
    };
  }

  /**
   * Calculate the shift amount for scene transitions
   */
  private calculateTransitionShift(orientation: Orientation): { x: number; y: number } {
    switch (orientation) {
      case Orientation.Right:
        return { x: SCENE_TRANSITION_SHIFT, y: 0 };
      case Orientation.Left:
        return { x: -SCENE_TRANSITION_SHIFT, y: 0 };
      case Orientation.Up:
        return { x: 0, y: -SCENE_TRANSITION_SHIFT };
      case Orientation.Down:
        return { x: 0, y: SCENE_TRANSITION_SHIFT };
      default:
        return { x: 0, y: 0 };
    }
  }
}
