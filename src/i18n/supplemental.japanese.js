// Japanese supplemental translations for newer UI keys.
export const japaneseSupplementalDictionary = {
  common: {
    active: 'アクティブ',
    day: '日',
    days: '日'
  },
  app: {
    brand: { name: '文字の川' },
    playMode: {
      title: 'モードを選ぶ',
      close: '閉じる',
      letterRiver: {
        name: '文字の川',
        description: '川を流れる文字をつかまえよう'
      },
      vocabBuilder: {
        name: '語彙ビルダー',
        description: 'ゲームで語彙を学び、練習しよう'
      },
      deepScript: {
        name: 'ディープスクリプト',
        description: '語彙の言葉で無限のダンジョンを探索しよう'
      }
    }
  },
  home: {
    languageLearning: { title: '言語学習' },
    profile: { learningSince: '{{date}}から学習中' },
    profileOverview: { title: 'プロフィール概要' },
    gameActivity: {
      title: 'ゲーム活動',
      empty: 'ゲームを始めると、最近の活動がここに表示されます。'
    },
    progress: {
      levelLabel: 'レベル {{level}}',
      recentMastery: '最近の習得',
      emptyMastery: 'いくつか文字をつかまえると、習得列が開きます。'
    },
    quest: {
      dailyGoal: '毎日の目標',
      minutesPerDay: '分/日',
      minutesPerDayValue: '{{minutes}} 分 / 日'
    },
    reminders: { title: 'リマインダー' },
    cta: {
      letterRiver: '文字の川',
      startLetters: '遊びながら文字の学習を始める',
      showAllModes: 'すべてのモードを表示'
    },
    footer: {
      syncNotice: '進捗はクラウドアカウントと自動的に同期されます。',
      privacyPolicy: 'プライバシーポリシー'
    }
  },
  dailyReview: {
    title: '毎日の復習',
    allCaughtUp: 'すべて完了！',
    checkBackTomorrow: 'よくできました。また明日戻ってきましょう。',
    lettersDue_one: '{{count}} 文字を復習',
    lettersDue_other: '{{count}} 文字を復習',
    wordsDue_one: '{{count}} 語を練習',
    wordsDue_other: '{{count}} 語を練習',
    focusOn: '集中する文字: {{symbol}}（{{name}}）'
  },
  streak: {
    startJourney: '旅を始めよう！',
    greatStart: 'いいスタート！その調子',
    buildingMomentum: '勢いがついてきました！',
    onFire: '絶好調です！',
    incredibleDedication: 'すばらしい継続力です！',
    legendaryCommitment: '伝説級の継続です！',
    todayComplete: '今日: 完了',
    todayNotYet: '今日: まだ',
    daysUntilMilestone_one: '{{label}}まであと{{count}}日！',
    daysUntilMilestone_other: '{{label}}まであと{{count}}日！',
    repair: '連続記録を修復（星20個）',
    restoreTo: '{{count}}日に復元',
    personalBest: '自己ベスト: {{count}}日',
    freezeAvailable_one: '連続記録フリーズが{{count}}個あります',
    freezeAvailable_other: '連続記録フリーズが{{count}}個あります'
  },
  bridgeBuilder: {
    sections: {
      foundations: { title: '基礎' },
      daily_life: { title: '日常生活' },
      people_social: { title: '人と社会生活' },
      meaning_builders: { title: '意味の組み立て' },
      cafe_talk: { title: 'カフェ会話' }
    },
    vocabJourney: {
      title: '語彙の旅',
      startPath: '学習ルートを始めよう',
      noPacks: '利用できるパックはまだありません。',
      allPacks: 'すべてのパック',
      currentPack: '現在のパック',
      currentGoal: '現在の目標: {{goal}}',
      learnEverydayWords: '日常の言葉を{{count}}語学ぶ',
      tapForPackDetails: 'タップしてパックの詳細を見る',
      openDetailsFor: '{{title}}の詳細を開く',
      packDetails: 'パックの詳細',
      closePackDetails: 'パックの詳細を閉じる',
      savePack: 'パックを保存',
      continueLearningWords: '新しい言葉の学習を続けましょう。',
      recommendedNext: 'おすすめの次のステップ',
      moreWaysToLearn: 'ほかの学び方',
      optionLoosePlanksTitle: '強化 — ルーズプランク',
      optionLoosePlanksSubtitle: '集中練習で定着させましょう。',
      optionReviewTitle: '復習 — 今日の復習',
      optionReviewSubtitle: '記憶に残すために言葉を復習します。',
      optionDeepScriptTitle: 'チャレンジ — ディープスクリプト',
      optionDeepScriptSubtitle: '書くことと思い出すことで理解を試します。',
      optionReadTitle: '読む — カフェ会話',
      optionReadSubtitle: '実際の会話の中で言葉を見てみましょう。',
      todaysReviewWords: '今日の復習 — {{count}}語',
      keepWordsStrong: '言葉をしっかり保ちましょう。',
      completePackToUnlockReview: 'パックを完了すると復習が開きます。',
      readInContextTitle: '文脈で読む — カフェ会話',
      readInContextLockedSubtitle: 'このパックの後に開きます。',
      missingPackContent: 'このパックの内容は、選択した練習言語ではまだ利用できません。',
      loadingWords: '言葉を読み込み中...',
      packLearningProgress: 'パック学習の進捗',
      currentSectionProgress: '{{section}} · {{percent}}% 完了',
      statusOpenPath: '開いている道',
      statusLocked: 'ロック中',
      statusComplete: '完了',
      statusCurrent: '現在',
      stageNotStarted: '未開始',
      stageFirstLook: '最初の確認',
      stageMeaning: '意味',
      stageReview: '復習',
      stageChallenge: 'チャレンジ',
      stageReadyForChallenge: 'チャレンジ準備完了',
      stageStrengtheningMemory: '記憶を強化中',
      stageLearningMeanings: '意味を学習中',
      stageNewPack: '新しいパック',
      actionBridgeTitle: '語彙ビルダー',
      actionBridgeSubtitle: '言葉、音、意味を初めて見るのに最適です。',
      actionStartBridge: '開始: 語彙ビルダー',
      actionContinueBridge: '続ける: 語彙ビルダー',
      actionLoosePlanksTitle: '強化 — ルーズプランク',
      actionLoosePlanksSubtitle: '集中練習で定着させましょう。',
      actionContinueLoosePlanks: '続ける: ルーズプランク',
      actionDeepScriptTitle: 'チャレンジ — ディープスクリプト',
      actionDeepScriptSubtitle: '書くことと思い出すことで理解を試します。',
      actionContinueDeepScript: '続ける: ディープスクリプト',
      actionReviewTitle: '復習',
      actionReviewSubtitle: 'これらの言葉を忘れないようにしましょう。',
      actionReviewPack: 'このパックを復習'
    }
  },
  packs: {
    greetings_01: {
      title: 'あいさつ',
      description: 'こんにちは、ありがとう、基本的な礼儀'
    },
    pronouns_01: {
      title: '代名詞',
      description: '私、あなた、基本的な代名詞'
    },
    pronouns_02: {
      title: '代名詞 2',
      description: '彼、彼女、私たち、彼ら'
    },
    family_01: {
      title: '家族',
      description: 'お母さん、お父さん、家族、家'
    },
    family_02: {
      title: '家族 2',
      description: '友だち、子ども、親、近所の人など'
    },
    food_01: {
      title: '食べ物と飲み物',
      description: 'パン、水、コーヒーなど'
    },
    food_02: {
      title: '食べ物と飲み物 2',
      description: '食べ物、水、コーヒー'
    },
    adjectives_01: {
      title: '形容詞',
      description: 'よい、大きい、小さい、美しい'
    },
    adjectives_02: {
      title: '形容詞 2',
      description: 'すばらしい、親切な、美しい、悪いなど'
    },
    adjectives_03: {
      title: '形容詞 3',
      description: 'みにくい、不思議な'
    },
    numbers_01: {
      title: '数字',
      description: '1から5まで数える'
    },
    colors_01: {
      title: '色',
      description: '赤、青、緑など'
    },
    everyday_objects_01: {
      title: '日常の物',
      description: '本、電話、テーブル、ドア'
    },
    everyday_objects_02: {
      title: '日常の物 2',
      description: '本、電話、物'
    }
  }
};
