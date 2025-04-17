import { NonPlayerEntity } from '../entities/NonPlayerEntity';
import { ASSETS } from '../../constants/assets';
import { Log } from '../projectiles/Log';
import { ENTITIES, EntityType } from '../../constants/entities';
import { ChaseMovement } from '../../behaviors/movement/ChaseMovement';
import { RangedCombat } from '../../behaviors/combat/RangedCombat';
import { NoInteraction } from '../../behaviors/interaction/NoInteraction';
import { BaseEntityAnimation } from '../../behaviors/animation/BaseEntityAnimation';
import { AbstractScene } from '../../scenes/AbstractScene';

export class Treant extends NonPlayerEntity {
  public readonly entityType: EntityType = ENTITIES.TREANT;
  
  constructor(scene: AbstractScene, x = 400, y = 400) {
    // Create behavior components that don't reference 'this'
    const movementBehavior = new ChaseMovement(100);
    const interactionBehavior = new NoInteraction();
    // Use the static factory method to get animations for this entity type
    const animationBehavior = BaseEntityAnimation.forEntityType(ENTITIES.TREANT);
    
    // Create the combat behavior with a projectile factory that doesn't use 'this'
    const combatBehavior = new RangedCombat((scene, x, y) => {
      return new Log(scene, x, y);
    });
    
    // Call parent constructor with behaviors
    super(scene, x, y, ASSETS.IMAGES.TREANT_IDLE_DOWN, ENTITIES.TREANT, {
      movement: movementBehavior,
      combat: combatBehavior,
      interaction: interactionBehavior,
      animation: animationBehavior,
      hp: 5
    });
    
    // Set this instance as the source entity for the combat behavior
    combatBehavior.setSourceEntity(this);
    
    this.setDepth(5);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
  }

  protected animateAttack() {
    return undefined;
  }
}
