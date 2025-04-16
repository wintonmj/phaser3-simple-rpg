/**
 * @fileoverview Player character class that extends the base Character class.
 * Handles player movement, combat, and animations.
 */

import { Character, CharacterState } from './Character';
import { Arrow } from './projectiles/Arrow';
import { NonPlayerEntity } from './entities/NonPlayerEntity';
import { AbstractScene } from '../scenes/AbstractScene';
import { ASSETS } from '../constants/assets';
import { IInputBehavior } from '../behaviors/interfaces';

/** Delay between hits in milliseconds */
const HIT_DELAY = 500;
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
  public static readonly MAX_HP = 10;

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

    // Set up player-specific properties
    this._maxHp = Player.MAX_HP;
    this.hp = this._maxHp;
    // Note: using the default moveSpeed (80) inherited from Character
    
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 0.7);
    this.setSize(10, 10);
    this.setDepth(10);
    
    this.isLoading = false;
    this.isShooting = false;
    this.tomb = null;
    this.moveSpeed = 120;

    // Set up animation sets
    this.setupAnimations({
      [CharacterState.IDLE]: {
        down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_DOWN },
        up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_UP },
        left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
        right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
      },
      [CharacterState.MOVE]: {
        down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_DOWN },
        up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_UP },
        left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_LEFT },
        right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_RIGHT },
      },
      [CharacterState.ATTACK]: {
        down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_DOWN },
        up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_UP },
        left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_SIDE },
        right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_SIDE },
      },
      [CharacterState.HIT]: {
        down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_DOWN },
        up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_UP },
        left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_SIDE },
        right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_SIDE },
      },
      [CharacterState.DEATH]: {
        down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_DOWN },
        up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_UP },
        left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
        right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
      }
    });

    this.on('animationrepeat', this.handleAnimationRepeat, this);
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
   * @override
   */
  public override update(): void {
    super.update();
    
    // Process input via the input behavior if available
    if (this.inputBehavior) {
      this.inputBehavior.update(this);
    }
  }

  /**
   * Override the default hit delay
   * @override
   */
  public override canGetHit(): boolean {
    return super.canGetHit(HIT_DELAY);
  }

  /**
   * Called when HP changes to update UI
   * @override
   */
  protected override onHpChanged(): void {
    if (this.uiScene) {
      this.uiScene.playerHp = this.hp;
    }
  }

  /**
   * Handle player death
   * @override
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
    this.isLoading = true;
    this.scene.time.addEvent({
      delay: PLAYER_RELOAD,
      callback: this.readyToFire,
      callbackScope: this,
    });
  }

  /**
   * Mark player as ready to fire
   */
  private readyToFire(): void {
    this.isLoading = false;
  }

  /**
   * Performs a shooting action
   */
  public shootWeapon(): void {
    this.isShooting = true;
    this.isPerformingAction = true;
    this.playAnimation(CharacterState.HIT);
    // Arrow will be spawned at the end of the animation
  }

  /**
   * Performs a punch action
   */
  public performPunch(): void {
    this.isPerformingAction = true;
    this.playAnimation(CharacterState.ATTACK);
  }

  /**
   * Handle animation repeat events
   */
  private handleAnimationRepeat(event: {key: string}): void {
    // Check which animation has repeated
    switch (event.key) {
      case this.animationSets[CharacterState.HIT].left.anim:
      case this.animationSets[CharacterState.HIT].right.anim:
      case this.animationSets[CharacterState.HIT].up.anim:
      case this.animationSets[CharacterState.HIT].down.anim:
        this.concludeShoot();
        break;
      case this.animationSets[CharacterState.ATTACK].left.anim:
      case this.animationSets[CharacterState.ATTACK].right.anim:
      case this.animationSets[CharacterState.ATTACK].up.anim:
      case this.animationSets[CharacterState.ATTACK].down.anim:
        this.isPerformingAction = false;
        break;
      default:
        break;
    }
  }

  /**
   * Finalize shooting action and spawn arrow
   */
  private concludeShoot(): void {
    this.isShooting = false;
    this.isPerformingAction = false;
    
    const arrow = new Arrow(this.scene, this.x, this.y, this.orientation);
    this.scene.physics.add.collider(arrow, this.scene.monsterGroup, (a: Arrow, m: NonPlayerEntity) => {
      m.loseHp(a);
    });
  }
}
