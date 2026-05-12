import { food_01Blueprint } from './blueprints/food_01.js';
import { colors_01Blueprint } from './blueprints/colors_01.js';
import { numbers_01Blueprint } from './blueprints/numbers_01.js';

const BLUEPRINTS = {
  [food_01Blueprint.packId]: food_01Blueprint,
  [colors_01Blueprint.packId]: colors_01Blueprint,
  [numbers_01Blueprint.packId]: numbers_01Blueprint,
};

export function getBlueprintForPack(packId) {
  return BLUEPRINTS[packId] || null;
}

export function listBlueprintPackIds() {
  return Object.keys(BLUEPRINTS);
}
