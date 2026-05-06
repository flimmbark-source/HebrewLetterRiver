import { languagePacks, defaultAppLanguageId } from '../data/languages/index.js';

const dictionaryModules = import.meta.glob('./*.json', { eager: true });

const loadedDictionaries = Object.entries(dictionaryModules).reduce((acc, [path, module]) => {
  const dictionary = module?.default ?? module;
  if (!dictionary || typeof dictionary !== 'object') return acc;
  const idFromMeta = dictionary?.language?.id;
  const filename = path.replace('./', '').replace(/\.json$/i, '');
  const resolvedId = idFromMeta || filename;
  if (resolvedId) {
    acc[resolvedId] = dictionary;
  }
  return acc;
}, {});

// Newer Home/streak/review UI keys were added after several app-language JSON
// files were generated. Keep these small patches here so app-language changes
// visibly affect the current Home screen without rewriting huge locale files.
const supplementalDictionaries = {
  portuguese: {
    common: {
      active: 'ATIVO',
      day: 'dia',
      days: 'dias'
    },
    home: {
      languageLearning: { title: 'Aprendizado de idiomas' },
      profile: { learningSince: 'Aprendendo desde {{date}}' },
      profileOverview: { title: 'Visão geral do perfil' },
      gameActivity: {
        title: 'Atividade de jogo',
        empty: 'Comece um jogo e sua atividade mais recente aparecerá aqui.'
      },
      progress: {
        levelLabel: 'NÍVEL {{level}}',
        recentMastery: 'Domínio recente',
        emptyMastery: 'Capture algumas letras para desbloquear sua linha de domínio.'
      },
      quest: {
        dailyGoal: 'Meta diária',
        minutesPerDay: 'min/dia',
        minutesPerDayValue: '{{minutes}} min / dia'
      },
      reminders: { title: 'Lembretes' },
      cta: {
        letterRiver: 'Rio de Letras',
        startLetters: 'Comece a aprender letras brincando',
        showAllModes: 'Mostrar todos os modos'
      },
      footer: {
        syncNotice: 'Seu progresso é sincronizado automaticamente com sua conta na nuvem.',
        privacyPolicy: 'Política de Privacidade'
      }
    },
    dailyReview: {
      title: 'Revisão diária',
      allCaughtUp: 'Tudo em dia!',
      checkBackTomorrow: 'Ótimo trabalho. Volte amanhã.',
      lettersDue_one: '{{count}} letra para revisar',
      lettersDue_other: '{{count}} letras para revisar',
      wordsDue_one: '{{count}} palavra para praticar',
      wordsDue_other: '{{count}} palavras para praticar',
      focusOn: 'Foque em: {{symbol}} ({{name}})'
    },
    streak: {
      startJourney: 'Comece sua jornada!',
      greatStart: 'Ótimo começo! Continue assim',
      buildingMomentum: 'Você está ganhando ritmo!',
      onFire: 'Você está mandando bem!',
      incredibleDedication: 'Dedicação incrível!',
      legendaryCommitment: 'Compromisso lendário!',
      todayComplete: 'Hoje: completo',
      todayNotYet: 'Hoje: ainda não',
      daysUntilMilestone_one: 'Mais {{count}} dia até {{label}}!',
      daysUntilMilestone_other: 'Mais {{count}} dias até {{label}}!',
      repair: 'Reparar sequência (20 estrelas)',
      restoreTo: 'restaurar para {{count}} dias',
      personalBest: 'Melhor sequência: {{count}} dias',
      freezeAvailable_one: '{{count}} proteção de sequência disponível',
      freezeAvailable_other: '{{count}} proteções de sequência disponíveis'
    }
  }
};

const fallbackId = defaultAppLanguageId;
const fallbackDictionary =
  loadedDictionaries[fallbackId] ?? Object.values(loadedDictionaries)[0] ?? {};

function resolveDictionaryId(languageId) {
  const pack = languagePacks[languageId];
  const requestedId = pack?.metadata?.dictionaryId ?? languageId;
  if (requestedId && requestedId in loadedDictionaries) {
    return requestedId;
  }
  if (fallbackId in loadedDictionaries) {
    return fallbackId;
  }
  const availableIds = Object.keys(loadedDictionaries);
  return availableIds.length > 0 ? availableIds[0] : null;
}

function lookupValue(source, segments) {
  let value = source;
  for (const segment of segments) {
    if (value && typeof value === 'object' && segment in value) {
      value = value[segment];
    } else {
      return null;
    }
  }
  return value;
}

export function getDictionary(languageId) {
  const dictionaryId = resolveDictionaryId(languageId);
  if (dictionaryId && dictionaryId in loadedDictionaries) {
    return loadedDictionaries[dictionaryId];
  }
  return fallbackDictionary;
}

export function translate(dictionary, key, replacements = {}) {
  if (!dictionary) return key;
  const segments = Array.isArray(key) ? key : String(key).split('.');
  const dictionaryId = dictionary?.language?.id;

  let value = lookupValue(supplementalDictionaries[dictionaryId], segments);

  if (typeof value !== 'string') {
    value = lookupValue(dictionary, segments);
  }

  if (typeof value !== 'string' && dictionary !== fallbackDictionary) {
    value = lookupValue(fallbackDictionary, segments);
  }

  if (typeof value !== 'string') return key;

  return value.replace(/{{\s*(.+?)\s*}}/g, (match, token) => {
    const replacementKey = token.trim();
    return replacements[replacementKey] ?? match;
  });
}

export function formatTemplate(template, replacements = {}) {
  if (typeof template !== 'string') return template;
  return template.replace(/{{\s*(.+?)\s*}}/g, (match, token) => {
    const replacementKey = token.trim();
    return replacements[replacementKey] ?? match;
  });
}

