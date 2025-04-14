/// <reference path="../types/phaser-extensions.d.ts" />

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
  public npcs: Npc[];
  /** Array of monsters in the scene */
  public monsters: Monster[];
  /** The tilemap for the scene */
  public map: Phaser.Tilemaps.Tilemap;
  /** Physics group for monsters */
  public monsterGroup: Phaser.Physics.Arcade.Group;
  /** Map layers for different terrain types */
  public layers: MapLayers;
  /** Key for the map asset */
  public mapKey: string;

  /**
   * Creates an instance of AbstractScene.
   * @param key - The scene key
   * @param mapKey - The key for the map asset
   */
  constructor(key: string, mapKey: string) {
    super(key);
    this.mapKey = mapKey;
    this.initializeProperties();
  }

  /**
   * Initialize scene properties
   */
  private initializeProperties(): void {
    this.player = null;
    this.cursors = null;
    this.npcs = [];
    this.monsters = [];
    this.monsterGroup = null;
    this.map = null;
    this.layers = null;
  }

  /**
   * Main update loop
   */
  public update(): void {
    const keyState = this.getKeyState();
    this.updateMonsters();
    this.player.updatePlayer(keyState);
  }

  /**
   * Get current keyboard state
   */
  private getKeyState(): KeyState {
    return {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
      space: this.cursors.space.isDown,
      shift: this.cursors.shift.isDown,
    };
  }

  /**
   * Update all monsters in the scene
   */
  private updateMonsters(): void {
    this.monsters.forEach(monster => monster.updateMonster());
  }

  /**
   * Initialize the scene
   */
  protected init(data: InterSceneData): void {
    this.createMapWithLayers();
    this.setupPhysicsWorld();
    this.initializePlayer(data);
    this.initializeNPCs();
    this.initializeMonsters();
    this.setupSceneTransitions();
    this.addColliders();
    this.initCamera();
    this.setupKeyboardShortcuts();
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  /**
   * Set up the physics world bounds
   */
  private setupPhysicsWorld(): void {
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  }

  /**
   * Create map and its layers
   */
  private createMapWithLayers(): void {
    this.map = this.make.tilemap({ key: this.mapKey });
    const tileset = this.map.addTilesetImage(ASSETS.TILESET, ASSETS.IMAGES.TILES, 16, 16, 0, 0);

    this.layers = {
      terrain: this.map.createLayer(MAP_CONTENT_KEYS.layers.BACKGROUND, tileset, 0, 0),
      deco: this.map.createLayer(MAP_CONTENT_KEYS.layers.DECORATION, tileset, 0, 0),
      bridge: this.map.createLayer(MAP_CONTENT_KEYS.layers.BRIDGE, tileset, 0, 0),
    };

    this.setupLayerCollisions();
  }

  /**
   * Set up collisions for map layers
   */
  private setupLayerCollisions(): void {
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
    this.npcs = npcs.map(npc => new Npc(this, npc.x, npc.y, npc.properties.message));
  }

  /**
   * Initialize monsters in the scene
   */
  private initializeMonsters(): void {
    const monstersMapObjects = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.MONSTERS,
    );
    const monsters = (monstersMapObjects?.objects || []) as unknown as CustomTilemapObject[];

    this.monsters = monsters.map((monster: CustomTilemapObject): Monster => {
      switch (monster.name) {
        case MONSTERS.treant:
          return new Treant(this, monster.x, monster.y);
        case MONSTERS.mole:
          return new Mole(this, monster.x, monster.y);
        default:
          return null;
      }
    }).filter(Boolean);
  }

  /**
   * Set up scene transitions
   */
  private setupSceneTransitions(): void {
    const levelChangerObjectLayer = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.ZONES,
    );

    if (levelChangerObjectLayer) {
      levelChangerObjectLayer.objects.forEach((o: any) => {
        const zone = this.add.zone(o.x, o.y, o.width, o.height);
        this.physics.add.existing(zone);
        this.physics.add.overlap(zone, this.player, () => {
          this.scene.start(o.properties.scene, { comesFrom: this.scene.key });
        });
      });
    }
  }

  /**
   * Add physics colliders
   */
  private addColliders(): void {
    this.monsterGroup = this.physics.add.group(this.monsters);
    
    // Monster collisions
    this.physics.add.collider(this.monsterGroup, this.layers.terrain);
    this.physics.add.collider(this.monsterGroup, this.layers.deco);
    this.physics.add.collider(this.monsterGroup, this.player, (_: Player, m: Monster) => {
      m.attack();
    });

    // Player collisions
    this.physics.add.collider(this.player, this.layers.terrain);
    this.physics.add.collider(this.player, this.layers.deco);
    
    // NPC collisions
    this.npcs.forEach(npc => this.physics.add.collider(npc, this.player, npc.talk));
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
   * Set up keyboard shortcuts for scene transitions
   */
  private setupKeyboardShortcuts(): void {
    this.input.keyboard.on('keydown-ONE', () => {
      if (this.scene.key !== SCENES.FIRST_LEVEL) {
        this.scene.start(SCENES.FIRST_LEVEL, { comesFrom: this.scene.key });
      }
    });
    
    this.input.keyboard.on('keydown-TWO', () => {
      if (this.scene.key !== SCENES.SECOND_LEVEL) {
        this.scene.start(SCENES.SECOND_LEVEL, { comesFrom: this.scene.key });
      }
    });
  }

  /**
   * Get the initial player position based on scene transition data
   */
  private getPlayerInitialPosition(
    levelChangerObjectLayer: Phaser.Tilemaps.ObjectLayer,
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

    const shift = this.calculateTransitionShift(levelChanger.properties.comesBackFrom);
    
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
