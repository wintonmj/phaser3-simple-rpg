/**
 * @fileoverview Example demonstrating how to use the AnimatedNpc class.
 */

import { AbstractScene } from '../../scenes/AbstractScene';
import { AnimatedNpc } from '../AnimatedNpc';

/**
 * Example class showing how to create and use animated NPCs in a scene.
 */
export class AnimatedNpcExample {
  /**
   * Creates animated NPCs and adds them to the given scene.
   * 
   * @param {AbstractScene} scene - The scene to add NPCs to
   */
  public static createExampleNpcs(scene: AbstractScene): void {
    // Create a basic idle NPC
    const idleNpc = new AnimatedNpc(
      scene,
      200,
      100,
      "Hello! I'm an idle NPC."
    );
    
    // Create a wandering NPC
    const wanderingNpc = new AnimatedNpc(
      scene, 
      250, 
      150, 
      "I like to wander around!",
      true // Enable wandering
    );
    
    // Create a combat-ready NPC
    const combatNpc = new AnimatedNpc(
      scene,
      300,
      200,
      "I'm ready for battle!",
      false, // Don't wander
      true   // Combat mode enabled
    );
    
    // Create an NPC that demonstrates slash attack on interaction
    const slashingNpc = new AnimatedNpc(
      scene,
      350,
      250,
      "Watch my sword skills!"
    );
    
    // Add collision with the player
    scene.physics.add.collider(scene.player, [idleNpc, wanderingNpc, combatNpc, slashingNpc]);
    
    // Create space key for interaction
    const spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    let interactionTime = 0;
    
    // Set up interaction with the NPCs
    scene.physics.add.overlap(
      scene.player,
      [idleNpc, wanderingNpc, combatNpc, slashingNpc],
      (_unused, npc: AnimatedNpc) => {
        // Only trigger if player presses the space key (with cooldown)
        const currentTime = scene.time.now;
        if (spaceKey.isDown && currentTime - interactionTime > 500) {
          interactionTime = currentTime;
          npc.talk();
          
          // Special actions for different NPCs
          if (npc === combatNpc) {
            npc.toggleCombatMode();
          } else if (npc === slashingNpc) {
            npc.slash();
          }
        }
      }
    );
    
    // Make sure to call update on each NPC during the scene update
    scene.events.on('update', () => {
      idleNpc.update();
      wanderingNpc.update();
      combatNpc.update();
      slashingNpc.update();
    });
  }
} 