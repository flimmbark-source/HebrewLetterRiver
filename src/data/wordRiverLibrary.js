const sharedWordEntries = [
  { id: 'house', translationKey: 'wordRiver.words.house.translation', emoji: '🏠' },
  { id: 'dog', translationKey: 'wordRiver.words.dog.translation', emoji: '🐕' },
  { id: 'milk', translationKey: 'wordRiver.words.milk.translation', emoji: '🥛' },
  { id: 'sun', translationKey: 'wordRiver.words.sun.translation', emoji: '☀️' }
];

const languageWordMap = {
  hebrew: {
    house: 'בית',
    dog: 'כלב',
    milk: 'חלב',
    sun: 'שמש'
  },
  english: {
    house: 'house',
    dog: 'dog',
    milk: 'milk',
    sun: 'sun'
  },
  mandarin: {
    house: '家',
    dog: '狗',
    milk: '牛奶',
    sun: '太阳'
  },
  hindi: {
    house: 'घर',
    dog: 'कुत्ता',
    milk: 'दूध',
    sun: 'सूरज'
  },
  spanish: {
    house: 'casa',
    dog: 'perro',
    milk: 'leche',
    sun: 'sol'
  },
  french: {
    house: 'maison',
    dog: 'chien',
    milk: 'lait',
    sun: 'soleil'
  },
  arabic: {
    house: 'بيت',
    dog: 'كلب',
    milk: 'حليب',
    sun: 'شمس'
  },
  bengali: {
    house: 'বাড়ি',
    dog: 'কুকুর',
    milk: 'দুধ',
    sun: 'সূর্য'
  },
  portuguese: {
    house: 'casa',
    dog: 'cão',
    milk: 'leite',
    sun: 'sol'
  },
  russian: {
    house: 'дом',
    dog: 'собака',
    milk: 'молоко',
    sun: 'солнце'
  },
  japanese: {
    house: 'いえ',
    dog: 'いぬ',
    milk: 'ぎゅうにゅう',
    sun: 'たいよう'
  }
};

const DEFAULT_LANGUAGE_ID = 'english';

function shuffle(items) {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
}

function normalizeWord(practiceWord = '') {
  return Array.from(String(practiceWord)).filter((char) => char.trim().length > 0);
}

export function getWordRiverLibrary(languageId) {
  const fallbackWords = languageWordMap[DEFAULT_LANGUAGE_ID] ?? {};
  const languageWords = languageWordMap[languageId] ?? fallbackWords;

  return sharedWordEntries.map((entry) => {
    const practiceWord = languageWords[entry.id] ?? fallbackWords[entry.id] ?? entry.id;
    return {
      ...entry,
      practiceWord,
      characters: normalizeWord(practiceWord)
    };
  });
}

export function createWordRiverRound(languageId, { wordCount = 3 } = {}) {
  const entries = getWordRiverLibrary(languageId);
  const selected = shuffle(entries).slice(0, Math.max(1, Math.min(wordCount, entries.length)));
  const meaningOptions = shuffle(selected.map((word) => ({ id: word.id, translationKey: word.translationKey, emoji: word.emoji })));

  return {
    words: selected,
    options: meaningOptions
  };
}

export function buildLetterPool(words) {
  const letters = [];
  words.forEach((word) => {
    word.characters.forEach((char, index) => {
      letters.push({
        id: `${word.id}-${index}`,
        char,
        wordId: word.id,
        slotIndex: index
      });
    });
  });
  return letters;
}

export default {
  getWordRiverLibrary,
  createWordRiverRound,
  buildLetterPool
};
