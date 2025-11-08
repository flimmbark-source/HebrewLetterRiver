const createWord = (id, practice, translationKey, emoji) => ({
  id,
  practice,
  translationKey,
  emoji
});

export const wordRiverCatalog = {
  hebrew: [
    createWord('house', 'בית', 'wordRiver.words.house', '🏠'),
    createWord('dog', 'כלב', 'wordRiver.words.dog', '🐕'),
    createWord('milk', 'חלב', 'wordRiver.words.milk', '🥛'),
    createWord('sun', 'שמש', 'wordRiver.words.sun', '☀️'),
    createWord('tree', 'עץ', 'wordRiver.words.tree', '🌳'),
    createWord('book', 'ספר', 'wordRiver.words.book', '📚')
  ],
  english: [
    createWord('house', 'house', 'wordRiver.words.house', '🏠'),
    createWord('dog', 'dog', 'wordRiver.words.dog', '🐕'),
    createWord('milk', 'milk', 'wordRiver.words.milk', '🥛'),
    createWord('sun', 'sun', 'wordRiver.words.sun', '☀️'),
    createWord('tree', 'tree', 'wordRiver.words.tree', '🌳'),
    createWord('book', 'book', 'wordRiver.words.book', '📚')
  ],
  mandarin: [
    createWord('house', '房子', 'wordRiver.words.house', '🏠'),
    createWord('dog', '狗', 'wordRiver.words.dog', '🐕'),
    createWord('milk', '牛奶', 'wordRiver.words.milk', '🥛'),
    createWord('sun', '太阳', 'wordRiver.words.sun', '☀️'),
    createWord('tree', '树', 'wordRiver.words.tree', '🌳'),
    createWord('book', '书', 'wordRiver.words.book', '📚')
  ],
  hindi: [
    createWord('house', 'घर', 'wordRiver.words.house', '🏠'),
    createWord('dog', 'कुत्ता', 'wordRiver.words.dog', '🐕'),
    createWord('milk', 'दूध', 'wordRiver.words.milk', '🥛'),
    createWord('sun', 'सूरज', 'wordRiver.words.sun', '☀️'),
    createWord('tree', 'पेड़', 'wordRiver.words.tree', '🌳'),
    createWord('book', 'किताब', 'wordRiver.words.book', '📚')
  ],
  spanish: [
    createWord('house', 'casa', 'wordRiver.words.house', '🏠'),
    createWord('dog', 'perro', 'wordRiver.words.dog', '🐕'),
    createWord('milk', 'leche', 'wordRiver.words.milk', '🥛'),
    createWord('sun', 'sol', 'wordRiver.words.sun', '☀️'),
    createWord('tree', 'árbol', 'wordRiver.words.tree', '🌳'),
    createWord('book', 'libro', 'wordRiver.words.book', '📚')
  ],
  french: [
    createWord('house', 'maison', 'wordRiver.words.house', '🏠'),
    createWord('dog', 'chien', 'wordRiver.words.dog', '🐕'),
    createWord('milk', 'lait', 'wordRiver.words.milk', '🥛'),
    createWord('sun', 'soleil', 'wordRiver.words.sun', '☀️'),
    createWord('tree', 'arbre', 'wordRiver.words.tree', '🌳'),
    createWord('book', 'livre', 'wordRiver.words.book', '📚')
  ],
  arabic: [
    createWord('house', 'بيت', 'wordRiver.words.house', '🏠'),
    createWord('dog', 'كلب', 'wordRiver.words.dog', '🐕'),
    createWord('milk', 'حليب', 'wordRiver.words.milk', '🥛'),
    createWord('sun', 'شمس', 'wordRiver.words.sun', '☀️'),
    createWord('tree', 'شجرة', 'wordRiver.words.tree', '🌳'),
    createWord('book', 'كتاب', 'wordRiver.words.book', '📚')
  ],
  bengali: [
    createWord('house', 'বাড়ি', 'wordRiver.words.house', '🏠'),
    createWord('dog', 'কুকুর', 'wordRiver.words.dog', '🐕'),
    createWord('milk', 'দুধ', 'wordRiver.words.milk', '🥛'),
    createWord('sun', 'সূর্য', 'wordRiver.words.sun', '☀️'),
    createWord('tree', 'গাছ', 'wordRiver.words.tree', '🌳'),
    createWord('book', 'বই', 'wordRiver.words.book', '📚')
  ],
  portuguese: [
    createWord('house', 'casa', 'wordRiver.words.house', '🏠'),
    createWord('dog', 'cachorro', 'wordRiver.words.dog', '🐕'),
    createWord('milk', 'leite', 'wordRiver.words.milk', '🥛'),
    createWord('sun', 'sol', 'wordRiver.words.sun', '☀️'),
    createWord('tree', 'árvore', 'wordRiver.words.tree', '🌳'),
    createWord('book', 'livro', 'wordRiver.words.book', '📚')
  ],
  russian: [
    createWord('house', 'дом', 'wordRiver.words.house', '🏠'),
    createWord('dog', 'собака', 'wordRiver.words.dog', '🐕'),
    createWord('milk', 'молоко', 'wordRiver.words.milk', '🥛'),
    createWord('sun', 'солнце', 'wordRiver.words.sun', '☀️'),
    createWord('tree', 'дерево', 'wordRiver.words.tree', '🌳'),
    createWord('book', 'книга', 'wordRiver.words.book', '📚')
  ],
  japanese: [
    createWord('house', '家', 'wordRiver.words.house', '🏠'),
    createWord('dog', '犬', 'wordRiver.words.dog', '🐕'),
    createWord('milk', '牛乳', 'wordRiver.words.milk', '🥛'),
    createWord('sun', '太陽', 'wordRiver.words.sun', '☀️'),
    createWord('tree', '木', 'wordRiver.words.tree', '🌳'),
    createWord('book', '本', 'wordRiver.words.book', '📚')
  ]
};

export function getWordRiverWords(languageId) {
  return wordRiverCatalog[languageId] ?? [];
}

