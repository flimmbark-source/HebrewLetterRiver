import { greetings_01Blueprint } from './blueprints/greetings_01.js';
import { food_01Blueprint } from './blueprints/food_01.js';
import { colors_01Blueprint } from './blueprints/colors_01.js';
import { numbers_01Blueprint } from './blueprints/numbers_01.js';
import { shopping_01Blueprint } from './blueprints/shopping_01.js';
import { everyday_objects_01Blueprint } from './blueprints/everyday_objects_01.js';

const BLUEPRINTS = {
  [greetings_01Blueprint.packId]: greetings_01Blueprint,
  [food_01Blueprint.packId]: food_01Blueprint,
  [colors_01Blueprint.packId]: colors_01Blueprint,
  [numbers_01Blueprint.packId]: numbers_01Blueprint,
  [shopping_01Blueprint.packId]: shopping_01Blueprint,
  [everyday_objects_01Blueprint.packId]: everyday_objects_01Blueprint,
};

export function getBlueprintForPack(packId) {
  return BLUEPRINTS[packId] || null;
}

export function listBlueprintPackIds() {
  return Object.keys(BLUEPRINTS);
}
