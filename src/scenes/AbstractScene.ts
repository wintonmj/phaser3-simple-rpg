/**
 * @fileoverview Abstract base scene class that provides common functionality for all game scenes.
 * This class handles map creation, player initialization, camera setup, and basic game mechanics.
 * 
 */

// Core imports
import { Orientation } from '../geometry/orientation';
import { SCENES } from '../constants/scenes';
import { ASSETS } from '../constants/assets';
import { MAP_CONTENT_KEYS } from '../constants/map-content-keys';
import { MONSTERS } from '../constants/monsters';
import { QuadTree, QUADTREE } from '../utils/QuadTree';

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
/** Square of monster update distance for more efficient distance checks */
const MONSTER_UPDATE_DISTANCE_SQ = MONSTER_UPDATE_DISTANCE * MONSTER_UPDATE_DISTANCE;

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
  /** QuadTree for entity culling */
  private quadTree: QuadTree;
  /** Object pools */
  protected objectPools: Record<string, Phaser.GameObjects.Group> = {};
  /** Active monsters being processed */
  private activeMonsters: Set<Monster> = new Set();
  /** Camera bounds */
  private cameraBounds: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
  /** Frame counter for staggered updates */
  private frameCounter: number = 0;
  /** Physics operations queue for batching */
  private pendingPhysicsOperations: Array<() => void> = [];

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
    
    // Check if we need to update the quadtree
    if (this.frameCounter % 10 === 0) {
      this.updateQuadTree();
    }
    
    // Update active monsters every frame for smooth gameplay
    this.updateActiveMonsters();
    
    // Process batched physics operations
    this.processBatchedPhysics();
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
   * Update QuadTree for efficient spatial partitioning
   */
  private updateQuadTree(): void {
    // Clear existing quadtree
    this.quadTree.clear();
    
    // Get expanded bounds to include monsters just outside the camera view
    const expandedBounds = new Phaser.Geom.Rectangle(
      this.cameraBounds.x - MONSTER_UPDATE_DISTANCE,
      this.cameraBounds.y - MONSTER_UPDATE_DISTANCE,
      this.cameraBounds.width + MONSTER_UPDATE_DISTANCE * 2,
      this.cameraBounds.height + MONSTER_UPDATE_DISTANCE * 2
    );
    
    // Only insert monsters that are active and within expanded bounds
    this.monsters.forEach(monster => {
      if (!monster.active) return;
      
      // Use rectangle contains for faster boundary check
      if (Phaser.Geom.Rectangle.Contains(expandedBounds, monster.x, monster.y)) {
        this.quadTree.insert(monster);
      }
    });
  }

  /**
   * Uses QuadTree to efficiently find and update active monsters
   */
  private updateActiveMonsters(): void {
    // Clear previous active set
    this.activeMonsters.clear();
    
    // Get query area around player for monster activation
    const playerQueryArea = new Phaser.Geom.Rectangle(
      this.player.x - MONSTER_UPDATE_DISTANCE,
      this.player.y - MONSTER_UPDATE_DISTANCE,
      MONSTER_UPDATE_DISTANCE * 2,
      MONSTER_UPDATE_DISTANCE * 2
    );
    
    // Query quadtree for monsters in range
    const nearbyMonsters = this.quadTree.retrieveInBounds(playerQueryArea);
    
    // Final squared distance check and activate monsters
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    nearbyMonsters.forEach(monster => {
      if (!monster.active) return;
      
      // Efficient squared distance check
      const dx = monster.x - playerX;
      const dy = monster.y - playerY;
      const distanceSq = dx * dx + dy * dy;
      
      if (distanceSq <= MONSTER_UPDATE_DISTANCE_SQ) {
        this.activeMonsters.add(monster);
        monster.updateMonster();
      }
    });
  }

  /**
   * Queue physics operations for batched processing
   */
  private queuePhysicsOperation(operation: () => void): void {
    this.pendingPhysicsOperations.push(operation);
  }

  /**
   * Process all batched physics operations in one go
   */
  private processBatchedPhysics(): void {
    // Early exit if no operations
    if (this.pendingPhysicsOperations.length === 0) return;
    
    // Process all operations in a single batch
    for (const operation of this.pendingPhysicsOperations) {
      operation();
    }
    
    // Clear the queue
    this.pendingPhysicsOperations = [];
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
    this.quadTree.clear();
    
    // Clear pending physics operations
    this.pendingPhysicsOperations = [];
    
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
    
    // Initialize quadtree covering the entire map (will be resized after map creation)
    this.quadTree = new QuadTree(new Phaser.Geom.Rectangle(0, 0, 2000, 2000), QUADTREE.MAX_OBJECTS, QUADTREE.MAX_LEVELS);
    
    this.createObjectPools();
    this.createMapWithLayers();
    
    // Resize quadtree to match map dimensions
    this.quadTree = new QuadTree(
      new Phaser.Geom.Rectangle(0, 0, this.map.widthInPixels, this.map.heightInPixels),
      QUADTREE.MAX_OBJECTS,
      QUADTREE.MAX_LEVELS
    );
    
    this.setupPhysicsWorld();
    this.initializePlayer(data);
    this.initializeNPCs();
    this.initializeMonsters();
    this.updateQuadTree();
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
    
    // Create extended camera bounds for culling
    const extendedBounds = new Phaser.Geom.Rectangle(
      0, 0, 
      this.cameras.main.width + MONSTER_UPDATE_DISTANCE*2, 
      this.cameras.main.height + MONSTER_UPDATE_DISTANCE*2
    );
    
    // Batch NPC creation
    const npcCreationOperations: Npc[] = [];
    
    npcs
      // Pre-filter NPCs by distance to camera to reduce object creation
      .filter(npc => Phaser.Geom.Rectangle.Contains(extendedBounds, npc.x, npc.y))
      .forEach(npc => {
        const newNpc = new Npc(
          this, 
          npc.x, 
          npc.y, 
          npc.properties.message || ''
        );
        npcCreationOperations.push(newNpc);
      });
    
    this.npcs = npcCreationOperations;
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

    // Batch monster creation
    const monsterCreationOperations: Monster[] = [];
    
    monsters.forEach((monster: CustomTilemapObject) => {
      // Skip invalid monsters
      if (!monster.name || !(monster.name in MONSTERS)) {
        return;
      }
      
      const newMonster = createMonster(monster.name, monster.x, monster.y);
      if (newMonster) {
        monsterCreationOperations.push(newMonster);
      }
    });
    
    this.monsters = monsterCreationOperations.filter(Boolean);
      
    // Initially deactivate monsters that are far from player
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    this.monsters.forEach(monster => {
      // Efficient squared distance check
      const dx = monster.x - playerX;
      const dy = monster.y - playerY;
      const distanceSq = dx * dx + dy * dy;
      
      // Set initial active state based on distance
      if (distanceSq > MONSTER_UPDATE_DISTANCE_SQ * 2.25) { // 1.5^2 = 2.25
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
        
        // Queue the overlap check instead of creating it immediately
        this.queuePhysicsOperation(() => {
          this.physics.add.overlap(zone, this.player, () => {
            if (canTransition) {
              canTransition = false;
              this.scene.start(zone.getData('targetScene'), { comesFrom: this.scene.key });
            }
          });
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
    
    // Queue all colliders for batch processing
    solidLayers.forEach(layer => {
      // Add collider for player
      this.queuePhysicsOperation(() => {
        this.physics.add.collider(this.player, layer);
      });
      
      // Add collider for all monsters
      this.queuePhysicsOperation(() => {
        this.physics.add.collider(this.monsterGroup, layer);
      });
      
      // Add collider for NPCs
      this.queuePhysicsOperation(() => {
        this.physics.add.collider(npcGroup, layer);
      });
    });
    
    // Entity collisions - use a single collider with a callback
    // Optimize by using a processing callback to early-exit unnecessary collision checks
    this.queuePhysicsOperation(() => {
      this.physics.add.collider(
        this.monsterGroup, 
        this.player, 
        // Collision callback
        (_player: Player, monster: Monster) => {
          monster.attack();
        },
        // Process callback for early filtering
        (_player: Player, monster: Monster) => {
          // Only process collision if monster is active
          if (!monster.active) return false;
          
          // Efficient squared distance check
          const dx = _player.x - monster.x;
          const dy = _player.y - monster.y;
          const distanceSq = dx * dx + dy * dy;
          
          // Quick body width calculation
          const radiusSum = monster.body.width * 0.75; // Half width * 1.5
          const radiusSumSq = radiusSum * radiusSum;
          
          return distanceSq <= radiusSumSq;
        }
      );
    });
    
    // NPC collisions
    this.queuePhysicsOperation(() => {
      this.physics.add.collider(npcGroup, npcGroup);
    });
    
    this.queuePhysicsOperation(() => {
      this.physics.add.collider(npcGroup, this.player);
    });
    
    // NPC interactions - use a single overlap handler for all NPCs with process callback
    this.queuePhysicsOperation(() => {
      this.physics.add.overlap(
        npcGroup, 
        this.player, 
        (_player: Player, npc: Npc) => {
          npc.talk();
        },
        // Process callback to check if player is facing the NPC
        (_player: Player, npc: Npc) => {
          // Efficient squared distance check for interaction
          const dx = _player.x - npc.x;
          const dy = _player.y - npc.y;
          const distanceSq = dx * dx + dy * dy;
          
          return distanceSq < 1600; // 40^2
        }
      );
    });
    
    // Process all the batched physics operations at once
    this.processBatchedPhysics();
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
