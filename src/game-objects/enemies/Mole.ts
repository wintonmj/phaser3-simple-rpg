import { NonPlayerEntity } from '../entities/NonPlayerEntity';
import { ASSETS } from '../../constants/assets';
import { ENTITIES, EntityType } from '../../constants/entities';
import { ChaseMovement } from '../../behaviors/movement/ChaseMovement';
import { NoInteraction } from '../../behaviors/interaction/NoInteraction';
import { BaseEntityAnimation } from '../../behaviors/animation/BaseEntityAnimation';
import { MeleeCombat } from '../../behaviors/combat/MeleeCombat';

export class Mole extends NonPlayerEntity {
  public readonly entityType: EntityType = ENTITIES.MOLE;
  
  constructor(scene, x = 400, y = 400) {
    // Create behavior components
    const movementBehavior = new ChaseMovement(100);
    const interactionBehavior = new NoInteraction();
    // Use the static factory method to get animations for this entity type
    const animationBehavior = BaseEntityAnimation.forEntityType(ENTITIES.MOLE);
    
    // Call parent constructor with behaviors
    super(scene, x, y, ASSETS.IMAGES.MOLE_IDLE_DOWN, ENTITIES.MOLE, {
      movement: movementBehavior,
      combat: null,
      interaction: interactionBehavior,
      animation: animationBehavior,
      hp: 3
    });

        // Now we can use 'this' to create the combat behavior
    const combatBehavior = new MeleeCombat();
        
        // Update the combat behavior
    this.setCombatBehavior(combatBehavior);
    this.setDepth(5);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
  }
}
