import { NonPlayerEntity } from '../entities/NonPlayerEntity';
import { ASSETS } from '../../constants/assets';
import { ENTITIES, EntityType } from '../../constants/entities';

export class Mole extends NonPlayerEntity {
  public readonly entityType: EntityType = ENTITIES.HOSTILE.MOLE;
  
  protected WALK_ANIMATION = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.MOLE_WALK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_SIDE },
  };
  protected MONSTER_IDLE_DOWN = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
    left: { flip: true, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
    right: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
  };

  protected MONSTER_SPEED = 20;

  constructor(scene, x = 400, y = 400) {
    super(scene, x, y, ASSETS.IMAGES.MOLE_IDLE_DOWN);

    this.hp = 3;
    this.setDepth(5);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
  }

  protected animateAttack() {
    return undefined;
  }
}
