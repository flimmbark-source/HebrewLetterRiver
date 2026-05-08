// Extra scenic-home translations for app languages that are supported by the
// language selector but were not covered by the first scenic-home pass.
// Also contains small overrides for contextual reading labels that should not
// imply every pack belongs to the Cafe Talk section.

const readContextLabels = {
  english: {
    optionReadTitle: 'Read in Context',
    optionReadSubtitle: 'Practice this pack in sentence context.',
    readInContextTitle: 'Read in Context',
    readInContextSubtitle: 'Practice this pack in sentence context.'
  },
  spanish: {
    optionReadTitle: 'Leer en contexto',
    optionReadSubtitle: 'Practica este paquete en contexto de frases.',
    readInContextTitle: 'Leer en contexto',
    readInContextSubtitle: 'Practica este paquete en contexto de frases.'
  },
  french: {
    optionReadTitle: 'Lire en contexte',
    optionReadSubtitle: 'Pratique ce pack dans un contexte de phrases.',
    readInContextTitle: 'Lire en contexte',
    readInContextSubtitle: 'Pratique ce pack dans un contexte de phrases.'
  },
  portuguese: {
    optionReadTitle: 'Ler em contexto',
    optionReadSubtitle: 'Pratique este pacote em contexto de frases.',
    readInContextTitle: 'Ler em contexto',
    readInContextSubtitle: 'Pratique este pacote em contexto de frases.'
  },
  hebrew: {
    optionReadTitle: 'קריאה בהקשר',
    optionReadSubtitle: 'תרגל את החבילה הזו בהקשר של משפטים.',
    readInContextTitle: 'קריאה בהקשר',
    readInContextSubtitle: 'תרגל את החבילה הזו בהקשר של משפטים.'
  },
  arabic: {
    optionReadTitle: 'اقرأ في السياق',
    optionReadSubtitle: 'تدرّب على هذه الحزمة داخل سياق الجمل.',
    readInContextTitle: 'اقرأ في السياق',
    readInContextSubtitle: 'تدرّب على هذه الحزمة داخل سياق الجمل.'
  },
  russian: {
    optionReadTitle: 'Читать в контексте',
    optionReadSubtitle: 'Практикуй этот набор в контексте предложений.',
    readInContextTitle: 'Читать в контексте',
    readInContextSubtitle: 'Практикуй этот набор в контексте предложений.'
  },
  japanese: {
    optionReadTitle: '文脈で読む',
    optionReadSubtitle: 'このパックを文の中で練習します。',
    readInContextTitle: '文脈で読む',
    readInContextSubtitle: 'このパックを文の中で練習します。'
  },
  mandarin: {
    optionReadTitle: '在语境中阅读',
    optionReadSubtitle: '在句子语境中练习这个词包。',
    readInContextTitle: '在语境中阅读',
    readInContextSubtitle: '在句子语境中练习这个词包。'
  },
  amharic: {
    optionReadTitle: 'በአውድ ውስጥ አንብብ',
    optionReadSubtitle: 'ይህን ጥቅል በአረፍተ ነገር አውድ ውስጥ ተለማመድ።',
    readInContextTitle: 'በአውድ ውስጥ አንብብ',
    readInContextSubtitle: 'ይህን ጥቅል በአረፍተ ነገር አውድ ውስጥ ተለማመድ።'
  },
  hindi: {
    optionReadTitle: 'संदर्भ में पढ़ें',
    optionReadSubtitle: 'इस पैक का वाक्यों के संदर्भ में अभ्यास करें।',
    readInContextTitle: 'संदर्भ में पढ़ें',
    readInContextSubtitle: 'इस पैक का वाक्यों के संदर्भ में अभ्यास करें।'
  },
  bengali: {
    optionReadTitle: 'প্রসঙ্গে পড়ো',
    optionReadSubtitle: 'এই প্যাকটি বাক্যের প্রসঙ্গে অনুশীলন করো।',
    readInContextTitle: 'প্রসঙ্গে পড়ো',
    readInContextSubtitle: 'এই প্যাকটি বাক্যের প্রসঙ্গে অনুশীলন করো।'
  }
};

function bridgeReadContext(languageId) {
  return {
    bridgeBuilder: {
      vocabJourney: readContextLabels[languageId]
    }
  };
}

function scenicHome(overrides) {
  return { home: { scenic: overrides } };
}

export const extraScenicHomeSupplementalDictionaries = {
  english: bridgeReadContext('english'),
  spanish: bridgeReadContext('spanish'),
  french: bridgeReadContext('french'),
  portuguese: bridgeReadContext('portuguese'),
  hebrew: bridgeReadContext('hebrew'),
  arabic: {
    ...bridgeReadContext('arabic'),
    ...scenicHome({
      brand: 'نهر الحروف', appLanguage: 'التطبيق', practiceLanguage: 'تتعلّم', languageSettings: 'إعدادات اللغة', greeting: 'صباح الخير أيها المستكشف!', subtitle: 'حافظ على تدفق نهرك.', continueTitle: 'تابع رحلتك', todayPlanTitle: 'خطة اليوم', pathTitle: 'مسار تعلّمك', pathAria: 'من الحروف إلى الكلمات إلى Deep Script ثم المحادثة', selected: 'محدد', complete: 'مكتمل', inProgress: 'قيد التقدم', upcoming: 'قادم', stageAria: 'اعرض تقدم {{label}}، {{status}}', profileAria: 'تعديل الملف الشخصي', streakAria: 'سلسلة {{count}} يوم', itemsReady: '{{count}} عناصر جاهزة للمراجعة', statsAria: 'ملخص التقدم اليومي', dailyReview: 'المراجعة اليومية', streak: 'السلسلة', dailyGoal: 'الهدف اليومي', readyValue: '{{count}} جاهزة', daysValue: '{{count}} أيام', todayValue: '{{completed}}/{{total}} اليوم',
      stages: { letters: 'الحروف', words: 'الكلمات', deepScript: 'Deep Script', conversation: 'المحادثة' },
      letters: { title: 'الحروف الأولى', subtitle: 'تم تعلّم {{learned}}/{{total}} حرفًا من {{language}}', detail: 'التالي: تدرّب على {{symbols}}', cta: 'تابع نهر الحروف', planTitle: 'تدريب نهر الحروف', planSubtitle: 'أساسيات الأبجدية' },
      words: { title: 'بناء الجسر', subtitle: 'الحزمة 3 · تم تعلّم {{learned}}/{{total}} عنصرًا من {{language}}', detail: 'التالي: قوّ كلماتك', cta: 'تابع التعلّم', planTitle: 'بناء الجسر', planSubtitle: 'قوّ مجموعة كلماتك' },
      deepScript: { title: 'Deep Script', subtitle: 'جولة مفردات في {{language}}', detail: 'التالي: تابع جولتك', cta: 'استئناف Deep Script', planTitle: 'استئناف Deep Script', planSubtitle: 'تابع جولة المفردات', lockedSubtitle: 'يفتح بعد الكلمات' },
      conversation: { title: 'تدريب المحادثة', subtitle: 'محادثة في {{language}}', detail: 'تدرّب على الدورين في السياق', cta: 'تابع المحادثة', planTitle: 'تدريب المحادثة', planSubtitle: 'تدرّب على الدورين', lockedSubtitle: 'يفتح بعد Deep Script', reviewTitle: 'مراجعة القراءة', reviewSubtitle: 'راجع القراءة في السياق' }
    })
  },
  russian: {
    ...bridgeReadContext('russian'),
    ...scenicHome({
      brand: 'Река букв', appLanguage: 'Приложение', practiceLanguage: 'Изучаю', languageSettings: 'Настройки языка', greeting: 'Доброе утро, исследователь!', subtitle: 'Пусть твоя река продолжает течь.', continueTitle: 'Продолжить путь', todayPlanTitle: 'План на сегодня', pathTitle: 'Твой путь обучения', pathAria: 'От букв к словам, Deep Script и разговору', selected: 'Выбрано', complete: 'Готово', inProgress: 'В процессе', upcoming: 'Скоро', stageAria: 'Показать прогресс {{label}}, {{status}}', profileAria: 'Редактировать профиль', streakAria: 'Серия {{count}} дней', itemsReady: '{{count}} элементов готовы к повторению', statsAria: 'Сводка дневного прогресса', dailyReview: 'Ежедневное повторение', streak: 'Серия', dailyGoal: 'Цель дня', readyValue: '{{count}} готовы', daysValue: '{{count}} дней', todayValue: '{{completed}}/{{total}} сегодня',
      stages: { letters: 'Буквы', words: 'Слова', deepScript: 'Deep Script', conversation: 'Разговор' },
      letters: { title: 'Первые буквы', subtitle: 'Выучено {{learned}}/{{total}} букв {{language}}', detail: 'Далее: практика {{symbols}}', cta: 'Продолжить Реку букв', planTitle: 'Практика Реки букв', planSubtitle: 'Основы алфавита' },
      words: { title: 'Строитель мостов', subtitle: 'Набор 3 · выучено {{learned}}/{{total}} элементов {{language}}', detail: 'Далее: укрепи словарь', cta: 'Продолжить обучение', planTitle: 'Строитель мостов', planSubtitle: 'Укрепи набор слов' },
      deepScript: { title: 'Deep Script', subtitle: 'Словарный забег на {{language}}', detail: 'Далее: продолжи забег', cta: 'Возобновить Deep Script', planTitle: 'Возобновить Deep Script', planSubtitle: 'Продолжи словарный забег', lockedSubtitle: 'Откроется после слов' },
      conversation: { title: 'Разговорная практика', subtitle: 'Разговор на {{language}}', detail: 'Практикуй обе роли в контексте', cta: 'Продолжить разговор', planTitle: 'Разговорная практика', planSubtitle: 'Практикуй обе роли', lockedSubtitle: 'Откроется после Deep Script', reviewTitle: 'Повторение чтения', reviewSubtitle: 'Вернуться к чтению в контексте' }
    })
  },
  japanese: {
    ...bridgeReadContext('japanese'),
    ...scenicHome({
      brand: 'レターリバー', appLanguage: 'アプリ', practiceLanguage: '学習中', languageSettings: '言語設定', greeting: 'おはよう、探検家！', subtitle: 'あなたの川を流し続けよう。', continueTitle: '旅を続ける', todayPlanTitle: '今日のプラン', pathTitle: '学習の道のり', pathAria: '文字から単語、Deep Script、会話へ', selected: '選択中', complete: '完了', inProgress: '進行中', upcoming: '今後', stageAria: '{{label}} の進捗を表示、{{status}}', profileAria: 'プロフィールを編集', streakAria: '{{count}}日連続', itemsReady: '{{count}}個が復習待ち', statsAria: '毎日の進捗概要', dailyReview: '毎日の復習', streak: '連続記録', dailyGoal: '今日の目標', readyValue: '{{count}}個準備完了', daysValue: '{{count}}日', todayValue: '今日 {{completed}}/{{total}}',
      stages: { letters: '文字', words: '単語', deepScript: 'Deep Script', conversation: '会話' },
      letters: { title: '最初の文字', subtitle: '{{language}}の文字 {{learned}}/{{total}} を学習済み', detail: '次: {{symbols}} を練習', cta: 'レターリバーを続ける', planTitle: 'レターリバー練習', planSubtitle: 'アルファベットの基礎' },
      words: { title: 'ブリッジビルダー', subtitle: 'パック3 · {{language}}の項目 {{learned}}/{{total}} を学習済み', detail: '次: 単語セットを強化', cta: '学習を続ける', planTitle: 'ブリッジビルダー', planSubtitle: '単語セットを強化' },
      deepScript: { title: 'Deep Script', subtitle: '{{language}}の語彙ラン', detail: '次: ランを続ける', cta: 'Deep Scriptを再開', planTitle: 'Deep Scriptを再開', planSubtitle: '語彙ランを続ける', lockedSubtitle: '単語の後に解放' },
      conversation: { title: '会話練習', subtitle: '{{language}}の会話', detail: '文脈の中で両方の役を練習', cta: '会話を続ける', planTitle: '会話練習', planSubtitle: '両方の役を練習', lockedSubtitle: 'Deep Scriptの後に解放', reviewTitle: '読解復習', reviewSubtitle: '文脈読解を復習' }
    })
  },
  mandarin: {
    ...bridgeReadContext('mandarin'),
    ...scenicHome({
      brand: '字母之河', appLanguage: '应用', practiceLanguage: '正在学', languageSettings: '语言设置', greeting: '早上好，探险家！', subtitle: '让你的河流继续流动。', continueTitle: '继续你的旅程', todayPlanTitle: '今日计划', pathTitle: '你的学习路径', pathAria: '从字母到词汇，到 Deep Script，再到对话', selected: '已选择', complete: '已完成', inProgress: '进行中', upcoming: '即将开始', stageAria: '显示 {{label}} 进度，{{status}}', profileAria: '编辑个人资料', streakAria: '{{count}} 天连续学习', itemsReady: '{{count}} 个项目待复习', statsAria: '每日进度摘要', dailyReview: '每日复习', streak: '连续记录', dailyGoal: '每日目标', readyValue: '{{count}} 个待复习', daysValue: '{{count}} 天', todayValue: '今天 {{completed}}/{{total}}',
      stages: { letters: '字母', words: '词汇', deepScript: 'Deep Script', conversation: '对话' },
      letters: { title: '最初的字母', subtitle: '已学习 {{learned}}/{{total}} 个 {{language}} 字母', detail: '下一步：练习 {{symbols}}', cta: '继续字母之河', planTitle: '字母之河练习', planSubtitle: '字母基础' },
      words: { title: '桥梁建造者', subtitle: '第 3 包 · 已学习 {{learned}}/{{total}} 个 {{language}} 项目', detail: '下一步：巩固你的词汇', cta: '继续学习', planTitle: '桥梁建造者', planSubtitle: '巩固你的词汇组' },
      deepScript: { title: 'Deep Script', subtitle: '{{language}} 词汇挑战', detail: '下一步：继续挑战', cta: '继续 Deep Script', planTitle: '继续 Deep Script', planSubtitle: '继续词汇挑战', lockedSubtitle: '学完词汇后解锁' },
      conversation: { title: '对话练习', subtitle: '{{language}} 对话', detail: '在语境中练习两个角色', cta: '继续对话', planTitle: '对话练习', planSubtitle: '练习两个角色', lockedSubtitle: 'Deep Script 后解锁', reviewTitle: '阅读复习', reviewSubtitle: '复习语境阅读' }
    })
  },
  amharic: {
    ...bridgeReadContext('amharic'),
    ...scenicHome({
      brand: 'የፊደል ወንዝ', appLanguage: 'መተግበሪያ', practiceLanguage: 'እየተማርክ', languageSettings: 'የቋንቋ ቅንብሮች', greeting: 'እንደምን አደርክ፣ አሳሽ!', subtitle: 'ወንዝህ እንዲፈስ አድርግ።', continueTitle: 'ጉዞህን ቀጥል', todayPlanTitle: 'የዛሬ እቅድ', pathTitle: 'የመማሪያ መንገድህ', pathAria: 'ከፊደላት ወደ ቃላት፣ ወደ Deep Script፣ ወደ ውይይት', selected: 'ተመርጧል', complete: 'ተጠናቋል', inProgress: 'በሂደት ላይ', upcoming: 'ቀጣይ', stageAria: '{{label}} እድገት አሳይ፣ {{status}}', profileAria: 'መገለጫ አርትዕ', streakAria: '{{count}} ቀን ተከታታይ', itemsReady: '{{count}} ነገሮች ለክለሳ ዝግጁ', statsAria: 'የዕለት እድገት ማጠቃለያ', dailyReview: 'የዕለት ክለሳ', streak: 'ተከታታይ', dailyGoal: 'የዕለት ግብ', readyValue: '{{count}} ዝግጁ', daysValue: '{{count}} ቀናት', todayValue: '{{completed}}/{{total}} ዛሬ',
      stages: { letters: 'ፊደላት', words: 'ቃላት', deepScript: 'Deep Script', conversation: 'ውይይት' },
      letters: { title: 'መጀመሪያ ፊደላት', subtitle: '{{learned}}/{{total}} የ{{language}} ፊደላት ተማሩ', detail: 'ቀጣይ፦ {{symbols}} ተለማመድ', cta: 'የፊደል ወንዝን ቀጥል', planTitle: 'የፊደል ወንዝ ልምምድ', planSubtitle: 'የፊደል መሠረቶች' },
      words: { title: 'ድልድይ ገንቢ', subtitle: 'ጥቅል 3 · {{learned}}/{{total}} የ{{language}} ነገሮች ተማሩ', detail: 'ቀጣይ፦ ቃላትህን አጠናክር', cta: 'መማርን ቀጥል', planTitle: 'ድልድይ ገንቢ', planSubtitle: 'የቃላት ስብስብህን አጠናክር' },
      deepScript: { title: 'Deep Script', subtitle: 'የ{{language}} ቃላት ጉዞ', detail: 'ቀጣይ፦ ጉዞህን ቀጥል', cta: 'Deep Script ቀጥል', planTitle: 'Deep Script ቀጥል', planSubtitle: 'የቃላት ጉዞህን ቀጥል', lockedSubtitle: 'ከቃላት በኋላ ይከፈታል' },
      conversation: { title: 'የውይይት ልምምድ', subtitle: 'የ{{language}} ውይይት', detail: 'ሁለቱንም ሚናዎች በአውድ ውስጥ ተለማመድ', cta: 'ውይይትን ቀጥል', planTitle: 'የውይይት ልምምድ', planSubtitle: 'ሁለቱንም ሚናዎች ተለማመድ', lockedSubtitle: 'ከDeep Script በኋላ ይከፈታል', reviewTitle: 'የንባብ ክለሳ', reviewSubtitle: 'በአውድ ውስጥ ንባብን ክለስ' }
    })
  },
  hindi: {
    ...bridgeReadContext('hindi'),
    ...scenicHome({
      brand: 'लेटर रिवर', appLanguage: 'ऐप', practiceLanguage: 'सीख रहे हैं', languageSettings: 'भाषा सेटिंग्स', greeting: 'सुप्रभात, अन्वेषक!', subtitle: 'अपनी नदी को बहते रहने दें।', continueTitle: 'अपनी यात्रा जारी रखें', todayPlanTitle: 'आज की योजना', pathTitle: 'आपका सीखने का मार्ग', pathAria: 'अक्षरों से शब्दों तक, Deep Script तक, फिर बातचीत तक', selected: 'चयनित', complete: 'पूर्ण', inProgress: 'प्रगति में', upcoming: 'आने वाला', stageAria: '{{label}} की प्रगति दिखाएँ, {{status}}', profileAria: 'प्रोफ़ाइल संपादित करें', streakAria: '{{count}} दिन की streak', itemsReady: '{{count}} आइटम समीक्षा के लिए तैयार', statsAria: 'दैनिक प्रगति सारांश', dailyReview: 'दैनिक समीक्षा', streak: 'Streak', dailyGoal: 'दैनिक लक्ष्य', readyValue: '{{count}} तैयार', daysValue: '{{count}} दिन', todayValue: 'आज {{completed}}/{{total}}',
      stages: { letters: 'अक्षर', words: 'शब्द', deepScript: 'Deep Script', conversation: 'बातचीत' },
      letters: { title: 'पहले अक्षर', subtitle: '{{language}} के {{learned}}/{{total}} अक्षर सीखे गए', detail: 'अगला: {{symbols}} का अभ्यास', cta: 'लेटर रिवर जारी रखें', planTitle: 'लेटर रिवर अभ्यास', planSubtitle: 'वर्णमाला की नींव' },
      words: { title: 'ब्रिज बिल्डर', subtitle: 'पैक 3 · {{language}} के {{learned}}/{{total}} आइटम सीखे गए', detail: 'अगला: अपने शब्दों को मजबूत करें', cta: 'सीखना जारी रखें', planTitle: 'ब्रिज बिल्डर', planSubtitle: 'अपने शब्द समूह को मजबूत करें' },
      deepScript: { title: 'Deep Script', subtitle: '{{language}} शब्दावली रन', detail: 'अगला: अपना रन जारी रखें', cta: 'Deep Script फिर शुरू करें', planTitle: 'Deep Script फिर शुरू करें', planSubtitle: 'अपना शब्दावली रन जारी रखें', lockedSubtitle: 'शब्दों के बाद खुलता है' },
      conversation: { title: 'बातचीत अभ्यास', subtitle: '{{language}} बातचीत', detail: 'संदर्भ में दोनों भूमिकाओं का अभ्यास करें', cta: 'बातचीत जारी रखें', planTitle: 'बातचीत अभ्यास', planSubtitle: 'दोनों भूमिकाओं का अभ्यास करें', lockedSubtitle: 'Deep Script के बाद खुलता है', reviewTitle: 'पठन समीक्षा', reviewSubtitle: 'संदर्भ पठन दोहराएँ' }
    })
  },
  bengali: {
    ...bridgeReadContext('bengali'),
    ...scenicHome({
      brand: 'লেটার রিভার', appLanguage: 'অ্যাপ', practiceLanguage: 'শিখছ', languageSettings: 'ভাষা সেটিংস', greeting: 'সুপ্রভাত, অভিযাত্রী!', subtitle: 'তোমার নদীকে প্রবাহিত রাখো।', continueTitle: 'তোমার যাত্রা চালিয়ে যাও', todayPlanTitle: 'আজকের পরিকল্পনা', pathTitle: 'তোমার শেখার পথ', pathAria: 'অক্ষর থেকে শব্দ, Deep Script, তারপর কথোপকথন', selected: 'নির্বাচিত', complete: 'সম্পূর্ণ', inProgress: 'চলছে', upcoming: 'আসছে', stageAria: '{{label}} অগ্রগতি দেখাও, {{status}}', profileAria: 'প্রোফাইল সম্পাদনা', streakAria: '{{count}} দিনের ধারাবাহিকতা', itemsReady: '{{count}}টি আইটেম পুনরাবৃত্তির জন্য প্রস্তুত', statsAria: 'দৈনিক অগ্রগতির সারাংশ', dailyReview: 'দৈনিক পুনরাবৃত্তি', streak: 'ধারাবাহিকতা', dailyGoal: 'দৈনিক লক্ষ্য', readyValue: '{{count}} প্রস্তুত', daysValue: '{{count}} দিন', todayValue: 'আজ {{completed}}/{{total}}',
      stages: { letters: 'অক্ষর', words: 'শব্দ', deepScript: 'Deep Script', conversation: 'কথোপকথন' },
      letters: { title: 'প্রথম অক্ষর', subtitle: '{{language}}-এর {{learned}}/{{total}} অক্ষর শেখা হয়েছে', detail: 'পরবর্তী: {{symbols}} অনুশীলন করো', cta: 'লেটার রিভার চালিয়ে যাও', planTitle: 'লেটার রিভার অনুশীলন', planSubtitle: 'বর্ণমালার ভিত্তি' },
      words: { title: 'ব্রিজ বিল্ডার', subtitle: 'প্যাক ৩ · {{language}}-এর {{learned}}/{{total}} আইটেম শেখা হয়েছে', detail: 'পরবর্তী: তোমার শব্দগুলো শক্ত করো', cta: 'শেখা চালিয়ে যাও', planTitle: 'ব্রিজ বিল্ডার', planSubtitle: 'তোমার শব্দ সেট শক্ত করো' },
      deepScript: { title: 'Deep Script', subtitle: '{{language}} শব্দভান্ডার রান', detail: 'পরবর্তী: তোমার রান চালিয়ে যাও', cta: 'Deep Script আবার শুরু করো', planTitle: 'Deep Script আবার শুরু করো', planSubtitle: 'তোমার শব্দভান্ডার রান চালিয়ে যাও', lockedSubtitle: 'শব্দের পরে খুলবে' },
      conversation: { title: 'কথোপকথন অনুশীলন', subtitle: '{{language}} কথোপকথন', detail: 'প্রসঙ্গে দুই ভূমিকাই অনুশীলন করো', cta: 'কথোপকথন চালিয়ে যাও', planTitle: 'কথোপকথন অনুশীলন', planSubtitle: 'দুই ভূমিকাই অনুশীলন করো', lockedSubtitle: 'Deep Script-এর পরে খুলবে', reviewTitle: 'পঠন পুনরাবৃত্তি', reviewSubtitle: 'প্রসঙ্গভিত্তিক পঠন আবার করো' }
    })
  }
};
