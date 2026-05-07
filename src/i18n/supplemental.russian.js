// Russian supplemental translations for newer UI keys.
export const russianSupplementalDictionary = {
  common: {
    active: 'АКТИВНО',
    day: 'день',
    days: 'дней'
  },
  app: {
    brand: { name: 'Река букв' },
    playMode: {
      title: 'Выберите режим',
      close: 'Закрыть',
      letterRiver: {
        name: 'Река букв',
        description: 'Лови буквы, пока они плывут по реке'
      },
      vocabBuilder: {
        name: 'Конструктор словаря',
        description: 'Играй, чтобы учить и повторять слова'
      },
      deepScript: {
        name: 'Глубокое письмо',
        description: 'Исследуй бесконечное подземелье со словами'
      }
    }
  },
  home: {
    languageLearning: { title: 'Изучение языков' },
    profile: { learningSince: 'Учишься с {{date}}' },
    profileOverview: { title: 'Обзор профиля' },
    gameActivity: {
      title: 'Игровая активность',
      empty: 'Начни игру, и последняя активность появится здесь.'
    },
    progress: {
      levelLabel: 'УРОВЕНЬ {{level}}',
      recentMastery: 'Недавнее освоение',
      emptyMastery: 'Поймай несколько букв, чтобы открыть строку освоения.'
    },
    quest: {
      dailyGoal: 'Ежедневная цель',
      minutesPerDay: 'мин/день',
      minutesPerDayValue: '{{minutes}} мин / день'
    },
    reminders: { title: 'Напоминания' },
    cta: {
      letterRiver: 'Река букв',
      startLetters: 'Начни учить буквы через игру',
      showAllModes: 'Показать все режимы'
    },
    footer: {
      syncNotice: 'Твой прогресс автоматически синхронизируется с облачным аккаунтом.',
      privacyPolicy: 'Политика конфиденциальности'
    }
  },
  dailyReview: {
    title: 'Ежедневное повторение',
    allCaughtUp: 'Всё выполнено!',
    checkBackTomorrow: 'Отличная работа. Возвращайся завтра.',
    lettersDue_one: '{{count}} буква для повторения',
    lettersDue_other: '{{count}} букв для повторения',
    wordsDue_one: '{{count}} слово для практики',
    wordsDue_other: '{{count}} слов для практики',
    focusOn: 'Сфокусируйся на: {{symbol}} ({{name}})'
  },
  streak: {
    startJourney: 'Начни своё путешествие!',
    greatStart: 'Отличное начало! Продолжай',
    buildingMomentum: 'Ты набираешь темп!',
    onFire: 'Ты в ударе!',
    incredibleDedication: 'Невероятная настойчивость!',
    legendaryCommitment: 'Легендарная преданность!',
    todayComplete: 'Сегодня: выполнено',
    todayNotYet: 'Сегодня: ещё нет',
    daysUntilMilestone_one: 'Ещё {{count}} день до {{label}}!',
    daysUntilMilestone_other: 'Ещё {{count}} дней до {{label}}!',
    repair: 'Восстановить серию (20 звёзд)',
    restoreTo: 'восстановить до {{count}} дней',
    personalBest: 'Лучший результат: {{count}} дней',
    freezeAvailable_one: '{{count}} заморозка серии доступна',
    freezeAvailable_other: '{{count}} заморозок серии доступно'
  },
  bridgeBuilder: {
    sections: {
      foundations: { title: 'Основы' },
      daily_life: { title: 'Повседневная жизнь' },
      people_social: { title: 'Люди и общение' },
      meaning_builders: { title: 'Построение смысла' },
      cafe_talk: { title: 'Разговор в кафе' }
    },
    vocabJourney: {
      title: 'Путь словаря',
      startPath: 'Начни свой путь обучения',
      noPacks: 'Пока нет доступных наборов.',
      allPacks: 'Все наборы',
      currentPack: 'Текущий набор',
      currentGoal: 'Текущая цель: {{goal}}',
      learnEverydayWords: 'Выучи {{count}} повседневных слов',
      tapForPackDetails: 'Нажми, чтобы увидеть детали набора',
      openDetailsFor: 'Открыть детали для {{title}}',
      packDetails: 'Детали набора',
      closePackDetails: 'Закрыть детали набора',
      savePack: 'Сохранить набор',
      continueLearningWords: 'Продолжай учить новые слова.',
      recommendedNext: 'Рекомендуется дальше',
      moreWaysToLearn: 'Другие способы учиться',
      optionLoosePlanksTitle: 'Закрепление — Свободные доски',
      optionLoosePlanksSubtitle: 'Закрепляй с целевой практикой.',
      optionReviewTitle: 'Повторение — Сегодняшнее повторение',
      optionReviewSubtitle: 'Повторяй слова для памяти.',
      optionDeepScriptTitle: 'Испытание — Глубокое письмо',
      optionDeepScriptSubtitle: 'Проверь глубину через письмо и вспоминание.',
      optionReadTitle: 'Чтение — Разговор в кафе',
      optionReadSubtitle: 'Увидь слова в настоящем разговоре.',
      todaysReviewWords: 'Сегодняшнее повторение — {{count}} слов',
      keepWordsStrong: 'Держи слова крепкими.',
      completePackToUnlockReview: 'Заверши набор, чтобы открыть повторение.',
      readInContextTitle: 'Чтение в контексте — Разговор в кафе',
      readInContextLockedSubtitle: 'Откроется после этого набора.',
      missingPackContent: 'Содержимое этого набора пока недоступно на выбранном языке практики.',
      loadingWords: 'Загрузка слов...',
      packLearningProgress: 'Прогресс изучения набора',
      currentSectionProgress: '{{section}} · {{percent}}% завершено',
      statusOpenPath: 'Открытый путь',
      statusLocked: 'Закрыто',
      statusComplete: 'Завершено',
      statusCurrent: 'Текущий',
      stageNotStarted: 'Не начато',
      stageFirstLook: 'Первый взгляд',
      stageMeaning: 'Значение',
      stageReview: 'Повторение',
      stageChallenge: 'Испытание',
      stageReadyForChallenge: 'Готово к испытанию',
      stageStrengtheningMemory: 'Укрепление памяти',
      stageLearningMeanings: 'Изучение значений',
      stageNewPack: 'Новый набор',
      actionBridgeTitle: 'Конструктор словаря',
      actionBridgeSubtitle: 'Лучше всего для первого знакомства со словом, звучанием и значением.',
      actionStartBridge: 'Начать: Конструктор словаря',
      actionContinueBridge: 'Продолжить: Конструктор словаря',
      actionLoosePlanksTitle: 'Закрепление — Свободные доски',
      actionLoosePlanksSubtitle: 'Закрепляй с целевой практикой.',
      actionContinueLoosePlanks: 'Продолжить: Свободные доски',
      actionDeepScriptTitle: 'Испытание — Глубокое письмо',
      actionDeepScriptSubtitle: 'Проверь глубину через письмо и вспоминание.',
      actionContinueDeepScript: 'Продолжить: Глубокое письмо',
      actionReviewTitle: 'Повторение',
      actionReviewSubtitle: 'Сохраняй эти слова свежими.',
      actionReviewPack: 'Повторить этот набор'
    }
  },
  packs: {
    greetings_01: {
      title: 'Приветствия',
      description: 'Здравствуйте, спасибо и базовая вежливость'
    },
    pronouns_01: {
      title: 'Местоимения',
      description: 'Я, ты и базовые местоимения'
    },
    pronouns_02: {
      title: 'Местоимения 2',
      description: 'Он, она, мы и они'
    },
    family_01: {
      title: 'Семья',
      description: 'Мама, папа, семья и дом'
    },
    family_02: {
      title: 'Семья 2',
      description: 'Друг, ребёнок, родитель, сосед и другое'
    },
    food_01: {
      title: 'Еда и напитки',
      description: 'Хлеб, вода, кофе и другое'
    },
    food_02: {
      title: 'Еда и напитки 2',
      description: 'Еда, вода и кофе'
    },
    adjectives_01: {
      title: 'Прилагательные',
      description: 'Хороший, большой, маленький и красивый'
    },
    adjectives_02: {
      title: 'Прилагательные 2',
      description: 'Отличный, приятный, красивый, плохой и другое'
    },
    adjectives_03: {
      title: 'Прилагательные 3',
      description: 'Уродливый и странный'
    },
    numbers_01: {
      title: 'Числа',
      description: 'Счёт от одного до пяти'
    },
    colors_01: {
      title: 'Цвета',
      description: 'Красный, синий, зелёный и другое'
    },
    everyday_objects_01: {
      title: 'Повседневные предметы',
      description: 'Книга, телефон, стол и дверь'
    },
    everyday_objects_02: {
      title: 'Повседневные предметы 2',
      description: 'Книга, телефон и вещь'
    }
  }
};
