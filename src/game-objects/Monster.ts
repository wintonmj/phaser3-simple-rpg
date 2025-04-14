/**
 * @fileoverview Abstract Monster class that extends the base Character class.
 * Provides common functionality for all monster types including movement, combat, and AI behavior.
 */

import { Orientation } from '../geometry/orientation';
import { Character } from './Character';
import { ASSETS } from '../constants/assets';

/**
 * Abstract base class for all monsters in the game.
 * Provides common functionality for movement, combat, and AI behavior.
 * 
 * @abstract
 * @class Monster
 * @extends {Character}
 */
export abstract class Monster extends Character {
  /** Function that returns a random delay for wandering behavior */
  private static WANDER_DELAY = () => 1000 + 1000 * Math.random();
  /** Function that returns a random duration for wandering behavior */
  private static WANDER_LENGTH = () => 1000 + 5000 * Math.random();

  /** Animation configuration for monster walking */
  protected abstract WALK_ANIMATION;
  /** Animation key for monster idle down state */
  protected abstract MONSTER_IDLE_DOWN;
  /** Monster movement speed */
  protected MONSTER_SPEED = 20;
  /** Delay between monster hits in milliseconds */
  protected MONSTER_HIT_DELAY = 100;
  /** Distance at which monster will start chasing the player */
  protected CHASING_DISTANCE = 100;

  /** Monster's health points */
  protected hp: number;
  /** Timer event for chasing behavior */
  private chasingPlayerTimerEvent: Phaser.Time.TimerEvent;
  /** Whether the monster is currently wandering */
  private isWandering = false;
  /** Whether the monster is startled (after being hit) */
  private isStartled = false;

  /**
   * Updates the monster's behavior each frame
   */
  public updateMonster() {
    if (!this.active) {
      return;
    }
    this.handleChase();
  }

  /**
   * Attacks the player if they can be hit
   */
  public attack = () => {
    if (!this.scene.player.canGetHit()) {
      return;
    }

    this.scene.player.loseHp();
    this.animateAttack();
  };

  /**
   * Reduces monster's HP when hit by a projectile
   * 
   * @param {Phaser.Physics.Arcade.Sprite} projectile - The projectile that hit the monster
   */
  public loseHp = (projectile: Phaser.Physics.Arcade.Sprite) => {
    this.hp--;
    this.isStartled = true;
    this.setTint(0xff0000);
    this.scene.time.addEvent({
      delay: this.MONSTER_HIT_DELAY,
      callback: () => this.clearTint(),
      callbackScope: this,
    });
    projectile.destroy();
    if (this.hp === 0) {
      this.die();
    }
  };

  protected abstract animateAttack(): void;

  private die = () => {
    const deathAnim = this.scene.add.sprite(this.x, this.y, ASSETS.IMAGES.MONSTER_DEATH);
    this.destroy();
    deathAnim.play(ASSETS.ANIMATIONS.MONSTER_DEATH, false);
  };

  private shouldChase = () => {
    const playerPoint = this.scene.player.getCenter();
    const monsterPoint = this.getCenter();
    const distance = monsterPoint.distance(playerPoint);

    if (distance < this.CHASING_DISTANCE) {
      return true;
    }

    if (this.isStartled) {
      return true;
    }

    return false;
  };

  private getOrientationFromTargettedPosition(x: number, y: number): Orientation {
    if (Math.abs(y) > Math.abs(x)) {
      return y < 0 ? Orientation.Up : Orientation.Down;
    }

    return x < 0 ? Orientation.Left : Orientation.Right;
  }

  private moveTowardsPlayer() {
    if (!this.active) {
      return;
    }

    const playerPoint = this.scene.player.getCenter();
    const monsterPoint = this.getCenter();
    const { x, y } = playerPoint.subtract(monsterPoint);

    this.run(x, y);
  }

  private run(x: number, y: number) {
    if (x === 0 && y === 0) {
      return;
    }

    if (!this.active) {
      return;
    }

    this.setVelocityX(Math.sign(x) * this.MONSTER_SPEED);
    this.setVelocityY(Math.sign(y) * this.MONSTER_SPEED);

    const orientation = this.getOrientationFromTargettedPosition(x, y);

    this.animate(this.WALK_ANIMATION, orientation);
  }

  private stopRunning() {
    if (!this.active) {
      return;
    }

    this.setVelocity(0);
    this.beIdle();
  }

  private startChasing() {
    this.chasingPlayerTimerEvent = this.scene.time.addEvent({
      delay: 500,
      callback: this.moveTowardsPlayer,
      callbackScope: this,
      repeat: Infinity,
      startAt: 2000,
    });
  }

  private beIdle() {
    this.play(this.MONSTER_IDLE_DOWN);
  }

  private stopChasing() {
    if (this.active) {
      this.stopRunning();
    }
    this.chasingPlayerTimerEvent.destroy();
    this.chasingPlayerTimerEvent = null;
  }

  private handleChase() {
    if (!this.chasingPlayerTimerEvent && this.shouldChase()) {
      this.startChasing();
      return;
    }

    if (this.chasingPlayerTimerEvent && !this.shouldChase()) {
      this.stopChasing();
    }

    if (!this.shouldChase()) {
      this.wanderAround();
    }
  }

  private wanderAround() {
    if (this.isWandering) {
      return;
    }

    this.isWandering = true;

    const direction = this.getRandomDirection();
    this.run(direction.x, direction.y);

    this.scene.time.addEvent({
      delay: Monster.WANDER_LENGTH(),
      callbackScope: this,
      callback: () => {
        this.stopRunning();

        if (!this.active) {
          return;
        }

        this.scene.time.addEvent({
          delay: Monster.WANDER_DELAY(),
          callbackScope: this,
          callback: () => {
            this.isWandering = false;
          },
        });
      },
    });
  }

  private getRandomDirection() {
    const randomBetweenMinusOneAndOne = () => Math.round(2 * Math.random()) - 1;
    const x = randomBetweenMinusOneAndOne();
    const y = randomBetweenMinusOneAndOne();

    return { x, y };
  }
}
