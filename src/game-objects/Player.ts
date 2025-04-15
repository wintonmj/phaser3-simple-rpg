/**
 * @fileoverview Player character class that extends the base Character class.
 * Handles player movement, combat, and animations.
 */

import { Orientation } from '../geometry/orientation';
import { Character } from './Character';
import { Arrow } from './projectiles/Arrow';
import { Monster } from './enemies/Monster';
import { AbstractScene } from '../scenes/AbstractScene';
import { ASSETS } from '../constants/assets';

/** Delay between hits in milliseconds */
const HIT_DELAY = 500;
/** Player movement speed */
const PLAYER_SPEED = 80;
/** Reload time for shooting in milliseconds */
const PLAYER_RELOAD = 500;

/**
 * Player character class that extends the base Character class.
 * Handles player movement, combat, and animations.
 * 
 * @class Player
 * @extends {Character}
 */
export class Player extends Character {
  /** Maximum health points for the player */
  public static MAX_HP = 100;

  /** Animation configurations for player movement in different directions */
  private static MOVE_ANIMATION = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_LEFT },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_RIGHT },
  };

  /** Animation configurations for player punching in different directions */
  private static PUNCH_ANIMATION = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_SIDE },
  };

  /** Animation configurations for player idle state in different directions */
  private static IDLE_ANIMATION = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
  };

  /** Animation configurations for player shooting in different directions */
  private static SHOOT_ANIMATION = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_SIDE },
  };

  /** Current orientation of the player */
  private orientation: Orientation;
  /** Timestamp of the last hit taken */
  private lastTimeHit: number;
  /** Whether the player is currently reloading */
  private isLoading: boolean;
  /** Whether the player is currently shooting */
  private isShooting: boolean;
  /** Tomb sprite shown when player dies */
  private tomb: Phaser.GameObjects.Sprite;

  /**
   * Creates an instance of Player.
   * 
   * @param {AbstractScene} scene - The scene the player belongs to
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   */
  constructor(scene: AbstractScene, x: number, y: number) {
    super(scene, x, y, ASSETS.IMAGES.PLAYER_IDLE_DOWN);

    if (!this.hp) {
      this.hp = Player.MAX_HP;
    }

    this.orientation = Orientation.Down;
    this.lastTimeHit = new Date().getTime();
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 0.7);
    this.setSize(10, 10);
    this.setDepth(10);
    this.isLoading = false;
    this.isShooting = false;
    this.tomb = null;

    this.on(
      'animationrepeat',
      event => {
        switch (event.key) {
          case Player.SHOOT_ANIMATION.left.anim:
          case Player.SHOOT_ANIMATION.right.anim:
          case Player.SHOOT_ANIMATION.up.anim:
          case Player.SHOOT_ANIMATION.down.anim:
            this.concludeShoot();
            break;
          default:
            break;
        }
      },
      this,
    );
  }

  public updatePlayer(keyPressed) {
    if (!this.active) {
      return;
    }
    this.setVelocity(0);
    this.handleMovement(keyPressed);

    if (keyPressed.shift) {
      this.punch();
    }

    const noKeyPressed = Object.values(keyPressed).filter(x => x).length === 0;
    if (noKeyPressed && !this.isLoading) {
      this.beIdle();
    }

    this.handleShootKey(keyPressed);
  }

  public canGetHit() {
    return new Date().getTime() - this.lastTimeHit > HIT_DELAY;
  }

  public loseHp() {
    this.hp--;

    this.lastTimeHit = new Date().getTime();

    if (this.hp > 0) {
      return;
    }

    // Player dies
    if (!this.tomb) {
      this.tomb = this.scene.add.sprite(this.x, this.y, ASSETS.IMAGES.TOMB).setScale(0.1);
    }
    this.destroy();
  }

  private get hp() {
    return this.uiScene.playerHp;
  }

  private set hp(newHp: number) {
    this.uiScene.playerHp = newHp;
  }

  private reload() {
    this.isLoading = true;
    this.scene.time.addEvent({
      delay: PLAYER_RELOAD,
      callback: this.readyToFire,
      callbackScope: this,
    });
  }

  private readyToFire() {
    this.isLoading = false;
  }

  private go(direction: Orientation, shouldAnimate = true) {
    switch (direction) {
      case Orientation.Left:
        this.setVelocityX(-PLAYER_SPEED);
        break;
      case Orientation.Right:
        this.setVelocityX(PLAYER_SPEED);
        break;
      case Orientation.Up:
        this.setVelocityY(-PLAYER_SPEED);
        break;
      case Orientation.Down:
        this.setVelocityY(PLAYER_SPEED);
        break;
      default:
        break;
    }

    if (!shouldAnimate) {
      return;
    }

    this.orientation = direction;

    this.animate(Player.MOVE_ANIMATION, this.orientation);
  }

  private handleHorizontalMovement(keyPressed) {
    const isUpDownPressed = keyPressed.up || keyPressed.down;

    if (keyPressed.left) {
      this.go(Orientation.Left, !isUpDownPressed);
      return;
    }

    if (keyPressed.right) {
      this.go(Orientation.Right, !isUpDownPressed);
      return;
    }
  }

  private handleVerticalMovement(keyPressed) {
    if (keyPressed.up) {
      this.go(Orientation.Up);
    } else if (keyPressed.down) {
      this.go(Orientation.Down);
    }
  }

  private handleMovement(keyPressed) {
    if (this.isShooting) {
      return;
    }
    this.handleHorizontalMovement(keyPressed);
    this.handleVerticalMovement(keyPressed);
  }

  private punch() {
    this.animate(Player.PUNCH_ANIMATION, this.orientation);
  }

  private beIdle() {
    this.animate(Player.IDLE_ANIMATION, this.orientation);
  }

  private concludeShoot = () => {
    this.isShooting = false;
    const arrow = new Arrow(this.scene, this.x, this.y, this.orientation);
    this.scene.physics.add.collider(arrow, this.scene.monsterGroup, (a: Arrow, m: Monster) => {
      m.loseHp(a);
    });
  };

  private shoot() {
    this.isShooting = true;

    this.animate(Player.SHOOT_ANIMATION, this.orientation);
    // Arrow will be spawned at the end of the animation
  }

  private handleShootKey(keyPressed) {
    if (keyPressed.space) {
      if (this.isLoading) {
        return;
      }
      this.reload();
      this.shoot();
    }
  }
}
