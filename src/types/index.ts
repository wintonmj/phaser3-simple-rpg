/**
 * @fileoverview Type definitions for the Phaser3 Simple RPG game
 * 
 * This directory contains project-specific TypeScript type definitions.
 * These types are used throughout the game codebase to provide type safety
 * and better IDE support.
 * 
 * File structure:
 * - scene-types.d.ts: Types related to game scenes, maps, and input
 * - phaser-custom.d.ts: Custom extensions to the Phaser type system
 * - phaser-extensions.d.ts: Additional Phaser type extensions
 * 
 * Note: Global type definitions and third-party library type augmentations
 * are stored in the root /typings directory and referenced in tsconfig.json.
 */

// Re-export all types for easier imports
export * from './scene-types'; 