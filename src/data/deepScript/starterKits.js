/**
 * Deep Script starter kits (classes).
 *
 * Each kit defines:
 * - identity (name, description, icon)
 * - starting stats (health, tray size, satchel size, energy)
 * - starting gear (ability IDs)
 * - passive bonuses
 */

export const starterKits = [
  {
    id: 'scribe',
    name: 'Scribe',
    icon: '✒️',
    description: 'Reliable letter generation. Straightforward and dependable.',
    flavor: 'The Scribe shapes letters with care and precision, calling forth exactly what is needed.',
    health: 5,
    traySize: 6,
    satchelSize: 3,
    maxEnergy: 3,
    gearIds: ['scribe-knife', 'echo-mirror'],
    passives: {
      generateBonus: 0.1,         // +10% target accuracy on random generation
      burnDrawChance: 0.4,        // 40% chance for bonus tile on burn
    },
  },
  {
    id: 'interpreter',
    name: 'Interpreter',
    icon: '🔮',
    description: 'Better clues and choice bundles. Forgiving of mistakes.',
    flavor: 'The Interpreter reads meaning between letters, divining patterns where others see chaos.',
    health: 6,
    traySize: 6,
    satchelSize: 3,
    maxEnergy: 3,
    gearIds: ['meaning-lantern', 'choice-sigil'],
    passives: {
      curseFuel: true,             // Lantern consumes cursed tiles for bonus generation
      bonusChoiceCount: 1,          // choice bundles offer 1 extra option
    },
  },
  {
    id: 'rootkeeper',
    name: 'Rootkeeper',
    icon: '🌿',
    description: 'Pattern-based transforms. Higher skill ceiling.',
    flavor: 'The Rootkeeper tends ancient roots, coaxing letters to shift form and reveal hidden connections.',
    health: 4,
    traySize: 7,
    satchelSize: 3,
    maxEnergy: 4,
    gearIds: ['root-lens', 'rune-tongs'],
    passives: {
      transformBonus: true,       // transforms have wider letter pool
      rootRevealChance: 0.3,      // 30% chance to auto-reveal a root letter at combat start
    },
  },
];

export function getStarterKit(id) {
  return starterKits.find(k => k.id === id) || null;
}
