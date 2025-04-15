/**
 * @fileoverview Camera manager for camera setup and following behavior
 */

import { ICameraManager } from '../types/manager-interfaces';

/** Camera lerp factor for smooth camera movement */
const CAMERA_LERP = 1;

/**
 * Manages camera setup and behavior
 */
export class CameraManager implements ICameraManager {
  private scene: Phaser.Scene;
  private cameraBounds: Phaser.Geom.Rectangle;
  private target: Phaser.GameObjects.GameObject | null = null;

  /**
   * Create a new CameraManager
   * @param scene - The scene this manager belongs to
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cameraBounds = new Phaser.Geom.Rectangle(0, 0, 0, 0);
  }

  /**
   * Initialize the camera
   * @param mapWidth - Width of the map in pixels
   * @param mapHeight - Height of the map in pixels
   * @param target - The object for the camera to follow
   */
  public initialize(mapWidth: number, mapHeight: number, target: Phaser.GameObjects.GameObject): void {
    this.target = target;
    this.setupCamera(mapWidth, mapHeight);
  }

  /**
   * Set up the camera with optimized settings
   */
  private setupCamera(mapWidth: number, mapHeight: number): void {
    const mainCamera = this.scene.cameras.main;
    
    // Optimize rendering
    mainCamera.setRoundPixels(true);
    
    // Set camera bounds to match map dimensions
    mainCamera.setBounds(0, 0, mapWidth, mapHeight);
    
    // Start following the target (usually the player)
    if (this.target) {
      mainCamera.startFollow(this.target, true, CAMERA_LERP, CAMERA_LERP);
    }
    
    // Initialize camera bounds for culling calculations
    this.updateCameraBounds();
  }

  /**
   * Update camera position and bounds
   */
  public update(): void {
    this.updateCameraBounds();
  }

  /**
   * Update the camera bounds for culling calculations
   */
  private updateCameraBounds(): void {
    const camera = this.scene.cameras.main;
    this.cameraBounds.x = camera.scrollX;
    this.cameraBounds.y = camera.scrollY;
    this.cameraBounds.width = camera.width;
    this.cameraBounds.height = camera.height;
  }

  /**
   * Get current camera bounds
   */
  public getCameraBounds(): Phaser.Geom.Rectangle {
    return this.cameraBounds;
  }

  /**
   * Clean up camera resources
   */
  public shutdown(): void {
    // Reset camera
    const mainCamera = this.scene.cameras.main;
    mainCamera.stopFollow();
    this.target = null;
  }
} 