export const WORD_RIVER_SETS = [
  {
    id: 'set-basic-1',
    words: [
      { id: 'house', practice: 'בית', app: 'house', emoji: '🏠' },
      { id: 'dog', practice: 'כלב', app: 'dog', emoji: '🐕' },
      { id: 'milk', practice: 'חלב', app: 'milk', emoji: '🥛' }
    ]
  },
  {
    id: 'set-basic-2',
    words: [
      { id: 'sun', practice: 'שמש', app: 'sun', emoji: '☀️' },
      { id: 'water', practice: 'מים', app: 'water', emoji: '💧' },
      { id: 'book', practice: 'ספר', app: 'book', emoji: '📚' }
    ]
  },
  {
    id: 'set-basic-3',
    words: [
      { id: 'bread', practice: 'לחם', app: 'bread', emoji: '🍞' },
      { id: 'tree', practice: 'עץ', app: 'tree', emoji: '🌳' },
      { id: 'fire', practice: 'אש', app: 'fire', emoji: '🔥' }
    ]
  }
];

export function getWordRiverSet(index = 0) {
  if (!WORD_RIVER_SETS.length) {
    return { id: 'empty', words: [] };
  }
  const normalizedIndex = ((index % WORD_RIVER_SETS.length) + WORD_RIVER_SETS.length) % WORD_RIVER_SETS.length;
  return WORD_RIVER_SETS[normalizedIndex];
}
