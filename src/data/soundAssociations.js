/**
 * Sound Association Mappings
 *
 * This module provides a centralized mapping of phonetic sounds to visual associations
 * (emojis or image descriptions). The mappings are language-agnostic and can be reused
 * across different alphabets that share similar phonetic sounds.
 *
 * Each sound maps to an object with:
 * - emoji: The visual representation
 * - word: The word that the emoji represents (for accessibility)
 * - alt: Alternative description for screen readers
 */

export const soundAssociations = {
  // Vowels and semi-vowels
  '(A)': { emoji: '🍎', word: 'Apple', alt: 'Red apple' },
  '(Ah)': { emoji: '🍎', word: 'Apple', alt: 'Red apple' },

  // Consonants - B
  'B': { emoji: '🐻', word: 'Bear', alt: 'Brown bear' },

  // Consonants - C/Ch sounds
  'C': { emoji: '🍒', word: 'Cherry', alt: 'Red cherries' },
  'Ch': { emoji: '🧀', word: 'Cheese', alt: 'Cheese wedge' },

  // Consonants - D
  'D': { emoji: '🦆', word: 'Duck', alt: 'Yellow duck' },

  // Consonants - F
  'F': { emoji: '🐟', word: 'Fish', alt: 'Orange fish' },

  // Consonants - G
  'G': { emoji: '🍇', word: 'Grapes', alt: 'Purple grapes' },

  // Consonants - H
  'H': { emoji: '🏠', word: 'House', alt: 'Small house' },

  // Consonants - J
  'J': { emoji: '🤹', word: 'Juggler', alt: 'Person juggling' },

  // Consonants - K
  'K': { emoji: '🪁', word: 'Kite', alt: 'Colorful kite' },

  // Consonants - L
  'L': { emoji: '🦙', word: 'Llama', alt: 'Brown llama' },

  // Consonants - M
  'M': { emoji: '🐭', word: 'Mouse', alt: 'Gray mouse' },

  // Consonants - N
  'N': { emoji: '🪺', word: 'Nest', alt: 'Bird nest' },

  // Consonants - P
  'P': { emoji: '🍕', word: 'Pizza', alt: 'Pizza slice' },

  // Consonants - R
  'R': { emoji: '🚀', word: 'Rocket', alt: 'Red rocket' },

  // Consonants - S
  'S': { emoji: '🍜', word: 'Soup', alt: 'Bowl of soup' },

  // Consonants - Sh
  'Sh': { emoji: '👞', word: 'Shoe', alt: 'Brown shoe' },

  // Consonants - T
  'T': { emoji: '🐯', word: 'Tiger', alt: 'Orange tiger' },

  // Consonants - Tz
  'Tz': { emoji: '👲🏼', word: 'Pizza', alt: 'Pizza slice' },

  // Consonants - V
  'V': { emoji: '🎻', word: 'Violin', alt: 'Brown violin' },
  'V/o/u': { emoji: '🎻', word: 'Violin', alt: 'Brown violin' },

  // Consonants - W
  'W': { emoji: '🌊', word: 'Wave', alt: 'Ocean wave' },

  // Consonants - Y
  'Y': { emoji: '🪀', word: 'Yo-yo', alt: 'Red yo-yo' },

  // Consonants - Z
  'Z': { emoji: '🦓', word: 'Zebra', alt: 'Striped zebra' },

  // Vowel combinations (for niqqud mode)
  'Ba': { emoji: '🍌', word: 'Banana', alt: 'Yellow banana' },
  'Be': { emoji: '🐝', word: 'Bee', alt: 'Yellow bee' },
  'Bi': { emoji: '🐦', word: 'Bird', alt: 'Blue bird' },
  'Bo': { emoji: '🚤', word: 'Boat', alt: 'Small boat' },
  'Bu': { emoji: '🪲', word: 'Bug', alt: 'Green bug' },

  'Da': { emoji: '💃', word: 'Dancer', alt: 'Person dancing' },
  'De': { emoji: '🦌', word: 'Deer', alt: 'Brown deer' },
  'Di': { emoji: '🍽️', word: 'Dish', alt: 'Plate and utensils' },
  'Do': { emoji: '🚪', word: 'Door', alt: 'Brown door' },
  'Du': { emoji: '🦆', word: 'Duck', alt: 'Yellow duck' },

  'Ga': { emoji: '⛽', word: 'Gas', alt: 'Gas pump' },
  'Ge': { emoji: '💎', word: 'Gem', alt: 'Blue gem' },
  'Gi': { emoji: '🎁', word: 'Gift', alt: 'Wrapped gift' },
  'Go': { emoji: '🐐', word: 'Goat', alt: 'White goat' },
  'Gu': { emoji: '🎸', word: 'Guitar', alt: 'Brown guitar' },

  'Ha': { emoji: '🎩', word: 'Hat', alt: 'Black top hat' },
  'He': { emoji: '🦔', word: 'Hedgehog', alt: 'Brown hedgehog' },
  'Hi': { emoji: '⛰️', word: 'Hill', alt: 'Mountain hill' },
  'Ho': { emoji: '🏠', word: 'Home', alt: 'Small house' },
  'Hu': { emoji: '🤗', word: 'Hug', alt: 'Hugging face' },

  'Ka': { emoji: '🚗', word: 'Car', alt: 'Red car' },
  'Ke': { emoji: '🔑', word: 'Key', alt: 'Gold key' },
  'Ki': { emoji: '👑', word: 'King', alt: 'Gold crown' },
  'Ko': { emoji: '🐨', word: 'Koala', alt: 'Gray koala' },
  'Ku': { emoji: '🧁', word: 'Cupcake', alt: 'Pink cupcake' },

  'La': { emoji: '🪜', word: 'Ladder', alt: 'Wooden ladder' },
  'Le': { emoji: '🍋', word: 'Lemon', alt: 'Yellow lemon' },
  'Li': { emoji: '🦁', word: 'Lion', alt: 'Yellow lion' },
  'Lo': { emoji: '🔒', word: 'Lock', alt: 'Closed lock' },
  'Lu': { emoji: '🌙', word: 'Luna', alt: 'Crescent moon' },

  'Ma': { emoji: '🗺️', word: 'Map', alt: 'World map' },
  'Me': { emoji: '🍖', word: 'Meat', alt: 'Meat on bone' },
  'Mi': { emoji: '🥛', word: 'Milk', alt: 'Glass of milk' },
  'Mo': { emoji: '🌙', word: 'Moon', alt: 'Crescent moon' },
  'Mu': { emoji: '🎵', word: 'Music', alt: 'Musical note' },

  'Na': { emoji: '👃', word: 'Nose', alt: 'Human nose' },
  'Ne': { emoji: '🪺', word: 'Nest', alt: 'Bird nest' },
  'Ni': { emoji: '🌃', word: 'Night', alt: 'Night cityscape' },
  'No': { emoji: '🔔', word: 'Note', alt: 'Bell' },
  'Nu': { emoji: '🥜', word: 'Nut', alt: 'Peanuts' },

  'Pa': { emoji: '🐼', word: 'Panda', alt: 'Black and white panda' },
  'Pe': { emoji: '🐧', word: 'Penguin', alt: 'Black penguin' },
  'Pi': { emoji: '🍕', word: 'Pizza', alt: 'Pizza slice' },
  'Po': { emoji: '🎯', word: 'Point', alt: 'Target bullseye' },
  'Pu': { emoji: '🐶', word: 'Puppy', alt: 'Cute dog' },

  'Ra': { emoji: '🐀', word: 'Rat', alt: 'Gray rat' },
  'Re': { emoji: '🔴', word: 'Red', alt: 'Red circle' },
  'Ri': { emoji: '🍚', word: 'Rice', alt: 'Bowl of rice' },
  'Ro': { emoji: '🚀', word: 'Rocket', alt: 'Red rocket' },
  'Ru': { emoji: '📏', word: 'Ruler', alt: 'Measuring ruler' },

  'Sa': { emoji: '🥗', word: 'Salad', alt: 'Green salad' },
  'Se': { emoji: '🌊', word: 'Sea', alt: 'Ocean wave' },
  'Si': { emoji: '🪑', word: 'Sit', alt: 'Chair' },
  'So': { emoji: '🍜', word: 'Soup', alt: 'Bowl of soup' },
  'Su': { emoji: '☀️', word: 'Sun', alt: 'Bright sun' },

  'Ta': { emoji: '🏷️', word: 'Tag', alt: 'Label tag' },
  'Te': { emoji: '☕', word: 'Tea', alt: 'Cup of tea' },
  'Ti': { emoji: '🐯', word: 'Tiger', alt: 'Orange tiger' },
  'To': { emoji: '🍅', word: 'Tomato', alt: 'Red tomato' },
  'Tu': { emoji: '🌷', word: 'Tulip', alt: 'Red flower' },

  'Va': { emoji: '🚐', word: 'Van', alt: 'Blue van' },
  'Ve': { emoji: '🏺', word: 'Vase', alt: 'Decorative vase' },
  'Vi': { emoji: '🎻', word: 'Violin', alt: 'Brown violin' },
  'Vo': { emoji: '🗳️', word: 'Vote', alt: 'Ballot box' },
  'Vu': { emoji: '🌋', word: 'Volcano', alt: 'Erupting volcano' },

  'Ya': { emoji: '🧶', word: 'Yarn', alt: 'Ball of yarn' },
  'Ye': { emoji: '💛', word: 'Yellow', alt: 'Yellow heart' },
  'Yi': { emoji: '🪀', word: 'Yo-yo', alt: 'Red yo-yo' },
  'Yo': { emoji: '🪀', word: 'Yo-yo', alt: 'Red yo-yo' },
  'Yu': { emoji: '🥣', word: 'Yum', alt: 'Bowl with spoon' },

  'Za': { emoji: '🦓', word: 'Zebra', alt: 'Striped zebra' },
  'Ze': { emoji: '0️⃣', word: 'Zero', alt: 'Number zero' },
  'Zi': { emoji: '🤐', word: 'Zip', alt: 'Zipper mouth' },
  'Zo': { emoji: '🦓', word: 'Zebra', alt: 'Striped zebra' },
  'Zu': { emoji: '🦓', word: 'Zebra', alt: 'Striped zebra' }
};

/**
 * Get the association for a given sound
 * @param {string} sound - The phonetic sound (e.g., "B", "Ch", "Ba")
 * @returns {object|null} The association object with emoji, word, and alt, or null if not found
 */
export function getAssociation(sound) {
  if (!sound) return null;

  // Direct match
  if (soundAssociations[sound]) {
    return soundAssociations[sound];
  }

  // Try without parentheses (e.g., "(A)" -> "A")
  const withoutParens = sound.replace(/[()]/g, '');
  if (soundAssociations[withoutParens]) {
    return soundAssociations[withoutParens];
  }

  // Try case variations
  const upperSound = sound.toUpperCase();
  if (soundAssociations[upperSound]) {
    return soundAssociations[upperSound];
  }

  const lowerSound = sound.toLowerCase();
  const capitalizedSound = lowerSound.charAt(0).toUpperCase() + lowerSound.slice(1);
  if (soundAssociations[capitalizedSound]) {
    return soundAssociations[capitalizedSound];
  }

  return null;
}

/**
 * Get all available sounds that have associations
 * @returns {string[]} Array of sound keys
 */
export function getAvailableSounds() {
  return Object.keys(soundAssociations);
}

/**
 * Check if a sound has an association
 * @param {string} sound - The phonetic sound to check
 * @returns {boolean} True if the sound has an association
 */
export function hasAssociation(sound) {
  return getAssociation(sound) !== null;
}

export default {
  soundAssociations,
  getAssociation,
  getAvailableSounds,
  hasAssociation
};
