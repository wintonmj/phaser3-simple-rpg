import { NonPlayerEntity } from '../entities/NonPlayerEntity';
import { ASSETS } from '../../constants/assets';
import { Log } from '../projectiles/Log';
import { ENTITIES, EntityType } from '../../constants/entities';
import { ChaseMovement } from '../../behaviors/movement/ChaseMovement';
import { RangedCombat } from '../../behaviors/combat/RangedCombat';
import { NoInteraction } from '../../behaviors/interaction/NoInteraction';
import { MonsterAnimation } from '../../behaviors/animation/MonsterAnimation';
import { CharacterAnimation } from '../Character';
import { AbstractScene } from '../../scenes/AbstractScene';

export class Treant extends NonPlayerEntity {
  public readonly entityType: EntityType = ENTITIES.HOSTILE.TREANT;
  
  // Keep animations as static so they can be referenced easily
  private static readonly WALK_ANIMATION: CharacterAnimation = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.TREANT_WALK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_SIDE },
  };
  
  private static readonly IDLE_ANIMATION: CharacterAnimation = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN },
    left: { flip: true, anim: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN },
    right: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN },
  };

  constructor(scene, x = 400, y = 400) {
    // Create a projectile generator function for ranged combat
    const createProjectile = (scene: AbstractScene, x: number, y: number) => {
      new Log(scene, x, y);
    };
    
    // Create behavior components
    const movementBehavior = new ChaseMovement(100);
    const combatBehavior = new RangedCombat(createProjectile);
    const interactionBehavior = new NoInteraction();
    const animationBehavior = new MonsterAnimation(
      Treant.WALK_ANIMATION, 
      Treant.IDLE_ANIMATION
    );
    
    // Call parent constructor with behaviors
    super(scene, x, y, ASSETS.IMAGES.TREANT_IDLE_DOWN, ENTITIES.HOSTILE.TREANT, {
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
}
