/**
 * Hebrew reading texts for practice
 */

import { getStarterWordsTitle, getCommonWordsSubtitle, getGreetingsTitle, getGreetingsSubtitle } from '../common/titles.js';
import { createReadingText } from '../common/helpers.js';

export const hebrewReadingTexts = [
  // Starter Words - Basic Hebrew vocabulary
  createReadingText({
    id: 'hebrew-starter-words',
    title: getStarterWordsTitle(5),
    subtitle: getCommonWordsSubtitle('Hebrew'),
    practiceLanguage: 'hebrew',
    tokens: [
      { type: 'word', text: 'שלום', id: 'shalom' },
      { type: 'word', text: 'תודה', id: 'todah' },
      { type: 'word', text: 'כן', id: 'ken' },
      { type: 'word', text: 'תורה', id: 'torah' },
      { type: 'word', text: 'אמת', id: 'emet' },
      { type: 'punct', text: '.' }
    ],
    sentenceTokens: [
      { type: 'word', text: 'שלום', id: 'shalom' },
      { type: 'word', text: 'תודה', id: 'todah' },
      { type: 'punct', text: '.' },
      { type: 'word', text: 'כן', id: 'ken' },
      { type: 'punct', text: ',' },
      { type: 'word', text: 'תורה', id: 'torah' },
      { type: 'word', text: 'אמת', id: 'emet' },
      { type: 'punct', text: '.' }
    ],
    meaningKeys: {
      shalom: 'reading.meaning.shalom',
      todah: 'reading.meaning.todah',
      ken: 'reading.meaning.ken',
      torah: 'reading.meaning.torah',
      emet: 'reading.meaning.emet'
    },
    translations: {
      en: {
        shalom: { canonical: 'shalom', variants: ['shalom'] },
        todah: { canonical: 'todah', variants: ['todah', 'toda'] },
        ken: { canonical: 'ken', variants: ['ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'emet', variants: ['emet'] }
      },
      he: {
        shalom: { canonical: 'שלום', variants: ['שלום'] },
        todah: { canonical: 'תודה', variants: ['תודה'] },
        ken: { canonical: 'כן', variants: ['כן'] },
        torah: { canonical: 'תורה', variants: ['תורה'] },
        emet: { canonical: 'אמת', variants: ['אמת'] }
      },
      es: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'paz'] },
        todah: { canonical: 'gracias', variants: ['gracias', 'todah'] },
        ken: { canonical: 'si', variants: ['si', 'sí', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'verdad', variants: ['verdad', 'emet'] }
      },
      fr: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'paix'] },
        todah: { canonical: 'merci', variants: ['merci', 'todah'] },
        ken: { canonical: 'oui', variants: ['oui', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'verite', variants: ['verite', 'vérité', 'emet'] }
      },
      ar: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'سلام'] },
        todah: { canonical: 'todah', variants: ['todah', 'شكرا'] },
        ken: { canonical: 'ken', variants: ['ken', 'نعم'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'emet', variants: ['emet', 'حقيقة'] }
      },
      pt: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'paz'] },
        todah: { canonical: 'obrigado', variants: ['obrigado', 'todah'] },
        ken: { canonical: 'sim', variants: ['sim', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'verdade', variants: ['verdade', 'emet'] }
      },
      ru: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'мир'] },
        todah: { canonical: 'spasibo', variants: ['spasibo', 'todah'] },
        ken: { canonical: 'da', variants: ['da', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'pravda', variants: ['pravda', 'emet'] }
      },
      ja: {
        shalom: { canonical: 'shalom', variants: ['shalom', '平和'] },
        todah: { canonical: 'arigatou', variants: ['arigatou', 'todah'] },
        ken: { canonical: 'hai', variants: ['hai', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'shinjitsu', variants: ['shinjitsu', 'emet'] }
      },
      zh: {
        shalom: { canonical: 'shalom', variants: ['shalom', '和平'] },
        todah: { canonical: 'xiexie', variants: ['xiexie', 'todah'] },
        ken: { canonical: 'shi', variants: ['shi', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'zhenli', variants: ['zhenli', 'emet'] }
      },
      hi: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'shanti'] },
        todah: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'todah'] },
        ken: { canonical: 'haan', variants: ['haan', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'satya', variants: ['satya', 'emet'] }
      },
      bn: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'shanti'] },
        todah: { canonical: 'dhonnobad', variants: ['dhonnobad', 'todah'] },
        ken: { canonical: 'hyan', variants: ['hyan', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'satya', variants: ['satya', 'emet'] }
      },
      am: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'selam'] },
        todah: { canonical: 'ameseginalehu', variants: ['ameseginalehu', 'todah'] },
        ken: { canonical: 'awo', variants: ['awo', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'emet', variants: ['emet'] }
      }
    }
  }),

  // Greetings - Common Hebrew greetings and phrases
  createReadingText({
    id: 'hebrew-greetings',
    title: getGreetingsTitle(6),
    subtitle: getGreetingsSubtitle('Hebrew'),
    practiceLanguage: 'hebrew',
    tokens: [
      { type: 'word', text: 'שלום', id: 'shalom' },
      { type: 'word', text: 'בוקר', id: 'boker' },
      { type: 'word', text: 'טוב', id: 'tov' },
      { type: 'word', text: 'ערב', id: 'erev' },
      { type: 'word', text: 'טוב', id: 'tov2' },
      { type: 'word', text: 'להתראות', id: 'lehitraot' },
      { type: 'punct', text: '.' }
    ],
    sentenceTokens: [
      { type: 'word', text: 'שלום', id: 'shalom' },
      { type: 'word', text: 'בוקר', id: 'boker' },
      { type: 'word', text: 'טוב', id: 'tov' },
      { type: 'punct', text: ',' },
      { type: 'word', text: 'ערב', id: 'erev' },
      { type: 'word', text: 'טוב', id: 'tov2' },
      { type: 'word', text: 'להתראות', id: 'lehitraot' },
      { type: 'punct', text: '.' }
    ],
    meaningKeys: {
      shalom: 'reading.meaning.shalom',
      boker: 'reading.meaning.boker',
      tov: 'reading.meaning.tov',
      erev: 'reading.meaning.erev',
      tov2: 'reading.meaning.tov',
      lehitraot: 'reading.meaning.lehitraot'
    },
    translations: {
      en: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'hello', 'peace'] },
        boker: { canonical: 'boker', variants: ['boker', 'morning'] },
        tov: { canonical: 'tov', variants: ['tov', 'good'] },
        erev: { canonical: 'erev', variants: ['erev', 'evening'] },
        tov2: { canonical: 'tov', variants: ['tov', 'good'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'goodbye', 'bye'] }
      },
      he: {
        shalom: { canonical: 'שלום', variants: ['שלום'] },
        boker: { canonical: 'בוקר', variants: ['בוקר'] },
        tov: { canonical: 'טוב', variants: ['טוב'] },
        erev: { canonical: 'ערב', variants: ['ערב'] },
        tov2: { canonical: 'טוב', variants: ['טוב'] },
        lehitraot: { canonical: 'להתראות', variants: ['להתראות'] }
      },
      es: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'hola'] },
        boker: { canonical: 'boker', variants: ['boker', 'manana', 'mañana'] },
        tov: { canonical: 'tov', variants: ['tov', 'bueno'] },
        erev: { canonical: 'erev', variants: ['erev', 'noche'] },
        tov2: { canonical: 'tov', variants: ['tov', 'bueno'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'adios', 'adiós'] }
      },
      fr: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'bonjour'] },
        boker: { canonical: 'boker', variants: ['boker', 'matin'] },
        tov: { canonical: 'tov', variants: ['tov', 'bon'] },
        erev: { canonical: 'erev', variants: ['erev', 'soir'] },
        tov2: { canonical: 'tov', variants: ['tov', 'bon'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'au revoir'] }
      },
      ar: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'مرحبا'] },
        boker: { canonical: 'boker', variants: ['boker', 'صباح'] },
        tov: { canonical: 'tov', variants: ['tov', 'جيد'] },
        erev: { canonical: 'erev', variants: ['erev', 'مساء'] },
        tov2: { canonical: 'tov', variants: ['tov', 'جيد'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'وداعا'] }
      },
      pt: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'ola', 'olá'] },
        boker: { canonical: 'boker', variants: ['boker', 'manha', 'manhã'] },
        tov: { canonical: 'tov', variants: ['tov', 'bom'] },
        erev: { canonical: 'erev', variants: ['erev', 'noite'] },
        tov2: { canonical: 'tov', variants: ['tov', 'bom'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'adeus'] }
      },
      ru: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'привет'] },
        boker: { canonical: 'boker', variants: ['boker', 'утро'] },
        tov: { canonical: 'tov', variants: ['tov', 'хороший'] },
        erev: { canonical: 'erev', variants: ['erev', 'вечер'] },
        tov2: { canonical: 'tov', variants: ['tov', 'хороший'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'до свидания'] }
      },
      ja: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'こんにちは'] },
        boker: { canonical: 'boker', variants: ['boker', '朝'] },
        tov: { canonical: 'tov', variants: ['tov', 'いい'] },
        erev: { canonical: 'erev', variants: ['erev', '夕'] },
        tov2: { canonical: 'tov', variants: ['tov', 'いい'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'さようなら'] }
      },
      zh: {
        shalom: { canonical: 'shalom', variants: ['shalom', '你好'] },
        boker: { canonical: 'boker', variants: ['boker', '早晨'] },
        tov: { canonical: 'tov', variants: ['tov', '好'] },
        erev: { canonical: 'erev', variants: ['erev', '晚上'] },
        tov2: { canonical: 'tov', variants: ['tov', '好'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', '再见'] }
      },
      hi: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'नमस्ते'] },
        boker: { canonical: 'boker', variants: ['boker', 'सुबह'] },
        tov: { canonical: 'tov', variants: ['tov', 'अच्छा'] },
        erev: { canonical: 'erev', variants: ['erev', 'शाम'] },
        tov2: { canonical: 'tov', variants: ['tov', 'अच्छा'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'अलविदा'] }
      },
      bn: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'নমস্কার'] },
        boker: { canonical: 'boker', variants: ['boker', 'সকাল'] },
        tov: { canonical: 'tov', variants: ['tov', 'ভালো'] },
        erev: { canonical: 'erev', variants: ['erev', 'সন্ধ্যা'] },
        tov2: { canonical: 'tov', variants: ['tov', 'ভালো'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'বিদায়'] }
      },
      am: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'ሰላም'] },
        boker: { canonical: 'boker', variants: ['boker', 'ጠዋት'] },
        tov: { canonical: 'tov', variants: ['tov', 'ጥሩ'] },
        erev: { canonical: 'erev', variants: ['erev', 'ማታ'] },
        tov2: { canonical: 'tov', variants: ['tov', 'ጥሩ'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'ቻው'] }
      }
    }
  })
];
