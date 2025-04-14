/**
 * @fileoverview Second level scene of the game.
 * Extends the AbstractScene class to provide the second level of gameplay.
 */

import { AbstractScene } from '../AbstractScene';
import { SCENES } from '../../constants/scenes';
import { MAPS } from '../../constants/maps';

/**
 * Second level scene of the game.
 * Extends the AbstractScene class to provide the second level of gameplay.
 * 
 * @class SecondLevel
 * @extends {AbstractScene}
 */
export class SecondLevel extends AbstractScene {
  /**
   * Creates an instance of SecondLevel.
   * Initializes the scene with the appropriate map and scene key.
   */
  constructor() {
    super(SCENES.SECOND_LEVEL, MAPS.secondLevel.key);
  }
}
