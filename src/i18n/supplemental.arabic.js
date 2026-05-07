// Arabic supplemental translations for newer UI keys.
export const arabicSupplementalDictionary = {
  common: {
    active: 'نشط',
    day: 'يوم',
    days: 'أيام'
  },
  app: {
    brand: { name: 'نهر الحروف' },
    playMode: {
      title: 'اختر النمط',
      close: 'إغلاق',
      letterRiver: {
        name: 'نهر الحروف',
        description: 'التقط الحروف وهي تنساب في النهر'
      },
      vocabBuilder: {
        name: 'باني المفردات',
        description: 'العب لتتعلم المفردات وتتدرب عليها'
      },
      deepScript: {
        name: 'الكتابة العميقة',
        description: 'استكشف زنزانة لا نهائية باستخدام كلمات المفردات'
      }
    }
  },
  home: {
    languageLearning: { title: 'تعلم اللغة' },
    profile: { learningSince: 'يتعلم منذ {{date}}' },
    profileOverview: { title: 'نظرة عامة على الملف' },
    gameActivity: {
      title: 'نشاط اللعب',
      empty: 'ابدأ لعبة وسيظهر نشاطك الأخير هنا.'
    },
    progress: {
      levelLabel: 'المستوى {{level}}',
      recentMastery: 'إتقان حديث',
      emptyMastery: 'التقط بعض الحروف لفتح صف الإتقان الخاص بك.'
    },
    quest: {
      dailyGoal: 'الهدف اليومي',
      minutesPerDay: 'دقيقة/اليوم',
      minutesPerDayValue: '{{minutes}} دقيقة / اليوم'
    },
    reminders: { title: 'التذكيرات' },
    cta: {
      letterRiver: 'نهر الحروف',
      startLetters: 'ابدأ تعلم الحروف من خلال اللعب',
      showAllModes: 'إظهار كل الأنماط'
    },
    footer: {
      syncNotice: 'تتم مزامنة تقدمك تلقائيًا مع حسابك السحابي.',
      privacyPolicy: 'سياسة الخصوصية'
    }
  },
  dailyReview: {
    title: 'المراجعة اليومية',
    allCaughtUp: 'كل شيء مكتمل!',
    checkBackTomorrow: 'عمل رائع. عُد غدًا.',
    lettersDue_one: 'حرف واحد للمراجعة',
    lettersDue_other: '{{count}} حروف للمراجعة',
    wordsDue_one: 'كلمة واحدة للتدريب',
    wordsDue_other: '{{count}} كلمات للتدريب',
    focusOn: 'ركّز على: {{symbol}} ({{name}})'
  },
  streak: {
    startJourney: 'ابدأ رحلتك!',
    greatStart: 'بداية رائعة! واصل التقدم',
    buildingMomentum: 'أنت تكتسب الزخم!',
    onFire: 'أنت متألق!',
    incredibleDedication: 'التزام مذهل!',
    legendaryCommitment: 'التزام أسطوري!',
    todayComplete: 'اليوم: مكتمل',
    todayNotYet: 'اليوم: ليس بعد',
    daysUntilMilestone_one: 'يوم واحد آخر حتى {{label}}!',
    daysUntilMilestone_other: '{{count}} أيام أخرى حتى {{label}}!',
    repair: 'إصلاح السلسلة (20 نجمة)',
    restoreTo: 'استعادة إلى {{count}} أيام',
    personalBest: 'أفضل سلسلة شخصية: {{count}} أيام',
    freezeAvailable_one: 'تجميد سلسلة واحد متاح',
    freezeAvailable_other: '{{count}} تجميدات سلسلة متاحة'
  },
  bridgeBuilder: {
    sections: {
      foundations: { title: 'الأساسيات' },
      daily_life: { title: 'الحياة اليومية' },
      people_social: { title: 'الناس والحياة الاجتماعية' },
      meaning_builders: { title: 'بناة المعنى' },
      cafe_talk: { title: 'حديث المقهى' }
    },
    vocabJourney: {
      title: 'رحلة المفردات',
      startPath: 'ابدأ مسار التعلم الخاص بك',
      noPacks: 'لا توجد حزم متاحة بعد.',
      allPacks: 'كل الحزم',
      currentPack: 'الحزمة الحالية',
      currentGoal: 'الهدف الحالي: {{goal}}',
      learnEverydayWords: 'تعلم {{count}} كلمات يومية',
      tapForPackDetails: 'اضغط لرؤية تفاصيل الحزمة',
      openDetailsFor: 'فتح تفاصيل {{title}}',
      packDetails: 'تفاصيل الحزمة',
      closePackDetails: 'إغلاق تفاصيل الحزمة',
      savePack: 'حفظ الحزمة',
      continueLearningWords: 'واصل تعلم كلمات جديدة.',
      recommendedNext: 'التالي الموصى به',
      moreWaysToLearn: 'طرق أخرى للتعلم',
      optionLoosePlanksTitle: 'تقوية — ألواح سائبة',
      optionLoosePlanksSubtitle: 'عزّز بالتدريب الموجّه.',
      optionReviewTitle: 'مراجعة — مراجعة اليوم',
      optionReviewSubtitle: 'راجع الكلمات لتثبيتها في الذاكرة.',
      optionDeepScriptTitle: 'تحدي — الكتابة العميقة',
      optionDeepScriptSubtitle: 'اختبر عمق الفهم بالكتابة والاستدعاء.',
      optionReadTitle: 'قراءة — حديث المقهى',
      optionReadSubtitle: 'شاهد الكلمات في محادثة حقيقية.',
      todaysReviewWords: 'مراجعة اليوم — {{count}} كلمات',
      keepWordsStrong: 'حافظ على قوة كلماتك.',
      completePackToUnlockReview: 'أكمل حزمة لفتح المراجعة.',
      readInContextTitle: 'قراءة في السياق — حديث المقهى',
      readInContextLockedSubtitle: 'تُفتح بعد هذه الحزمة.',
      missingPackContent: 'محتوى هذه الحزمة غير متاح بعد بلغة التدريب المحددة.',
      loadingWords: 'جارٍ تحميل الكلمات...',
      packLearningProgress: 'تقدم تعلم الحزمة',
      currentSectionProgress: '{{section}} · {{percent}}% مكتمل',
      statusOpenPath: 'مسار مفتوح',
      statusLocked: 'مقفل',
      statusComplete: 'مكتمل',
      statusCurrent: 'حالي',
      stageNotStarted: 'لم يبدأ',
      stageFirstLook: 'نظرة أولى',
      stageMeaning: 'المعنى',
      stageReview: 'مراجعة',
      stageChallenge: 'تحدي',
      stageReadyForChallenge: 'جاهز للتحدي',
      stageStrengtheningMemory: 'تقوية الذاكرة',
      stageLearningMeanings: 'تعلم المعاني',
      stageNewPack: 'حزمة جديدة',
      actionBridgeTitle: 'باني المفردات',
      actionBridgeSubtitle: 'الأفضل لرؤية الكلمة والصوت والمعنى لأول مرة.',
      actionStartBridge: 'ابدأ: باني المفردات',
      actionContinueBridge: 'تابع: باني المفردات',
      actionLoosePlanksTitle: 'تقوية — ألواح سائبة',
      actionLoosePlanksSubtitle: 'عزّز بالتدريب الموجّه.',
      actionContinueLoosePlanks: 'تابع: ألواح سائبة',
      actionDeepScriptTitle: 'تحدي — الكتابة العميقة',
      actionDeepScriptSubtitle: 'اختبر عمق الفهم بالكتابة والاستدعاء.',
      actionContinueDeepScript: 'تابع: الكتابة العميقة',
      actionReviewTitle: 'مراجعة',
      actionReviewSubtitle: 'حافظ على هذه الكلمات حاضرة.',
      actionReviewPack: 'راجع هذه الحزمة'
    }
  },
  packs: {
    greetings_01: {
      title: 'التحيات',
      description: 'مرحبًا، شكرًا، والمجاملات الأساسية'
    },
    pronouns_01: {
      title: 'الضمائر',
      description: 'أنا، أنت، والضمائر الأساسية'
    },
    pronouns_02: {
      title: 'الضمائر 2',
      description: 'هو، هي، نحن، وهم'
    },
    family_01: {
      title: 'العائلة',
      description: 'أمي، أبي، العائلة، والبيت'
    },
    family_02: {
      title: 'العائلة 2',
      description: 'صديق، طفل، والد، جار، والمزيد'
    },
    food_01: {
      title: 'الطعام والشراب',
      description: 'خبز، ماء، قهوة، والمزيد'
    },
    food_02: {
      title: 'الطعام والشراب 2',
      description: 'طعام، ماء، وقهوة'
    },
    adjectives_01: {
      title: 'الصفات',
      description: 'جيد، كبير، صغير، وجميل'
    },
    adjectives_02: {
      title: 'الصفات 2',
      description: 'رائع، لطيف، جميل، سيئ، والمزيد'
    },
    adjectives_03: {
      title: 'الصفات 3',
      description: 'قبيح وغريب'
    },
    numbers_01: {
      title: 'الأرقام',
      description: 'العد من واحد إلى خمسة'
    },
    colors_01: {
      title: 'الألوان',
      description: 'أحمر، أزرق، أخضر، والمزيد'
    },
    everyday_objects_01: {
      title: 'أشياء يومية',
      description: 'كتاب، هاتف، طاولة، وباب'
    },
    everyday_objects_02: {
      title: 'أشياء يومية 2',
      description: 'كتاب، هاتف، وشيء'
    }
  }
};
