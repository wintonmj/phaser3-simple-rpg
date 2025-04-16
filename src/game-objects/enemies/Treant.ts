import { NonPlayerEntity } from '../entities/NonPlayerEntity';
import { ASSETS } from '../../constants/assets';
import { Log } from '../projectiles/Log';
import { ENTITIES, EntityType } from '../../constants/entities';
import { ChaseMovement } from '../../behaviors/movement/ChaseMovement';
import { RangedCombat } from '../../behaviors/combat/RangedCombat';
import { NoInteraction } from '../../behaviors/interaction/NoInteraction';
import { BaseEntityAnimation } from '../../behaviors/animation/BaseEntityAnimation';
import { AbstractScene } from '../../scenes/AbstractScene';
import { TREANT_ANIMATIONS } from '../../constants/animation-configs';

export class Treant extends NonPlayerEntity {
  public readonly entityType: EntityType = ENTITIES.TREANT;
  
  constructor(scene: AbstractScene, x = 400, y = 400) {
    // Create behavior components that don't reference 'this'
    const movementBehavior = new ChaseMovement(100);
    const interactionBehavior = new NoInteraction();
    const animationBehavior = new BaseEntityAnimation(
      TREANT_ANIMATIONS.WALK, 
      TREANT_ANIMATIONS.IDLE
    );
    
    // Call parent constructor with behaviors
    super(scene, x, y, ASSETS.IMAGES.TREANT_IDLE_DOWN, ENTITIES.TREANT, {
      movement: movementBehavior,
      combat: null, // Set later after 'this' is available
      interaction: interactionBehavior,
      animation: animationBehavior,
      hp: 5
    });

    // Now we can use 'this' to create the combat behavior
    const combatBehavior = new RangedCombat(() => {
      return new Log(scene, this.x, this.y);
    });
    
    // Update the combat behavior
    this.setCombatBehavior(combatBehavior);
    
    this.setDepth(5);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
  }

  protected animateAttack() {
    return undefined;
  }
}
