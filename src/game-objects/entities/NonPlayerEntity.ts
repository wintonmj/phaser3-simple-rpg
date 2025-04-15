/**
 * @fileoverview Abstract NonPlayerEntity class that extends the base Character class.
 * Provides common functionality for all non-player entities including movement, combat, and AI behavior.
 */

import { Orientation } from '../../geometry/orientation';
import { Character, CharacterAnimation } from '../Character';
import { ASSETS } from '../../constants/assets';

/**
 * Abstract base class for all non-player entities in the game.
 * Provides common functionality for movement, combat, and AI behavior.
 * 
 * @abstract
 * @class NonPlayerEntity
 * @extends {Character}
 */
export abstract class NonPlayerEntity extends Character {
  // Constants
  private static readonly WANDER_DELAY = () => 1000 + 1000 * Math.random();
  private static readonly WANDER_LENGTH = () => 1000 + 5000 * Math.random();
  private static readonly CHASE_UPDATE_INTERVAL = 500;
  private static readonly CHASE_START_DELAY = 2000;

  // Abstract properties to be implemented by subclasses
  protected abstract WALK_ANIMATION: CharacterAnimation;
  protected abstract MONSTER_IDLE_DOWN: CharacterAnimation;

  // Configurable properties
  protected MONSTER_SPEED = 20;
  protected MONSTER_HIT_DELAY = 100;
  protected CHASING_DISTANCE = 100;
  protected hp: number;

  // State tracking
  private chasingPlayerTimerEvent: Phaser.Time.TimerEvent | null = null;
  private isWandering = false;
  private isStartled = false;

  /**
   * Updates the entity's behavior each frame
   */
  public updateEntity(): void {
    if (!this.active) return;
    this.handleChase();
  }

  /**
   * Attacks the player if they can be hit
   */
  public attack(): void {
    if (!this.scene.player.canGetHit()) return;
    
    this.scene.player.loseHp();
    this.animateAttack();
  };

  /**
   * Reduces entity's HP when hit by a projectile
   * 
   * @param {Phaser.Physics.Arcade.Sprite} projectile - The projectile that hit the entity
   */
  public loseHp(projectile: Phaser.Physics.Arcade.Sprite): void {
    this.hp--;
    this.isStartled = true;
    this.setTint(0xff0000);
    
    this.scene.time.addEvent({
      delay: this.MONSTER_HIT_DELAY,
      callback: () => this.clearTint(),
      callbackScope: this,
    });
    
    projectile.destroy();
    
    if (this.hp <= 0) {
      this.die();
    }
  };

  /**
   * Abstract method to be implemented by subclasses for attack animation
   */
  protected abstract animateAttack(): void;

  /**
   * Handles entity death and plays death animation
   */
  private die(): void {
    const deathAnim = this.scene.add.sprite(this.x, this.y, ASSETS.IMAGES.MONSTER_DEATH);
    this.destroy();
    deathAnim.play(ASSETS.ANIMATIONS.MONSTER_DEATH, false);
  };

  /**
   * Determines if the entity should chase the player
   */
  private shouldChase(): boolean {
    if (this.isStartled) return true;
    
    const playerPoint = this.scene.player.getCenter();
    const entityPoint = this.getCenter();
    const distance = entityPoint.distance(playerPoint);
    
    return distance < this.CHASING_DISTANCE;
  };

  /**
   * Gets the orientation based on movement direction
   */
  private getOrientationFromTargettedPosition(x: number, y: number): Orientation {
    if (Math.abs(y) > Math.abs(x)) {
      return y < 0 ? Orientation.Up : Orientation.Down;
    }
    return x < 0 ? Orientation.Left : Orientation.Right;
  }

  /**
   * Moves the entity towards the player
   */
  private moveTowardsPlayer(): void {
    if (!this.active) return;

    const playerPoint = this.scene.player.getCenter();
    const entityPoint = this.getCenter();
    const { x, y } = playerPoint.subtract(entityPoint);

    this.run(x, y);
  }

  /**
   * Sets the entity's velocity based on direction
   */
  private run(x: number, y: number): void {
    if (x === 0 && y === 0 || !this.active) return;

    this.setVelocityX(Math.sign(x) * this.MONSTER_SPEED);
    this.setVelocityY(Math.sign(y) * this.MONSTER_SPEED);

    const orientation = this.getOrientationFromTargettedPosition(x, y);
    this.animate(this.WALK_ANIMATION, orientation);
  }

  /**
   * Stops the entity's movement and plays idle animation
   */
  private stopRunning(): void {
    if (!this.active) return;
    
    this.setVelocity(0);
    this.beIdle();
  }

  /**
   * Starts the chasing behavior timer
   */
  private startChasing(): void {
    this.chasingPlayerTimerEvent = this.scene.time.addEvent({
      delay: NonPlayerEntity.CHASE_UPDATE_INTERVAL,
      callback: this.moveTowardsPlayer,
      callbackScope: this,
      repeat: Infinity,
      startAt: NonPlayerEntity.CHASE_START_DELAY,
    });
  }

  /**
   * Plays the idle animation
   */
  protected beIdle(): void {
    this.animate(this.MONSTER_IDLE_DOWN, Orientation.Down);
  }

  /**
   * Stops the chasing behavior
   */
  private stopChasing(): void {
    if (this.active) {
      this.stopRunning();
    }
    
    if (this.chasingPlayerTimerEvent) {
      this.chasingPlayerTimerEvent.destroy();
      this.chasingPlayerTimerEvent = null;
    }
  }

  /**
   * Manages the entity's chase behavior
   */
  private handleChase(): void {
    const shouldChase = this.shouldChase();
    
    if (!this.chasingPlayerTimerEvent && shouldChase) {
      this.startChasing();
      return;
    }

    if (this.chasingPlayerTimerEvent && !shouldChase) {
      this.stopChasing();
    }

    if (!shouldChase) {
      this.wanderAround();
    }
  }

  /**
   * Makes the entity wander in a random direction
   */
  private wanderAround(): void {
    if (this.isWandering) return;

    this.isWandering = true;
    const direction = this.getRandomDirection();
    this.run(direction.x, direction.y);

    this.scene.time.addEvent({
      delay: NonPlayerEntity.WANDER_LENGTH(),
      callbackScope: this,
      callback: () => {
        this.stopRunning();

        if (!this.active) return;

        this.scene.time.addEvent({
          delay: NonPlayerEntity.WANDER_DELAY(),
          callbackScope: this,
          callback: () => {
            this.isWandering = false;
          },
        });
      },
    });
  }

  /**
   * Generates a random direction vector
   */
  private getRandomDirection(): { x: number; y: number } {
    const randomBetweenMinusOneAndOne = () => Math.round(2 * Math.random()) - 1;
    return { 
      x: randomBetweenMinusOneAndOne(), 
      y: randomBetweenMinusOneAndOne() 
    };
  }
} 