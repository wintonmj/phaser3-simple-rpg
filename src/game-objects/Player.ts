/**
 * @fileoverview Player character class that extends the base Character class.
 * Handles player movement, combat, and animations.
 */

import { Character } from './Character';
import { CharacterState } from '../constants/character-states';
import { Arrow } from './projectiles/Arrow';
import { NonPlayerEntity } from './entities/NonPlayerEntity';
import { AbstractScene } from '../scenes/AbstractScene';
import { ASSETS } from '../constants/assets';
import { IInputBehavior } from '../behaviors/interfaces';
import { PLAYER_ANIMATIONS } from '../constants/animation-configs';

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

  /** Tomb sprite shown when player dies */
  private tomb: Phaser.GameObjects.Sprite = null;
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
    this.setSize(10, 10);
    this.setDepth(10);
    this.moveSpeed = 120;

    // Set up animation sets using shared configs
    this.setupAnimations(PLAYER_ANIMATIONS);

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
   * Reloads the player's weapon
   */
  public reloadWeapon(): void {
    this.actionState = CharacterState.RELOADING;
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
    this.actionState = CharacterState.IDLE;
  }

  /**
   * Performs a shooting action
   */
  public shootWeapon(): void {
    this.actionState = CharacterState.SHOOTING;
    this.isPerformingAction = true;
    this.playAnimation(CharacterState.HIT);
    // Arrow will be spawned at the end of the animation
  }

  /**
   * Performs a punch action
   */
  public performPunch(): void {
    this.actionState = CharacterState.PUNCHING;
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
        this.actionState = CharacterState.IDLE;
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
    this.actionState = CharacterState.IDLE;
    this.isPerformingAction = false;
    
    const arrow = new Arrow(this.scene, this.x, this.y, this.orientation);
    this.scene.physics.add.collider(arrow, this.scene.monsterGroup, (a: Arrow, m: NonPlayerEntity) => {
      m.loseHp(a);
    });
  }
}
