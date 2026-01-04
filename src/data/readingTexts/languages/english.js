/**
 * English reading texts for practice
 */

import { getStarterWordsTitle, getCommonWordsSubtitle } from '../common/titles.js';
import { createReadingText, buildStarterWordTranslations } from '../common/helpers.js';

export const englishReadingTexts = [
  createReadingText({
    id: 'english-starter-words',
    title: getStarterWordsTitle(5),
    subtitle: getCommonWordsSubtitle('English'),
    practiceLanguage: 'english',
    tokens: [
      { type: 'word', text: 'hello', id: 'hello' },
      { type: 'word', text: 'thanks', id: 'thanks' },
      { type: 'word', text: 'yes', id: 'yes' },
      { type: 'word', text: 'no', id: 'no' },
      { type: 'word', text: 'good', id: 'good' },
      { type: 'punct', text: '.' }
    ],
    sentenceTokens: [
      [
        { type: 'word', text: 'hello', id: 'hello' },
        { type: 'punct', text: ',' },
        { type: 'word', text: 'yes', id: 'yes' },
        { type: 'word', text: 'this' },
        { type: 'word', text: 'is' },
        { type: 'word', text: 'a' },
        { type: 'word', text: 'good', id: 'good' },
        { type: 'word', text: 'idea' },
        { type: 'punct', text: ',' },
        { type: 'word', text: 'thanks', id: 'thanks' },
        { type: 'punct', text: '!' }
      ],
      [
        { type: 'word', text: 'no', id: 'no' },
        { type: 'word', text: 'thanks', id: 'thanks' },
        { type: 'punct', text: ',' },
        { type: 'word', text: 'hello', id: 'hello' },
        { type: 'word', text: 'and' },
        { type: 'word', text: 'good', id: 'good' },
        { type: 'word', text: 'morning' },
        { type: 'punct', text: '.' }
      ]
    ],
    meaningKeys: {
      hello: 'reading.meaning.hello',
      thanks: 'reading.meaning.todah',
      yes: 'reading.meaning.yes',
      no: 'reading.meaning.no',
      good: 'reading.meaning.tov'
    },
    translations: buildStarterWordTranslations('english', {
      // Custom English-specific variants
      thanks: {
        en: { canonical: 'thanks', variants: ['thanks', 'thank you'] }
      },
      good: {
        es: { canonical: 'bueno', variants: ['bueno', 'bien', 'good'] },
        fr: { canonical: 'bon', variants: ['bon', 'bien', 'good'] }
      }
    })
  })
];
