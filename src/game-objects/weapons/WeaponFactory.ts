/**
 * @fileoverview Factory for creating weapons that can be equipped by characters
 */

import { Weapon } from './Weapon';
import { Fists } from './Fists';
import { Bow } from './Bow';
import { Character } from '../Character';
import { WeaponType } from '../../constants/weapon-types';

/**
 * Factory for creating and equipping weapons
 */
export class WeaponFactory {
  /**
   * Create a weapon by type
   * @param scene The scene the weapon belongs to
   * @param type Type of weapon to create
   * @param x Initial x position
   * @param y Initial y position
   * @returns A new weapon instance
   */
  public static createWeapon(scene: Phaser.Scene, type: WeaponType, x: number, y: number): Weapon {
    switch (type) {
      case WeaponType.MELEE:
        return new Fists(scene, x, y);
      case WeaponType.RANGED:
        return new Bow(scene, x, y);
      default:
        // Default to fists if type is not recognized
        return new Fists(scene, x, y);
    }
  }

  /**
   * Create and equip a weapon onto a character
   * @param character Character to equip the weapon on
   * @param type Type of weapon to create and equip
   * @returns The equipped weapon
   */
  public static equipCharacterWithWeapon(character: Character, type: WeaponType): Weapon {
    const scene = character.getScene();
    const weapon = this.createWeapon(scene, type, character.x, character.y);
    character.equipWeapon(weapon);
    return weapon;
  }
} 