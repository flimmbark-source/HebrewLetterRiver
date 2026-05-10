import { food_01Blueprint } from './blueprints/food_01.js';

const BLUEPRINTS = {
  [food_01Blueprint.packId]: food_01Blueprint,
};

export function getBlueprintForPack(packId) {
  return BLUEPRINTS[packId] || null;
}

export function listBlueprintPackIds() {
  return Object.keys(BLUEPRINTS);
}
