/**
 * @fileoverview Preloader scene that loads all game assets and creates animations.
 * This scene is responsible for loading images, spritesheets, and tilemaps before the game starts.
 */

import { MAPS } from '../constants/maps';
import { ASSETS } from '../constants/assets';
import { SCENES } from '../constants/scenes';
import { ENTITIES } from '../constants/entities';
import { ENTITY_DIMENSIONS } from '../constants/entity-animations';

/**
 * Preloader scene that loads all game assets and creates animations.
 * This scene is responsible for loading images, spritesheets, and tilemaps before the game starts.
 * 
 * @class Preloader
 * @extends {Phaser.Scene}
 */
export class Preloader extends Phaser.Scene {
  private loadingBar: Phaser.GameObjects.Graphics;
  private progressBar: Phaser.GameObjects.Graphics;
  private loadingText: Phaser.GameObjects.Text;

  /**
   * Preloads all game assets.
   * Called automatically by Phaser before the preload method.
   */
  protected preload() {
    this.createLoadingUI();
    this.setupLoadingEvents();
    this.loadAssets();
  }

  /**
   * Creates animations and launches the first level and game manager scenes.
   * Called automatically by Phaser after the preload method.
   */
  protected create() {
    this.createAnimations();
    this.scene.launch(SCENES.FIRST_LEVEL);
    this.scene.launch(SCENES.GAME_MANAGER);
  }

  /**
   * Creates the loading UI elements
   */
  private createLoadingUI() {
    // Create loading bar background
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x222222, 0.8);
    this.loadingBar.fillRect(240, 270, 320, 50);
    
    // Create progress bar
    this.progressBar = this.add.graphics();
    
    // Create loading text
    this.loadingText = this.add.text(400, 295, 'Loading...', {
      font: '20px monospace',
      color: '#ffffff'
    });
    this.loadingText.setOrigin(0.5, 0.5);
  }

  /**
   * Sets up loading events to update the progress bar
   */
  private setupLoadingEvents() {
    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0xffffff, 1);
      this.progressBar.fillRect(250, 280, 300 * value, 30);
      this.loadingText.setText(`Loading: ${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      this.progressBar.destroy();
      this.loadingBar.destroy();
      this.loadingText.destroy();
    });

    this.load.on('loaderror', (fileObj: Phaser.Loader.File) => {
      console.error('Error loading asset:', fileObj.src);
      this.loadingText.setText('Error loading assets. Please refresh.');
      this.loadingText.setColor('#ff0000');
    });
  }

  /**
   * Loads all game assets including tilemaps, images, and spritesheets.
   * Uses the constants defined in MAPS and ASSETS to load the correct files.
   */
  private loadAssets() {
    // Load maps
    this.loadMaps();
    
    // Load images
    this.loadImages();
    
    // Load player assets
    this.loadPlayerAssets();
    
    // Load enemy assets
    this.loadEnemyAssets();
    
    // Load Goku NPC assets
    this.loadGokuNpcAssets();
    
    // Load misc assets
    this.loadMiscAssets();
  }

  /**
   * Loads all map assets
   */
  private loadMaps() {
    this.load.tilemapTiledJSON(MAPS.firstLevel.key, `assets/${MAPS.firstLevel.file}`);
    this.load.tilemapTiledJSON(MAPS.secondLevel.key, `assets/${MAPS.secondLevel.file}`);
  }

  /**
   * Loads all static image assets
   */
  private loadImages() {
    this.load.image(ASSETS.IMAGES.TILES, 'assets/environment/tileset.png');
    this.load.image(ASSETS.IMAGES.ARROW, 'assets/spritesheets/misc/arrow.png');
    this.load.image(ASSETS.IMAGES.TREANT_ATTACK, 'assets/environment/sliced-objects/trunk.png');
    this.load.image(ASSETS.IMAGES.HEART, 'assets/heart.png');
    this.load.image(ASSETS.IMAGES.HEART_EMPTY, 'assets/heart-empty.png');
    this.load.image(ASSETS.IMAGES.TOMB, 'assets/tomb.png');
  }

  /**
   * Loads all player-related assets
   */
  private loadPlayerAssets() {
    // Player idle animations
    this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_IDLE_DOWN, 'assets/spritesheets/hero/idle/hero-idle-front.png');
    this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_IDLE_UP, 'assets/spritesheets/hero/idle/hero-idle-back.png');
    this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_IDLE_SIDE, 'assets/spritesheets/hero/idle/hero-idle-side.png');
    
    // Player walk animations
    this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_WALK_DOWN, 'assets/spritesheets/hero/walk/hero-walk-front.png');
    this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_WALK_UP, 'assets/spritesheets/hero/walk/hero-walk-back.png');
    this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_WALK_SIDE, 'assets/spritesheets/hero/walk/hero-walk-side.png');
    
    // Player attack animations
    this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_ATTACK_DOWN, 'assets/spritesheets/hero/attack/hero-attack-front.png');
    this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_ATTACK_UP, 'assets/spritesheets/hero/attack/hero-attack-back.png');
    this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_ATTACK_SIDE, 'assets/spritesheets/hero/attack/hero-attack-side.png');
    
    // Player weapon attack animations
    this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_ATTACK_WEAPON_DOWN, 'assets/spritesheets/hero/attack-weapon/hero-attack-front-weapon.png');
    this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_ATTACK_WEAPON_UP, 'assets/spritesheets/hero/attack-weapon/hero-attack-back-weapon.png');
    this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_ATTACK_WEAPON_SIDE, 'assets/spritesheets/hero/attack-weapon/hero-attack-side-weapon.png');
    
    // Legacy player sprite
    this.load.spritesheet(ASSETS.IMAGES.PLAYER, 'assets/player.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  /**
   * Helper method to load player spritesheets with consistent frame size
   */
  private loadPlayerSpritesheet(key: string, path: string) {
    this.load.spritesheet(key, path, {
      frameWidth: ENTITY_DIMENSIONS[ENTITIES.PLAYER].width,
      frameHeight: ENTITY_DIMENSIONS[ENTITIES.PLAYER].height,
    });
  }

  /**
   * Loads all enemy-related assets
   */
  private loadEnemyAssets() {
    // Treant assets
    this.load.spritesheet(ASSETS.IMAGES.TREANT_IDLE_DOWN, 'assets/spritesheets/treant/idle/treant-idle-front.png', 
      { frameWidth: ENTITY_DIMENSIONS[ENTITIES.TREANT].width, frameHeight: ENTITY_DIMENSIONS[ENTITIES.TREANT].height });
    this.load.spritesheet(ASSETS.IMAGES.TREANT_WALK_SIDE, 'assets/spritesheets/treant/walk/treant-walk-side.png', 
      { frameWidth: ENTITY_DIMENSIONS[ENTITIES.TREANT].width, frameHeight: ENTITY_DIMENSIONS[ENTITIES.TREANT].height });
    this.load.spritesheet(ASSETS.IMAGES.TREANT_WALK_UP, 'assets/spritesheets/treant/walk/treant-walk-back.png', 
      { frameWidth: ENTITY_DIMENSIONS[ENTITIES.TREANT].width, frameHeight: ENTITY_DIMENSIONS[ENTITIES.TREANT].height });
    this.load.spritesheet(ASSETS.IMAGES.TREANT_WALK_DOWN, 'assets/spritesheets/treant/walk/treant-walk-front.png', 
      { frameWidth: ENTITY_DIMENSIONS[ENTITIES.TREANT].width, frameHeight: ENTITY_DIMENSIONS[ENTITIES.TREANT].height });
    
    // Mole assets
    this.load.spritesheet(ASSETS.IMAGES.MOLE_IDLE_DOWN, 'assets/spritesheets/mole/idle/mole-idle-front.png', 
      { frameWidth: ENTITY_DIMENSIONS[ENTITIES.MOLE].width, frameHeight: ENTITY_DIMENSIONS[ENTITIES.MOLE].height });
    this.load.spritesheet(ASSETS.IMAGES.MOLE_WALK_SIDE, 'assets/spritesheets/mole/walk/mole-walk-side.png', 
      { frameWidth: ENTITY_DIMENSIONS[ENTITIES.MOLE].width, frameHeight: ENTITY_DIMENSIONS[ENTITIES.MOLE].height });
    this.load.spritesheet(ASSETS.IMAGES.MOLE_WALK_UP, 'assets/spritesheets/mole/walk/mole-walk-back.png', 
      { frameWidth: ENTITY_DIMENSIONS[ENTITIES.MOLE].width, frameHeight: ENTITY_DIMENSIONS[ENTITIES.MOLE].height });
    this.load.spritesheet(ASSETS.IMAGES.MOLE_WALK_DOWN, 'assets/spritesheets/mole/walk/mole-walk-front.png', 
      { frameWidth: ENTITY_DIMENSIONS[ENTITIES.MOLE].width, frameHeight: ENTITY_DIMENSIONS[ENTITIES.MOLE].height });
    
    // Monster death animation
    this.load.spritesheet(ASSETS.IMAGES.MONSTER_DEATH, 'assets/spritesheets/misc/enemy-death.png', 
      { frameWidth: 30, frameHeight: 32 });
  }

  /**
   * Loads all Goku NPC-related assets
   */
  private loadGokuNpcAssets() {
    // Goku animations
    this.load.spritesheet(ASSETS.IMAGES.GOKU_IDLE, 'assets/humanoid-spritesheets/characters/goku/standard/idle.png', {
      frameWidth: ENTITY_DIMENSIONS[ENTITIES.GOKU].width,
      frameHeight: ENTITY_DIMENSIONS[ENTITIES.GOKU].height,
    });
    this.load.spritesheet(ASSETS.IMAGES.GOKU_WALK, 'assets/humanoid-spritesheets/characters/goku/standard/walk.png', {
      frameWidth: ENTITY_DIMENSIONS[ENTITIES.GOKU].width,
      frameHeight: ENTITY_DIMENSIONS[ENTITIES.GOKU].height,
    });
    this.load.spritesheet(ASSETS.IMAGES.GOKU_RUN, 'assets/humanoid-spritesheets/characters/goku/standard/run.png', {
      frameWidth: ENTITY_DIMENSIONS[ENTITIES.GOKU].width,
      frameHeight: ENTITY_DIMENSIONS[ENTITIES.GOKU].height,
    });
    this.load.spritesheet(ASSETS.IMAGES.GOKU_SIT, 'assets/humanoid-spritesheets/characters/goku/standard/sit.png', {
      frameWidth: ENTITY_DIMENSIONS[ENTITIES.GOKU].width,
      frameHeight: ENTITY_DIMENSIONS[ENTITIES.GOKU].height,
    });
    this.load.spritesheet(ASSETS.IMAGES.GOKU_SLASH, 'assets/humanoid-spritesheets/characters/goku/standard/slash.png', {
      frameWidth: ENTITY_DIMENSIONS[ENTITIES.GOKU].width,
      frameHeight: ENTITY_DIMENSIONS[ENTITIES.GOKU].height,
    });
    this.load.spritesheet(ASSETS.IMAGES.GOKU_COMBAT_IDLE, 'assets/humanoid-spritesheets/characters/goku/standard/combat_idle.png', {
      frameWidth: ENTITY_DIMENSIONS[ENTITIES.GOKU].width,
      frameHeight: ENTITY_DIMENSIONS[ENTITIES.GOKU].height,
    });
    this.load.spritesheet(ASSETS.IMAGES.GOKU_SHOOT, 'assets/humanoid-spritesheets/characters/goku/standard/shoot.png', {
      frameWidth: ENTITY_DIMENSIONS[ENTITIES.GOKU].width,
      frameHeight: ENTITY_DIMENSIONS[ENTITIES.GOKU].height,
    });
  }

  /**
   * Loads miscellaneous assets
   */
  private loadMiscAssets() {
    this.load.spritesheet(ASSETS.IMAGES.NPCS, 'assets/npc.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  /**
   * Creates all animations for the game
   */
  private createAnimations() {
    this.createPlayerAnimations();
    this.createEnemyAnimations();
    this.createGokuNpcAnimations();
    this.createMiscAnimations();
  }

  /**
   * Creates all player-related animations
   */
  private createPlayerAnimations() {
    // Player movement animations
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_MOVE_LEFT, ASSETS.IMAGES.PLAYER_WALK_SIDE, 0, 2, 10);
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_MOVE_RIGHT, ASSETS.IMAGES.PLAYER_WALK_SIDE, 0, 2, 10);
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_MOVE_UP, ASSETS.IMAGES.PLAYER_WALK_UP, 0, 2, 10);
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_MOVE_DOWN, ASSETS.IMAGES.PLAYER_WALK_DOWN, 0, 2, 10);
    
    // Player idle animations
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_IDLE_UP, ASSETS.IMAGES.PLAYER_IDLE_UP, 0, 0, 10);
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_IDLE_DOWN, ASSETS.IMAGES.PLAYER_IDLE_DOWN, 0, 0, 10);
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE, ASSETS.IMAGES.PLAYER_IDLE_SIDE, 0, 0, 10);
    
    // Player attack animations
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_ATTACK_DOWN, ASSETS.IMAGES.PLAYER_ATTACK_DOWN, 0, 2, 10);
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_ATTACK_UP, ASSETS.IMAGES.PLAYER_ATTACK_UP, 0, 2, 10);
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_ATTACK_SIDE, ASSETS.IMAGES.PLAYER_ATTACK_SIDE, 0, 2, 10);
    
    // Player weapon attack animations
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_DOWN, ASSETS.IMAGES.PLAYER_ATTACK_WEAPON_DOWN, 0, 2, 7);
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_UP, ASSETS.IMAGES.PLAYER_ATTACK_WEAPON_UP, 0, 2, 7);
    this.createAnimation(ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_SIDE, ASSETS.IMAGES.PLAYER_ATTACK_WEAPON_SIDE, 0, 2, 7);
  }

  /**
   * Creates all enemy-related animations
   */
  private createEnemyAnimations() {
    // Treant animations
    this.createAnimation(ASSETS.ANIMATIONS.TREANT_IDLE_DOWN, ASSETS.IMAGES.TREANT_IDLE_DOWN, 0, 0, 10);
    this.createAnimation(ASSETS.ANIMATIONS.TREANT_WALK_SIDE, ASSETS.IMAGES.TREANT_WALK_SIDE, 0, 3, 7);
    this.createAnimation(ASSETS.ANIMATIONS.TREANT_WALK_DOWN, ASSETS.IMAGES.TREANT_WALK_DOWN, 0, 3, 7);
    this.createAnimation(ASSETS.ANIMATIONS.TREANT_WALK_UP, ASSETS.IMAGES.TREANT_WALK_UP, 0, 3, 7);
    
    // Mole animations
    this.createAnimation(ASSETS.ANIMATIONS.MOLE_IDLE_DOWN, ASSETS.IMAGES.MOLE_IDLE_DOWN, 0, 0, 10);
    this.createAnimation(ASSETS.ANIMATIONS.MOLE_WALK_SIDE, ASSETS.IMAGES.MOLE_WALK_SIDE, 0, 3, 7);
    this.createAnimation(ASSETS.ANIMATIONS.MOLE_WALK_DOWN, ASSETS.IMAGES.MOLE_WALK_DOWN, 0, 3, 7);
    this.createAnimation(ASSETS.ANIMATIONS.MOLE_WALK_UP, ASSETS.IMAGES.MOLE_WALK_UP, 0, 3, 7);
  }

  /**
   * Creates all Goku NPC-related animations
   */
  private createGokuNpcAnimations() {
    // Goku idle animations - create specific ones for each direction to prevent alternating
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_IDLE, ASSETS.IMAGES.GOKU_IDLE, 0, 3, 5);
    // Create direction-specific idle animations
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_IDLE_UP, ASSETS.IMAGES.GOKU_IDLE, 0, 1, 5);
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_IDLE_LEFT, ASSETS.IMAGES.GOKU_IDLE, 2, 3, 5);
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_IDLE_DOWN, ASSETS.IMAGES.GOKU_IDLE, 4, 5, 5);
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_IDLE_RIGHT, ASSETS.IMAGES.GOKU_IDLE, 6, 7, 5);
    
    // Goku walk animations - Frame order: UP, LEFT, DOWN, RIGHT
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_WALK_UP, ASSETS.IMAGES.GOKU_WALK, 0, 8, 10);   // UP
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_WALK_LEFT, ASSETS.IMAGES.GOKU_WALK, 9, 17, 10); // LEFT
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_WALK_DOWN, ASSETS.IMAGES.GOKU_WALK, 18, 26, 10);   // DOWN
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_WALK_RIGHT, ASSETS.IMAGES.GOKU_WALK, 27, 35, 10); // RIGHT
    
    // Goku run animations
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_RUN_RIGHT, ASSETS.IMAGES.GOKU_RUN, 0, 7, 12);
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_RUN_LEFT, ASSETS.IMAGES.GOKU_RUN, 8, 15, 12);
    
    // Goku sit animation
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_SIT, ASSETS.IMAGES.GOKU_SIT, 0, 3, 5);
    
    // Goku slash animation
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_SLASH, ASSETS.IMAGES.GOKU_SLASH, 0, 5, 10, true);
    
    // Goku combat idle animation
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_COMBAT_IDLE, ASSETS.IMAGES.GOKU_COMBAT_IDLE, 0, 5, 7);
    
    // Goku shoot animations - Frame order: UP, LEFT, DOWN, RIGHT
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_SHOOT_UP, ASSETS.IMAGES.GOKU_SHOOT, 0, 12, 15, true);   // UP
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_SHOOT_LEFT, ASSETS.IMAGES.GOKU_SHOOT, 13, 25, 15, true); // LEFT
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_SHOOT_DOWN, ASSETS.IMAGES.GOKU_SHOOT, 26, 38, 15, true);   // DOWN
    this.createAnimation(ASSETS.ANIMATIONS.GOKU_SHOOT_RIGHT, ASSETS.IMAGES.GOKU_SHOOT, 39, 51, 15, true); // RIGHT
  }

  /**
   * Creates miscellaneous animations
   */
  private createMiscAnimations() {
    // Create monster death animation with special handling for hideOnComplete
    this.anims.create({
      key: ASSETS.ANIMATIONS.MONSTER_DEATH,
      frames: this.anims.generateFrameNumbers(ASSETS.IMAGES.MONSTER_DEATH, { start: 0, end: 5 }),
      frameRate: 15,
      repeat: 0, // Don't repeat the animation
      hideOnComplete: true // Hide the sprite when animation completes
    });
  }

  /**
   * Helper method to create animations with consistent parameters
   */
  private createAnimation(
    key: string, 
    spriteKey: string, 
    startFrame: number, 
    endFrame: number, 
    frameRate: number, 
    hideOnComplete: boolean = false
  ) {
    this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers(spriteKey, { start: startFrame, end: endFrame }),
      frameRate,
      repeat: -1,
      hideOnComplete
    });
  }
}
