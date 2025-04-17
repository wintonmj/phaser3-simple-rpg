/**
 * @fileoverview ChaseMovement behavior for entities that follow the player
 */

import { IMovementBehavior } from '../interfaces';
import { Character } from '../../game-objects/Character';
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
  update(character: Character): void {
    // Only apply chase behavior to NonPlayerEntity instances
    if (character instanceof NonPlayerEntity) {
      this.handleChase(character);
    }
  }

  /**
   * Move entity towards a target position
   */
  move(character: Character, target?: Phaser.Math.Vector2): void {
    if (!character.active) return;

    // Cast to NonPlayerEntity for scene access
    const npc = character as NonPlayerEntity;

    // Default to player if no target provided
    if (!target) {
      const scene = npc.getScene();
      const playerPoint = scene.player.getCenter();
      const entityPoint = character.getCenter();
      const { x, y } = playerPoint.subtract(entityPoint);
      this.run(character, x, y);
    } else {
      const entityPoint = character.getCenter();
      const x = target.x - entityPoint.x;
      const y = target.y - entityPoint.y;
      this.run(character, x, y);
    }
  }

  /**
   * Stop entity movement
   */
  stop(character: Character): void {
    if (!character.active) return;
    character.setVelocity(0);
    
    // Use Character's setToIdle method
    character.setToIdle();
  }

  /**
   * Determines if the entity should chase the player
   */
  private shouldChase(character: NonPlayerEntity): boolean {
    if (this.isStartled) return true;
    
    const scene = character.getScene();
    const playerPoint = scene.player.getCenter();
    const entityPoint = character.getCenter();
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
  private run(character: Character, x: number, y: number): void {
    if (x === 0 && y === 0 || !character.active) return;

    const speed = 20; // Temporary hardcoded speed
    const orientation = this.getOrientationFromDirection(x, y);
    
    // First try moveInDirection which handles animation properly
    character.moveInDirection(orientation, speed);
  }

  /**
   * Starts the chasing behavior timer
   */
  private startChasing(character: NonPlayerEntity): void {
    const scene = character.getScene();
    this.chasingPlayerTimerEvent = scene.time.addEvent({
      delay: ChaseMovement.CHASE_UPDATE_INTERVAL,
      callback: () => this.move(character),
      callbackScope: this,
      repeat: Infinity,
      startAt: ChaseMovement.CHASE_START_DELAY,
    });
  }

  /**
   * Stops the chasing behavior
   */
  private stopChasing(character: NonPlayerEntity): void {
    if (character.active) {
      this.stop(character);
    }
    
    if (this.chasingPlayerTimerEvent) {
      this.chasingPlayerTimerEvent.destroy();
      this.chasingPlayerTimerEvent = null;
    }
  }

  /**
   * Manages the entity's chase behavior
   */
  private handleChase(character: NonPlayerEntity): void {
    const shouldChase = this.shouldChase(character);
    
    if (!this.chasingPlayerTimerEvent && shouldChase) {
      this.startChasing(character);
      return;
    }

    if (this.chasingPlayerTimerEvent && !shouldChase) {
      this.stopChasing(character);
    }
  }
} 