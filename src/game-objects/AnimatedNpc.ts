/**
 * @fileoverview Animated NPC class that extends the base Character class.
 * Provides animations and interactions for NPCs using Goku spritesheets.
 */

import { Orientation } from '../geometry/orientation';
import { Character, CharacterAnimation } from './Character';
import { AbstractScene } from '../scenes/AbstractScene';
import { ASSETS } from '../constants/assets';

const TEXT_VERTICAL_SHIFT = 10;
const NPC_WANDER_DELAY = () => 3000 + 2000 * Math.random();
const NPC_WANDER_LENGTH = () => 1000 + 2000 * Math.random();
const NPC_SPEED = 40;

/**
 * Animated NPC class that extends the base Character class.
 * Provides animations and interactions for NPCs using Goku spritesheets.
 * 
 * @class AnimatedNpc
 * @extends {Character}
 */
export class AnimatedNpc extends Character {
  /** Animation configurations for NPC walking in different directions */
  private static WALK_ANIMATION: CharacterAnimation = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_WALK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_WALK_UP },
    left: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_WALK_LEFT },
    right: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_WALK_RIGHT },
  };

  /** Animation configurations for NPC idle state */
  private static IDLE_ANIMATION: CharacterAnimation = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_IDLE },
    up: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_IDLE },
    left: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_IDLE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_IDLE },
  };

  /** Animation configurations for NPC combat idle state */
  private static COMBAT_IDLE_ANIMATION: CharacterAnimation = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_COMBAT_IDLE },
    up: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_COMBAT_IDLE },
    left: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_COMBAT_IDLE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_COMBAT_IDLE },
  };

  /** Animation configurations for NPC slashing action */
  private static SLASH_ANIMATION: CharacterAnimation = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_SLASH },
    up: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_SLASH },
    left: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_SLASH },
    right: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_SLASH },
  };

  /** Text displayed above the NPC when interacted with */
  private textGameObject: Phaser.GameObjects.Text;
  /** Current orientation of the NPC */
  private orientation: Orientation;
  /** Whether the NPC is currently wandering */
  private isWandering: boolean;
  /** Whether the NPC is in combat mode */
  private isInCombatMode: boolean;
  /** Whether the NPC should wander around */
  private shouldWander: boolean;

  /**
   * Creates an instance of AnimatedNpc.
   * 
   * @param {AbstractScene} scene - The scene the NPC belongs to
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   * @param {string} text - Text to display when interacting with the NPC
   * @param {boolean} shouldWander - Whether the NPC should wander around
   * @param {boolean} combatMode - Whether the NPC should be in combat mode initially
   */
  constructor(
    scene: AbstractScene, 
    x: number, 
    y: number, 
    text: string, 
    shouldWander: boolean = false,
    combatMode: boolean = false
  ) {
    super(scene, x, y, ASSETS.IMAGES.GOKU_IDLE);
    
    this.textGameObject = this.scene.add.text(0, 0, text, { align: 'center', fontSize: '10px' });
    this.textGameObject.setWordWrapWidth(150);
    this.textGameObject.setPosition(
      this.x + (this.width - this.textGameObject.width) / 2,
      this.y - this.textGameObject.height - TEXT_VERTICAL_SHIFT,
    );
    this.textGameObject.setAlpha(0).setDepth(1000);
    
    this.orientation = Orientation.Down;
    this.isWandering = false;
    this.isInCombatMode = combatMode;
    this.shouldWander = shouldWander;
    
    // Set up physics body properly
    scene.physics.world.enable(this);
    this.setDepth(5);
    this.setOrigin(0.5, 0.7);
    this.setSize(20, 30);
    this.setOffset(22, 24);
    this.setScale(0.5);
    this.setCollideWorldBounds(true);
    this.setImmovable(false);
    
    // Start with idle animation
    if (this.isInCombatMode) {
      this.animate(AnimatedNpc.COMBAT_IDLE_ANIMATION, this.orientation);
    } else {
      this.animate(AnimatedNpc.IDLE_ANIMATION, this.orientation);
    }
    
    // Listen for animation complete events
    this.on('animationcomplete', this.handleAnimationComplete, this);
  }

  /**
   * Updates the NPC's behavior
   */
  public update(): void {
    if (!this.active) return;
    
    // Update text position to follow NPC
    this.updateTextPosition();
    
    // Handle wandering if NPC should wander
    if (this.shouldWander && !this.isWandering) {
      this.wanderAround();
    }
  }

  /**
   * Makes the NPC talk by displaying its text
   */
  public talk(): void {
    if (!this.active || !this.textGameObject) return;
    
    this.textGameObject.setAlpha(1);
    
    // Hide the text after a delay
    this.scene.time.addEvent({
      delay: 3000,
      callback: this.hideText,
      callbackScope: this,
    });
  }

  /**
   * Makes the NPC perform a slash animation
   */
  public slash(): void {
    this.animate(AnimatedNpc.SLASH_ANIMATION, this.orientation);
  }

  /**
   * Toggles the NPC's combat mode
   */
  public toggleCombatMode(): void {
    this.isInCombatMode = !this.isInCombatMode;
    
    if (this.isInCombatMode) {
      this.animate(AnimatedNpc.COMBAT_IDLE_ANIMATION, this.orientation);
    } else {
      this.animate(AnimatedNpc.IDLE_ANIMATION, this.orientation);
    }
  }

  /**
   * Sets the NPC's orientation and updates animation accordingly
   */
  public setNpcOrientation(orientation: Orientation): void {
    this.orientation = orientation;
    
    if (this.isInCombatMode) {
      this.animate(AnimatedNpc.COMBAT_IDLE_ANIMATION, this.orientation);
    } else {
      this.animate(AnimatedNpc.IDLE_ANIMATION, this.orientation);
    }
  }

  /**
   * Hides the NPC's text
   */
  private hideText(): void {
    if (!this.active || !this.textGameObject) return;
    this.textGameObject.setAlpha(0);
  }

  /**
   * Updates the position of the text to follow the NPC
   */
  private updateTextPosition(): void {
    if (!this.active || !this.textGameObject) return;
    
    this.textGameObject.setPosition(
      this.x + (this.width - this.textGameObject.width) / 2,
      this.y - this.textGameObject.height - TEXT_VERTICAL_SHIFT,
    );
  }

  /**
   * Makes the NPC wander in a random direction.
   * Based on Monster.wanderAround() implementation.
   */
  private wanderAround(): void {
    if (this.isWandering) return;

    this.isWandering = true;
    const direction = this.getRandomDirection();
    this.run(direction.x, direction.y);

    this.scene.time.addEvent({
      delay: NPC_WANDER_LENGTH(),
      callbackScope: this,
      callback: () => {
        this.stopRunning();

        if (!this.active) return;

        this.scene.time.addEvent({
          delay: NPC_WANDER_DELAY(),
          callbackScope: this,
          callback: () => {
            this.isWandering = false;
          },
        });
      },
    });
  }

  /**
   * Sets the NPC's velocity based on direction.
   * Similar to Monster.run() implementation.
   */
  private run(x: number, y: number): void {
    if (x === 0 && y === 0 || !this.active) return;

    this.setVelocityX(Math.sign(x) * NPC_SPEED);
    this.setVelocityY(Math.sign(y) * NPC_SPEED);

    const orientation = this.getOrientationFromTargettedPosition(x, y);
    this.animate(AnimatedNpc.WALK_ANIMATION, orientation);
  }

  /**
   * Stops the NPC's movement and plays idle animation.
   * Similar to Monster.stopRunning() implementation.
   */
  private stopRunning(): void {
    if (!this.active) return;
    
    this.setVelocity(0, 0);
    
    if (this.isInCombatMode) {
      this.animate(AnimatedNpc.COMBAT_IDLE_ANIMATION, this.orientation);
    } else {
      this.animate(AnimatedNpc.IDLE_ANIMATION, this.orientation);
    }
  }

  /**
   * Gets the orientation based on movement direction.
   * Similar to Monster.getOrientationFromTargettedPosition() implementation.
   */
  private getOrientationFromTargettedPosition(x: number, y: number): Orientation {
    if (Math.abs(y) > Math.abs(x)) {
      return y < 0 ? Orientation.Up : Orientation.Down;
    }
    return x < 0 ? Orientation.Left : Orientation.Right;
  }

  /**
   * Generates a random direction vector.
   * Updated to match Monster's implementation.
   */
  private getRandomDirection(): { x: number; y: number } {
    const randomBetweenMinusOneAndOne = () => Math.round(2 * Math.random()) - 1;
    return { 
      x: randomBetweenMinusOneAndOne(), 
      y: randomBetweenMinusOneAndOne() 
    };
  }

  /**
   * Handles animation complete events
   */
  private handleAnimationComplete(animation: Phaser.Animations.Animation): void {
    // Return to idle animation after slash
    if (animation.key === ASSETS.ANIMATIONS.GOKU_SLASH) {
      if (this.isInCombatMode) {
        this.animate(AnimatedNpc.COMBAT_IDLE_ANIMATION, this.orientation);
      } else {
        this.animate(AnimatedNpc.IDLE_ANIMATION, this.orientation);
      }
    }
  }
} 