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

/** Grid parameters for spatial partitioning */
const GRID = {
  CELL_SIZE: 400,
  UPDATE_RANGE: 1, // Number of cells around player to update
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
  /** Spatial grid for entity culling */
  private spatialGrid: Map<string, Monster[]> = new Map();
  /** Grid cell size for spatial partitioning */
  private gridCellSize = GRID.CELL_SIZE;
  /** Object pools */
  protected objectPools: Record<string, Phaser.GameObjects.Group> = {};
  /** Active monsters being processed */
  private activeMonsters: Set<Monster> = new Set();
  /** Last known player grid position */
  private lastPlayerGridPos: { x: number; y: number } = { x: 0, y: 0 };
  /** Camera bounds */
  private cameraBounds: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
  /** Frame counter for staggered updates */
  private frameCounter: number = 0;

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
   * Main update loop - optimized with frame-skipping for non-critical elements
   */
  public update(): void {
    this.frameCounter++;
    
    // Update player and keyboard input every frame
    this.updateKeyState();
    this.player.updatePlayer(this.keyState);
    
    // Update camera bounds once per frame
    this.updateCameraBounds();
    
    // Check for player grid cell change and update spatial grid if needed
    const gridX = Math.floor(this.player.x / this.gridCellSize);
    const gridY = Math.floor(this.player.y / this.gridCellSize);
    
    const playerGridChanged = gridX !== this.lastPlayerGridPos.x || gridY !== this.lastPlayerGridPos.y;
    if (playerGridChanged) {
      this.lastPlayerGridPos = { x: gridX, y: gridY };
      this.updateActiveMonsters();
    }
    
    // Stagger non-critical updates across frames
    if (this.frameCounter % 10 === 0) {
      this.updateSpatialGrid(); // Heavy operation, only do occasionally
    }
    
    // Update active monsters every frame for smooth gameplay
    this.updateActiveMonsters();
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
   * Update the camera bounds for culling calculations
   */
  private updateCameraBounds(): void {
    const camera = this.cameras.main;
    this.cameraBounds.x = camera.scrollX;
    this.cameraBounds.y = camera.scrollY;
    this.cameraBounds.width = camera.width;
    this.cameraBounds.height = camera.height;
  }

  /**
   * Update spatial partitioning grid - now optimized to rebuild only when necessary
   */
  private updateSpatialGrid(): void {
    // Clear existing grid
    this.spatialGrid.clear();
    
    // Only process monsters that are close enough to potentially become active
    // This avoids processing monsters that are far away from the player
    const expandedBounds = new Phaser.Geom.Rectangle(
      this.cameraBounds.x - this.gridCellSize,
      this.cameraBounds.y - this.gridCellSize,
      this.cameraBounds.width + this.gridCellSize * 2,
      this.cameraBounds.height + this.gridCellSize * 2
    );
    
    this.monsters.forEach(monster => {
      // Skip inactive monsters or those far from camera view
      if (!monster.active || !Phaser.Geom.Rectangle.Contains(expandedBounds, monster.x, monster.y)) {
        return;
      }
      
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
   * Update the set of active monsters based on player position
   */
  private updateActiveMonsters(): void {
    // Clear previous active set
    this.activeMonsters.clear();
    
    // Get player's grid cell
    const playerGridX = this.lastPlayerGridPos.x;
    const playerGridY = this.lastPlayerGridPos.y;
    
    // Check player cell and surrounding cells based on configured range
    const range = GRID.UPDATE_RANGE;
    for (let x = playerGridX - range; x <= playerGridX + range; x++) {
      for (let y = playerGridY - range; y <= playerGridY + range; y++) {
        const key = `${x},${y}`;
        const monsters = this.spatialGrid.get(key) || [];
        
        monsters.forEach(monster => {
          // Skip deactivated monsters
          if (!monster.active) return;
          
          // Final distance check for monsters in grid cells
          const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y, 
            monster.x, monster.y
          );
          
          if (distance <= MONSTER_UPDATE_DISTANCE) {
            this.activeMonsters.add(monster);
            monster.updateMonster();
          }
        });
      }
    }
  }

  /**
   * Scene shutdown handler - performs cleanup with improved memory management
   */
  public shutdown(): void {
    // Remove keyboard event handler
    if (this.keyboardHandler) {
      this.input.keyboard.off('keydown', this.keyboardHandler, this, false);
    }
    
    // Clean up physics - handle non-active groups gracefully
    if (this.monsterGroup && this.monsterGroup.active) {
      this.monsterGroup.clear(true, true);
    }
    
    // Destroy transition zones
    this.transitionZones.forEach(zone => {
      if (zone.active) {
        zone.destroy();
      }
    });
    
    // Return monsters to object pool instead of destroying
    this.monsters.forEach(monster => {
      if (monster.active) {
        monster.setActive(false);
        if (monster instanceof Phaser.GameObjects.Sprite) {
          monster.setVisible(false);
        }
      }
    });
    
    // Clear active monster tracking
    this.activeMonsters.clear();
    
    // Clear NPCs
    this.npcs.forEach(npc => {
      if (npc.active) {
        npc.destroy();
      }
    });
    
    // Clear collections
    this.monsters = [];
    this.npcs = [];
    this.spatialGrid.clear();
    
    // Destroy physics colliders
    if (this.physics.world.colliders.getActive().length > 0) {
      this.physics.world.colliders.destroy();
    }
    
    // Clear scene references
    this.transitionZones = [];
  }

  /**
   * Initialize the scene
   */
  protected init(data: InterSceneData): void {
    // Reset frame counter
    this.frameCounter = 0;
    
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
    
    // Only create NPCs that would be visible on screen
    const cameraView = new Phaser.Geom.Rectangle(
      0, 0, 
      this.cameras.main.width + MONSTER_UPDATE_DISTANCE*2, 
      this.cameras.main.height + MONSTER_UPDATE_DISTANCE*2
    );
    
    this.npcs = npcs
      // Pre-filter NPCs by distance to camera to reduce object creation
      .filter(npc => Phaser.Geom.Rectangle.Contains(cameraView, npc.x, npc.y))
      .map(npc => {
        return new Npc(
          this, 
          npc.x, 
          npc.y, 
          npc.properties.message || ''
        );
      });
  }

  /**
   * Initialize monsters in the scene with optimized object creation
   */
  private initializeMonsters(): void {
    const monstersMapObjects = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.MONSTERS,
    );
    const monsters = (monstersMapObjects?.objects || []) as unknown as CustomTilemapObject[];

    // Object pooling factory function to reuse monster instances
    const createMonster = (type: string, x: number, y: number): Monster | null => {
      switch (type) {
        case MONSTERS.treant:
          return new Treant(this, x, y);
        case MONSTERS.mole:
          return new Mole(this, x, y);
        default:
          return null;
      }
    };

    // Create monsters with immediate distance check to avoid creating unnecessary objects
    this.monsters = monsters
      .map((monster: CustomTilemapObject): Monster | null => {
        // Early skip for invalid types
        if (!monster.name || !(monster.name in MONSTERS)) {
          return null;
        }
        
        // Create the monster instance
        return createMonster(monster.name, monster.x, monster.y);
      })
      .filter((monster): monster is Monster => monster !== null);
      
    // Initially deactivate monsters that are far from player
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    this.monsters.forEach(monster => {
      const distance = Phaser.Math.Distance.Between(
        playerX, playerY, monster.x, monster.y
      );
      
      // Set initial active state based on distance
      if (distance > MONSTER_UPDATE_DISTANCE * 1.5) {
        monster.setActive(false);
        if (monster instanceof Phaser.GameObjects.Sprite) {
          monster.setVisible(false);
        }
      }
    });
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
        
        // Zone needs physics but doesn't need to move or use gravity
        this.physics.add.existing(zone, true); // true = static body
        
        // Store transition data on zone for reuse
        zone.setData('targetScene', zoneObject.properties.scene);
        
        // Create overlap handler with debounce mechanism to prevent multiple triggers
        let canTransition = true;
        this.physics.add.overlap(zone, this.player, () => {
          if (canTransition) {
            canTransition = false;
            this.scene.start(zone.getData('targetScene'), { comesFrom: this.scene.key });
          }
        });
        
        return zone;
      });
    }
  }

  /**
   * Create object pools for frequently used objects with reuse strategies
   */
  private createObjectPools(): void {
    // Create pools with specific recycling behavior
    this.objectPools.particles = this.add.group({
      maxSize: POOL_SIZES.PARTICLES,
      active: false,
      createCallback: (particle) => {
        this.physics.world.enable(particle);
        if (particle.body) {
          (particle.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        }
      },
      removeCallback: (particle) => {
        // Reset particle state when removed from active use
        particle.setActive(false);
        if (particle instanceof Phaser.GameObjects.Sprite) {
          particle.setVisible(false);
        }
        if (particle.body) {
          (particle.body as Phaser.Physics.Arcade.Body).reset(0, 0);
        }
      }
    });
    
    this.objectPools.projectiles = this.add.group({
      maxSize: POOL_SIZES.PROJECTILES,
      active: false,
      createCallback: (projectile) => {
        this.physics.world.enable(projectile);
      },
      removeCallback: (projectile) => {
        // Reset projectile state when removed from active use
        projectile.setActive(false);
        if (projectile instanceof Phaser.GameObjects.Sprite) {
          projectile.setVisible(false);
        }
        if (projectile.body) {
          (projectile.body as Phaser.Physics.Arcade.Body).reset(0, 0);
        }
      }
    });
  }

  /**
   * Add physics colliders with optimization strategies
   */
  private addColliders(): void {
    // Create groups once and reuse
    this.monsterGroup = this.physics.add.group(this.monsters);
    const npcGroup = this.physics.add.group(this.npcs);
    
    // Create composite collider for solid world objects
    const solidLayers = [this.layers.terrain, this.layers.deco];
    
    // Add colliders for solid layers - use collider optimization
    solidLayers.forEach(layer => {
      // Add collider for player
      this.physics.add.collider(this.player, layer);
      
      // Add collider for all monsters
      this.physics.add.collider(this.monsterGroup, layer);
      
      // Add collider for NPCs
      this.physics.add.collider(npcGroup, layer);
    });
    
    // Entity collisions - use a single collider with a callback
    // Optimize by using a processing callback to early-exit unnecessary collision checks
    this.physics.add.collider(
      this.monsterGroup, 
      this.player, 
      // Collision callback
      (_player: Player, monster: Monster) => {
        monster.attack();
      },
      // Process callback for early filtering
      (_player: Player, monster: Monster) => {
        // Only process collision if monster is active and close enough
        return monster.active && Phaser.Math.Distance.Between(
          _player.x, _player.y, monster.x, monster.y
        ) < monster.body.width * 1.5;
      }
    );
    
    // NPC collisions
    this.physics.add.collider(npcGroup, npcGroup);
    this.physics.add.collider(npcGroup, this.player);
    
    // NPC interactions - use a single overlap handler for all NPCs with process callback
    this.physics.add.overlap(
      npcGroup, 
      this.player, 
      (_player: Player, npc: Npc) => {
        npc.talk();
      },
      // Process callback to check if player is facing the NPC
      (_player: Player, npc: Npc) => {
        // Check if close enough to interact
        return Phaser.Math.Distance.Between(
          _player.x, _player.y, npc.x, npc.y
        ) < 40; // Interaction distance
      }
    );
  }

  /**
   * Initialize the camera with optimized settings
   */
  private initCamera(): void {
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    
    // Use smooth follow for better performance
    this.cameras.main.startFollow(this.player, true, CAMERA_LERP, CAMERA_LERP);
    
    // Set up initial camera bounds for culling calculations
    this.updateCameraBounds();
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
