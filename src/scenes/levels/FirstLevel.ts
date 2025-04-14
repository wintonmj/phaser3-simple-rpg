/**
 * @fileoverview First level scene of the game.
 * Extends the AbstractScene class to provide the first level of gameplay.
 */

import { AbstractScene } from '../AbstractScene';
import { SCENES } from '../../constants/scenes';
import { MAPS } from '../../constants/maps';

/**
 * First level scene of the game.
 * Extends the AbstractScene class to provide the first level of gameplay.
 * 
 * @class FirstLevel
 * @extends {AbstractScene}
 */
export class FirstLevel extends AbstractScene {
  /**
   * Creates an instance of FirstLevel.
   * Initializes the scene with the appropriate map and scene key.
   */
  constructor() {
    super(SCENES.FIRST_LEVEL, MAPS.firstLevel.key);
  }
}
