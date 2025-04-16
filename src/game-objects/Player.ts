/**
 * @fileoverview Player character class that extends the base Character class.
 * Handles player movement, combat, and animations.
 */

import { Orientation } from '../geometry/orientation';
import { Character } from './Character';
import { Arrow } from './projectiles/Arrow';
import { NonPlayerEntity } from './entities/NonPlayerEntity';
import { AbstractScene } from '../scenes/AbstractScene';
import { ASSETS } from '../constants/assets';
import { IInputBehavior } from '../behaviors/interfaces';

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
  public static MAX_HP = 10;

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

  /** Whether the player is currently reloading */
  private isLoading: boolean;
  /** Whether the player is currently shooting */
  private isShooting: boolean;
  /** Tomb sprite shown when player dies */
  private tomb: Phaser.GameObjects.Sprite;
  /** Input behavior to handle player controls */
  private inputBehavior: IInputBehavior;

  /**
   * Creates an instance of Player.
   * 
   * @param {AbstractScene} scene - The scene the player belongs to
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   */
  constructor(scene: AbstractScene, x: number, y: number) {
    super(scene, x, y, ASSETS.IMAGES.PLAYER_IDLE_DOWN);

    this.hp = Player.MAX_HP;
    
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 0.7);
    this.setSize(10, 10);
    this.setDepth(10);
    this.isLoading = false;
    this.isShooting = false;
    this.tomb = null;
    this.moveSpeed = PLAYER_SPEED;

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

  /**
   * Sets the input behavior component for the player
   * @param inputBehavior The input behavior to use
   */
  public setInputBehavior(inputBehavior: IInputBehavior): void {
    this.inputBehavior = inputBehavior;
  }

  /**
   * Main update method called by the game loop.
   * This overrides the base Sprite update method.
   * 
   * @override
   */
  public update(): void {
    // Call parent class update if needed
    super.update();
    
    // Process input via the input behavior if available
    if (this.inputBehavior) {
      this.inputBehavior.update(this);
    }
  }

  /**
   * Override the parent canGetHit method to use our constant
   */
  public override canGetHit(): boolean {
    return super.canGetHit(HIT_DELAY);
  }

  /**
   * Override the parent loseHp method for player-specific death behavior
   */
  public override loseHp(damage: number = 1): void {
    super.loseHp(damage);
    if (this.uiScene) {
      this.uiScene.playerHp = this.hp;
    }
  }

  /**
   * Override the parent onDeath method for player-specific death behavior
   */
  protected override onDeath(): void {
    // Player dies
    if (!this.tomb) {
      this.tomb = this.scene.add.sprite(this.x, this.y, ASSETS.IMAGES.TOMB).setScale(0.1);
    }
    this.destroy();
  }

  /**
   * Checks if player is currently loading/reloading
   */
  public isPlayerLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Checks if player is currently shooting
   */
  public isPlayerShooting(): boolean {
    return this.isShooting;
  }

  /**
   * Reloads the player's weapon
   */
  public reloadWeapon(): void {
    this.reload();
  }

  /**
   * Performs a shooting action
   */
  public shootWeapon(): void {
    this.shoot();
  }

  /**
   * Sets player to idle animation state
   */
  public setToIdle(): void {
    this.beIdle();
  }

  /**
   * Performs a punch action
   */
  public performPunch(): void {
    this.punch();
  }

  /**
   * Extends the parent moveInDirection to support animation control
   * 
   * @param direction The direction to move
   * @param speed Optional speed value, used as animation flag in player
   * @override
   */
  public override moveInDirection(direction: Orientation, speed?: number): void {
    // In Player class, we use the speed parameter as a flag for animation
    const shouldAnimate = speed !== 0; // If speed is 0, don't animate
    this.go(direction, shouldAnimate);
  }

  /**
   * Get the player's health points
   */
  public override get hp(): number {
    return this._hp;
  }

  /**
   * Set the player's health points and update the UI
   */
  public override set hp(value: number) {
    this._hp = value;
    if (this.uiScene) {
      this.uiScene.playerHp = value;
    }
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
    // Use parent class movement
    super.moveInDirection(direction, PLAYER_SPEED);

    if (!shouldAnimate) {
      return;
    }

    this.animate(Player.MOVE_ANIMATION, this.orientation);
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
    this.scene.physics.add.collider(arrow, this.scene.monsterGroup, (a: Arrow, m: NonPlayerEntity) => {
      m.loseHp(a);
    });
  };

  private shoot() {
    this.isShooting = true;

    this.animate(Player.SHOOT_ANIMATION, this.orientation);
    // Arrow will be spawned at the end of the animation
  }
}
