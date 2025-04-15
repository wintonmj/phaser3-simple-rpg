import { NonPlayerEntity } from '../entities/NonPlayerEntity';
import { ASSETS } from '../../constants/assets';
import { ENTITIES, EntityType } from '../../constants/entities';
import { ChaseMovement } from '../../behaviors/movement/ChaseMovement';
import { MeleeCombat } from '../../behaviors/combat/MeleeCombat';
import { NoInteraction } from '../../behaviors/interaction/NoInteraction';
import { MonsterAnimation } from '../../behaviors/animation/MonsterAnimation';
import { CharacterAnimation } from '../Character';

export class Mole extends NonPlayerEntity {
  public readonly entityType: EntityType = ENTITIES.HOSTILE.MOLE;
  
  // Keep animations as static so they can be referenced easily
  private static readonly WALK_ANIMATION: CharacterAnimation = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.MOLE_WALK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_SIDE },
  };
  
  private static readonly IDLE_ANIMATION: CharacterAnimation = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
    left: { flip: true, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
    right: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
  };

  constructor(scene, x = 400, y = 400) {
    // Create behavior components
    const movementBehavior = new ChaseMovement(100);
    const combatBehavior = new MeleeCombat();
    const interactionBehavior = new NoInteraction();
    const animationBehavior = new MonsterAnimation(
      Mole.WALK_ANIMATION, 
      Mole.IDLE_ANIMATION
    );
    
    // Call parent constructor with behaviors
    super(scene, x, y, ASSETS.IMAGES.MOLE_IDLE_DOWN, ENTITIES.HOSTILE.MOLE, {
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

  protected animateAttack() {
    return undefined;
  }
}
