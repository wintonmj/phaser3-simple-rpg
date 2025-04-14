/// <reference path="../types/phaser-extensions.d.ts" />

/**
 * @fileoverview Abstract base scene class that provides common functionality for all game scenes.
 * This class handles map creation, player initialization, camera setup, and basic game mechanics.
 */

import { Orientation } from '../geometry/orientation';
import { Player } from '../game-objects/Player';
import { Treant } from '../game-objects/enemies/Treant';
import { Monster } from '../game-objects/enemies/Monster';
import { Mole } from '../game-objects/enemies/Mole';
import { Npc } from '../game-objects/Npc';
import { MAP_CONTENT_KEYS } from '../constants/map-content-keys';
import { ASSETS } from '../constants/assets';
import { MONSTERS } from '../constants/monsters';
import { SCENES } from '../constants/scenes';

/** Camera lerp factor for smooth camera movement */
const CAMERA_LERP = 1;
/** Default player starting position */
const PLAYER_INITIAL_POSITION = {
  x: 50,
  y: 200,
};

/**
 * Interface for data passed between scenes
 * @interface InterSceneData
 */
interface InterSceneData {
  /** The name of the scene the player is coming from */
  comesFrom: string;
}

/**
 * Abstract base class for all game scenes.
 * Provides common functionality for map creation, player initialization, and game mechanics.
 * 
 * @abstract
 * @class AbstractScene
 * @extends {Phaser.Scene}
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
  public layers: {
    terrain: Phaser.Tilemaps.TilemapLayer;
    deco: Phaser.Tilemaps.TilemapLayer;
    bridge: Phaser.Tilemaps.TilemapLayer;
  };
  /** Key for the map asset */
  public mapKey: string;

  /**
   * Creates an instance of AbstractScene.
   * 
   * @param {string} key - The scene key
   * @param {string} mapKey - The key for the map asset
   */
  constructor(key: string, mapKey: string) {
    super(key);

    this.mapKey = mapKey;

    this.player = null;
    this.cursors = null;
    this.npcs = [];
    this.monsters = [];
    this.monsterGroup = null;
    this.map = null;
    this.layers = null;
  }

  public update() {
    const keyPressed = {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
      space: this.cursors.space.isDown,
      shift: this.cursors.shift.isDown,
    };

    this.monsters.map((monster: Monster) => monster.updateMonster());
    this.player.updatePlayer(keyPressed);
  }

  protected init(data: InterSceneData) {
    this.createMapWithLayers();

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    const levelChangerObjectLayer = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.ZONES,
    );

    const playerInitialPosition = this.getPlayerInitialPosition(levelChangerObjectLayer, data);
    this.player = new Player(this, playerInitialPosition.x, playerInitialPosition.y);

    const npcsMapObjects = this.map.objects.find(o => o.name === MAP_CONTENT_KEYS.objects.NPCS);
    const npcs: any = npcsMapObjects ? npcsMapObjects.objects : [];
    this.npcs = npcs.map(npc => {
      return new Npc(this, npc.x, npc.y, npc.properties.message);
    });

    const monstersMapObjects = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.MONSTERS,
    );
    const monsters: any = monstersMapObjects ? monstersMapObjects.objects : [];

    this.monsters = monsters.map(
      (monster: any): Monster => {
        switch (monster.name) {
          case MONSTERS.treant:
            return new Treant(this, monster.x, monster.y);
          case MONSTERS.mole:
            return new Mole(this, monster.x, monster.y);
          default:
        }
      },
    );

    if (levelChangerObjectLayer) {
      levelChangerObjectLayer.objects.map((o: any) => {
        const zone = this.add.zone(o.x, o.y, o.width, o.height);
        this.physics.add.existing(zone);
        this.physics.add.overlap(zone, this.player, () => {
          this.scene.start(o.properties.scene, { comesFrom: this.scene.key });
        });
      });
    }

    this.addColliders();

    this.initCamera();

    // Add number key shortcuts for level transitions
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

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  private createMapWithLayers() {
    this.map = this.make.tilemap({ key: this.mapKey });
    const tileset = this.map.addTilesetImage(ASSETS.TILESET, ASSETS.IMAGES.TILES, 16, 16, 0, 0);

    this.layers = {
      terrain: this.map.createLayer(MAP_CONTENT_KEYS.layers.BACKGROUND, tileset, 0, 0),
      deco: this.map.createLayer(MAP_CONTENT_KEYS.layers.DECORATION, tileset, 0, 0),
      bridge: this.map.createLayer(MAP_CONTENT_KEYS.layers.BRIDGE, tileset, 0, 0),
    };
    this.layers.terrain.setCollisionByProperty({ collides: true });
    this.layers.deco.setCollisionByProperty({ collides: true });
  }

  private addColliders() {
    this.monsterGroup = this.physics.add.group(this.monsters.map(monster => monster));
    this.physics.add.collider(this.monsterGroup, this.layers.terrain);
    this.physics.add.collider(this.monsterGroup, this.layers.deco);
    this.physics.add.collider(this.monsterGroup, this.player, (_: Player, m: Monster) => {
      m.attack();
    });

    this.physics.add.collider(this.player, this.layers.terrain);
    this.physics.add.collider(this.player, this.layers.deco);
    this.npcs.map((npc: Npc) => this.physics.add.collider(npc, this.player, npc.talk));
  }

  private getPlayerInitialPosition(
    levelChangerObjectLayer: Phaser.Tilemaps.ObjectLayer,
    data: InterSceneData,
  ): { x: number; y: number } {
    let playerX = PLAYER_INITIAL_POSITION.x;
    let playerY = PLAYER_INITIAL_POSITION.y;

    if (data && data.comesFrom) {
      const levelChanger: any = levelChangerObjectLayer.objects.find((o: any) => {
        return o.properties.scene === data.comesFrom;
      });

      // We shift the player position because we can't make him spawn on the
      // zone changer directly
      let xShift = 0;
      let yShift = 0;
      const SHIFT_VALUE = 50;
      switch (levelChanger.properties.comesBackFrom) {
        case Orientation.Right:
          xShift = SHIFT_VALUE;
          yShift = 0;
          break;
        case Orientation.Left:
          xShift = -SHIFT_VALUE;
          yShift = 0;
          break;
        case Orientation.Up:
          xShift = 0;
          yShift = -SHIFT_VALUE;
          break;
        case Orientation.Down:
          xShift = 0;
          yShift = SHIFT_VALUE;
          break;
        default:
          break;
      }

      playerX = levelChanger.x + levelChanger.width / 2 + xShift;
      playerY = levelChanger.y + levelChanger.height / 2 + yShift;
    }

    return { x: playerX, y: playerY };
  }

  private initCamera() {
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, CAMERA_LERP, CAMERA_LERP);
  }
}
