export const WORD_RIVER_SCENES = [
  {
    id: 'kitchen',
    label: 'Kitchen Scene',
    backgroundId: 'kitchen',
    objects: [
      {
        id: 'cup',
        svgId: 'cup',
        l2Word: 'כוס',
        l2Phonetics: ['k', 'o', 's'],
        l1Gloss: 'cup',
        audioKey: 'word:cup',
        position: { x: 22, y: 48 }
      },
      {
        id: 'milk',
        svgId: 'milk',
        l2Word: 'חלב',
        l2Phonetics: ['kha', 'la', 'v'],
        l1Gloss: 'milk',
        audioKey: 'word:milk',
        position: { x: 58, y: 40 }
      },
      {
        id: 'bread',
        svgId: 'bread',
        l2Word: 'לחם',
        l2Phonetics: ['le', 'khem', 'm'],
        l1Gloss: 'bread',
        audioKey: 'word:bread',
        position: { x: 75, y: 62 }
      }
    ]
  }
];

export function getDefaultWordRiverScene() {
  return WORD_RIVER_SCENES[0];
}
