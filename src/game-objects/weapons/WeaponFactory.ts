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
   * @param type Type of weapon to create
   * @returns A new weapon instance
   */
  public static createWeapon(type: WeaponType): Weapon {
    switch (type) {
      case WeaponType.MELEE:
        return new Fists();
      case WeaponType.RANGED:
        return new Bow();
      default:
        // Default to fists if type is not recognized
        return new Fists();
    }
  }

  /**
   * Create and equip a weapon onto a character
   * @param character Character to equip the weapon on
   * @param type Type of weapon to create and equip
   * @returns The equipped weapon
   */
  public static equipCharacterWithWeapon(character: Character, type: WeaponType): Weapon {
    const weapon = this.createWeapon(type);
    character.equipWeapon(weapon);
    return weapon;
  }
} 