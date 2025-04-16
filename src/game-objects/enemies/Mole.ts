import { NonPlayerEntity } from '../entities/NonPlayerEntity';
import { ASSETS } from '../../constants/assets';
import { ENTITIES, EntityType } from '../../constants/entities';
import { ChaseMovement } from '../../behaviors/movement/ChaseMovement';
import { AbstractCombatBehavior } from '../../behaviors/combat/AbstractCombatBehavior';
import { NoInteraction } from '../../behaviors/interaction/NoInteraction';
import { BaseEntityAnimation } from '../../behaviors/animation/BaseEntityAnimation';
import { Character } from '../Character';
import { MOLE_ANIMATIONS } from '../../constants/animation-configs';

export class Mole extends NonPlayerEntity {
  public readonly entityType: EntityType = ENTITIES.MOLE;
  
  constructor(scene, x = 400, y = 400) {
    // Create behavior components
    const movementBehavior = new ChaseMovement(100);
    const combatBehavior = Mole.createCombatBehavior();
    const interactionBehavior = new NoInteraction();
    const animationBehavior = new BaseEntityAnimation(
      MOLE_ANIMATIONS.WALK, 
      MOLE_ANIMATIONS.IDLE
    );
    
    // Call parent constructor with behaviors
    super(scene, x, y, ASSETS.IMAGES.MOLE_IDLE_DOWN, ENTITIES.MOLE, {
      movement: movementBehavior,
      combat: combatBehavior,
      interaction: interactionBehavior,
      animation: animationBehavior,
      hp: 3
    });

    this.setDepth(5);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
  }

  /**
   * Creates a melee combat behavior instance
   * This replaces the direct import of MeleeCombat
   */
  private static createCombatBehavior(): AbstractCombatBehavior {
    // Create a basic melee combat behavior that matches MeleeCombat functionality
    return new class extends AbstractCombatBehavior {
      constructor() {
        super(1000); // Default hit delay
      }
      
      protected doAttack(entity: NonPlayerEntity, target: Character): void {
        // Basic implementation of melee attack
        const damage = entity.attackDamage || 1;
        
        if ('canGetHit' in target && typeof target.canGetHit === 'function') {
          if (!target.canGetHit()) return;
          
          if ('loseHp' in target && typeof target.loseHp === 'function') {
            target.loseHp(damage);
          }
        }
        
        this.animateAttack(entity);
      }
    }();
  }

  protected animateAttack() {
    return undefined;
  }
}
