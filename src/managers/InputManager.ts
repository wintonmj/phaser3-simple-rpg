/**
 * @fileoverview Input manager for keyboard handling and state tracking
 */

import { IInputManager } from '../types/manager-interfaces';
import { KeyState } from '../types/scene-types';
import { SCENES } from '../constants/scenes';
import { BaseManager } from './BaseManager';

/**
 * Manages keyboard input and state tracking
 */
export class InputManager extends BaseManager implements IInputManager {
  private cursors: CursorKeys;
  private keyboardHandler: (event: KeyboardEvent) => void;
  private escKey: Phaser.Input.Keyboard.Key;
  private keyState: KeyState = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
    shift: false,
    esc: false
  };

  /**
   * Create a new InputManager
   * @param scene - The scene this manager belongs to
   */
  constructor(scene: Phaser.Scene) {
    super(scene);
    this.keyboardHandler = () => {};
    this.cursors = {} as CursorKeys; // Will be initialized in initialize()
    this.escKey = null;
  }

  /**
   * Initialize input handlers
   */
  public initialize(): void {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.escKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.setupKeyboardShortcuts(this.scene);
  }

  /**
   * Set up keyboard shortcuts
   * @param scene - Reference to the current scene for scene switching
   */
  public setupKeyboardShortcuts(scene: Phaser.Scene): void {
    // Create a key map to avoid switch statements in the handler
    const keyActionMap: Record<string, () => void> = {
      '1': () => {
        if (scene.scene.key !== SCENES.FIRST_LEVEL) {
          scene.scene.start(SCENES.FIRST_LEVEL, { comesFrom: scene.scene.key });
        }
      },
      '2': () => {
        if (scene.scene.key !== SCENES.SECOND_LEVEL) {
          scene.scene.start(SCENES.SECOND_LEVEL, { comesFrom: scene.scene.key });
        }
      }
    };
    
    // Use a single keyboard handler for all shortcuts
    this.keyboardHandler = (event: KeyboardEvent) => {
      const action = keyActionMap[event.key];
      if (action) {
        action();
      }
    };
    
    scene.input.keyboard.on('keydown', this.keyboardHandler);
  }

  /**
   * Get the current key state
   */
  public getKeyState(): KeyState {
    return this.keyState;
  }

  /**
   * Update the key state based on current input
   */
  public update(): void {
    this.keyState.left = this.cursors.left.isDown;
    this.keyState.right = this.cursors.right.isDown;
    this.keyState.up = this.cursors.up.isDown;
    this.keyState.down = this.cursors.down.isDown;
    this.keyState.space = this.cursors.space.isDown;
    this.keyState.shift = this.cursors.shift.isDown;
    this.keyState.esc = this.escKey ? this.escKey.isDown : false;
  }

  /**
   * Get cursor key objects
   */
  public getCursors(): CursorKeys {
    return this.cursors;
  }

  /**
   * Remove event listeners when shutting down
   */
  public shutdown(): void {
    if (this.keyboardHandler) {
      this.scene.input.keyboard.off('keydown', this.keyboardHandler, this.scene, false);
    }
  }
} 