/**
 * @fileoverview ChaseMovement behavior for entities that follow the player
 */

import { IMovementBehavior } from '../interfaces';
import { NonPlayerEntity } from '../../game-objects/entities/NonPlayerEntity';
import { Orientation } from '../../geometry/orientation';

/**
 * ChaseMovement behavior for entities that chase the player
 * This is a temporary placeholder implementation that mimics the previous built-in behavior
 */
export class ChaseMovement implements IMovementBehavior {
  private static readonly CHASE_UPDATE_INTERVAL = 500;
  private static readonly CHASE_START_DELAY = 2000;
  private chasingPlayerTimerEvent: Phaser.Time.TimerEvent | null = null;
  private isStartled = false;
  private chasingDistance = 100;

  constructor(chasingDistance = 100) {
    this.chasingDistance = chasingDistance;
  }

  /**
   * Update method called every frame
   */
  update(entity: NonPlayerEntity): void {
    this.handleChase(entity);
  }

  /**
   * Move entity towards a target position
   */
  move(entity: NonPlayerEntity, target?: Phaser.Math.Vector2): void {
    if (!entity.active) return;

    // Default to player if no target provided
    if (!target) {
      const scene = entity.getScene();
      const playerPoint = scene.player.getCenter();
      const entityPoint = entity.getCenter();
      const { x, y } = playerPoint.subtract(entityPoint);
      this.run(entity, x, y);
    } else {
      const entityPoint = entity.getCenter();
      const x = target.x - entityPoint.x;
      const y = target.y - entityPoint.y;
      this.run(entity, x, y);
    }
  }

  /**
   * Stop entity movement
   */
  stop(entity: NonPlayerEntity): void {
    if (!entity.active) return;
    entity.setVelocity(0);
    entity.playAnimation('idle', Orientation.Down);
  }

  /**
   * Determines if the entity should chase the player
   */
  private shouldChase(entity: NonPlayerEntity): boolean {
    if (this.isStartled) return true;
    
    const scene = entity.getScene();
    const playerPoint = scene.player.getCenter();
    const entityPoint = entity.getCenter();
    const distance = entityPoint.distance(playerPoint);
    
    return distance < this.chasingDistance;
  }

  /**
   * Gets the orientation based on movement direction
   */
  private getOrientationFromDirection(x: number, y: number): Orientation {
    if (Math.abs(y) > Math.abs(x)) {
      return y < 0 ? Orientation.Up : Orientation.Down;
    }
    return x < 0 ? Orientation.Left : Orientation.Right;
  }

  /**
   * Sets the entity's velocity based on direction
   */
  private run(entity: NonPlayerEntity, x: number, y: number): void {
    if (x === 0 && y === 0 || !entity.active) return;

    const speed = 20; // Temporary hardcoded speed
    entity.setVelocityX(Math.sign(x) * speed);
    entity.setVelocityY(Math.sign(y) * speed);

    const orientation = this.getOrientationFromDirection(x, y);
    entity.playAnimation('walk', orientation);
  }

  /**
   * Starts the chasing behavior timer
   */
  private startChasing(entity: NonPlayerEntity): void {
    const scene = entity.getScene();
    this.chasingPlayerTimerEvent = scene.time.addEvent({
      delay: ChaseMovement.CHASE_UPDATE_INTERVAL,
      callback: () => this.move(entity),
      callbackScope: this,
      repeat: Infinity,
      startAt: ChaseMovement.CHASE_START_DELAY,
    });
  }

  /**
   * Stops the chasing behavior
   */
  private stopChasing(entity: NonPlayerEntity): void {
    if (entity.active) {
      this.stop(entity);
    }
    
    if (this.chasingPlayerTimerEvent) {
      this.chasingPlayerTimerEvent.destroy();
      this.chasingPlayerTimerEvent = null;
    }
  }

  /**
   * Manages the entity's chase behavior
   */
  private handleChase(entity: NonPlayerEntity): void {
    const shouldChase = this.shouldChase(entity);
    
    if (!this.chasingPlayerTimerEvent && shouldChase) {
      this.startChasing(entity);
      return;
    }

    if (this.chasingPlayerTimerEvent && !shouldChase) {
      this.stopChasing(entity);
    }
  }
} 