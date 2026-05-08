// Concise and module-informed home copy overrides.
// These override older scenic-home strings that were too generic or implied
// progress systems the modules do not actually use.

function homeCopy({
  conversationTitle,
  chooseLetters,
  letterProgress,
  wordsSeen,
  deepScriptSubtitle,
  deepScriptDetail,
  conversationSubtitle,
  conversationDetail,
}) {
  return {
    home: {
      scenic: {
        letters: {
          title: 'Letter River',
          chooseLetters,
          progressSummary: letterProgress,
          planTitle: 'Letter River',
          practiceNext: chooseLetters
        },
        words: {
          wordsSeen
        },
        deepScript: {
          compactSubtitle: deepScriptSubtitle,
          compactDetail: deepScriptDetail,
          challengePackWords: deepScriptDetail
        },
        conversation: {
          title: conversationTitle,
          contextSubtitle: conversationSubtitle,
          contextDetail: conversationDetail
        }
      }
    }
  };
}

export const scenicHomeConversationLabelOverrides = {
  english: homeCopy({
    conversationTitle: 'Conversation',
    chooseLetters: 'Choose letters to practice',
    letterProgress: 'Seen {{seen}} · Practiced {{practiced}} · Mastered {{mastered}}',
    wordsSeen: '{{seen}} of {{total}} words seen',
    deepScriptSubtitle: 'Pack floors and random runs',
    deepScriptDetail: 'Reinforce letters, words, and reading',
    conversationSubtitle: 'Practice words in context',
    conversationDetail: 'Short dialogues and sentences'
  }),
  spanish: homeCopy({
    conversationTitle: 'Conversación',
    chooseLetters: 'Elige letras para practicar',
    letterProgress: 'Vistas {{seen}} · Practicadas {{practiced}} · Dominadas {{mastered}}',
    wordsSeen: '{{seen}} de {{total}} palabras vistas',
    deepScriptSubtitle: 'Pisos de paquetes y recorridos aleatorios',
    deepScriptDetail: 'Refuerza letras, palabras y lectura',
    conversationSubtitle: 'Practica palabras en contexto',
    conversationDetail: 'Diálogos cortos y frases'
  }),
  french: homeCopy({
    conversationTitle: 'Conversation',
    chooseLetters: 'Choisis les lettres à pratiquer',
    letterProgress: 'Vues {{seen}} · Pratiquées {{practiced}} · Maîtrisées {{mastered}}',
    wordsSeen: '{{seen}} mots vus sur {{total}}',
    deepScriptSubtitle: 'Étages de packs et parcours aléatoires',
    deepScriptDetail: 'Renforce les lettres, les mots et la lecture',
    conversationSubtitle: 'Pratique les mots en contexte',
    conversationDetail: 'Dialogues courts et phrases'
  }),
  portuguese: homeCopy({
    conversationTitle: 'Conversação',
    chooseLetters: 'Escolha letras para praticar',
    letterProgress: 'Vistas {{seen}} · Praticadas {{practiced}} · Dominadas {{mastered}}',
    wordsSeen: '{{seen}} de {{total}} palavras vistas',
    deepScriptSubtitle: 'Andares de pacote e corridas aleatórias',
    deepScriptDetail: 'Reforce letras, palavras e leitura',
    conversationSubtitle: 'Pratique palavras em contexto',
    conversationDetail: 'Diálogos curtos e frases'
  }),
  hebrew: homeCopy({
    conversationTitle: 'שיחה',
    chooseLetters: 'בחר אותיות לתרגול',
    letterProgress: 'נצפו {{seen}} · תורגלו {{practiced}} · נשלחו {{mastered}}',
    wordsSeen: '{{seen}} מתוך {{total}} מילים נצפו',
    deepScriptSubtitle: 'קומות חבילה וריצות אקראיות',
    deepScriptDetail: 'חיזוק אותיות, מילים וקריאה',
    conversationSubtitle: 'תרגול מילים בהקשר',
    conversationDetail: 'דיאלוגים קצרים ומשפטים'
  }),
  arabic: homeCopy({
    conversationTitle: 'المحادثة',
    chooseLetters: 'اختر الحروف للتدرّب',
    letterProgress: 'شوهدت {{seen}} · تدرّبت {{practiced}} · أُتقنت {{mastered}}',
    wordsSeen: '{{seen}} من {{total}} كلمات شوهدت',
    deepScriptSubtitle: 'طوابق الحزم والجولات العشوائية',
    deepScriptDetail: 'عزّز الحروف والكلمات والقراءة',
    conversationSubtitle: 'تدرّب على الكلمات في السياق',
    conversationDetail: 'حوارات قصيرة وجمل'
  }),
  russian: homeCopy({
    conversationTitle: 'Разговор',
    chooseLetters: 'Выбери буквы для практики',
    letterProgress: 'Видел {{seen}} · Практиковал {{practiced}} · Освоил {{mastered}}',
    wordsSeen: '{{seen}} из {{total}} слов просмотрено',
    deepScriptSubtitle: 'Этажи наборов и случайные забеги',
    deepScriptDetail: 'Закрепляй буквы, слова и чтение',
    conversationSubtitle: 'Практикуй слова в контексте',
    conversationDetail: 'Короткие диалоги и предложения'
  }),
  japanese: homeCopy({
    conversationTitle: '会話',
    chooseLetters: '練習する文字を選ぶ',
    letterProgress: '見た {{seen}} · 練習 {{practiced}} · 習得 {{mastered}}',
    wordsSeen: '{{total}}語中{{seen}}語を見ました',
    deepScriptSubtitle: 'パック階層とランダムラン',
    deepScriptDetail: '文字・単語・読解を強化',
    conversationSubtitle: '文脈の中で単語を練習',
    conversationDetail: '短い会話と文'
  }),
  mandarin: homeCopy({
    conversationTitle: '对话',
    chooseLetters: '选择要练习的字母',
    letterProgress: '见过 {{seen}} · 练习 {{practiced}} · 掌握 {{mastered}}',
    wordsSeen: '已见过 {{seen}} / {{total}} 个词',
    deepScriptSubtitle: '词包楼层和随机挑战',
    deepScriptDetail: '巩固字母、词汇和阅读',
    conversationSubtitle: '在语境中练习词汇',
    conversationDetail: '短对话和句子'
  }),
  amharic: homeCopy({
    conversationTitle: 'ውይይት',
    chooseLetters: 'ለመለማመድ ፊደላትን ምረጥ',
    letterProgress: 'የታዩ {{seen}} · የተለማመዱ {{practiced}} · የተካኑ {{mastered}}',
    wordsSeen: '{{seen}} ከ {{total}} ቃላት ታይተዋል',
    deepScriptSubtitle: 'የጥቅል ፎቆች እና የዘፈቀደ ጉዞዎች',
    deepScriptDetail: 'ፊደላትን፣ ቃላትን እና ንባብን አጠናክር',
    conversationSubtitle: 'ቃላትን በአውድ ውስጥ ተለማመድ',
    conversationDetail: 'አጭር ውይይቶች እና አረፍተ ነገሮች'
  }),
  hindi: homeCopy({
    conversationTitle: 'बातचीत',
    chooseLetters: 'अभ्यास के लिए अक्षर चुनें',
    letterProgress: 'देखे {{seen}} · अभ्यास {{practiced}} · महारत {{mastered}}',
    wordsSeen: '{{total}} में से {{seen}} शब्द देखे गए',
    deepScriptSubtitle: 'पैक फ़्लोर और रैंडम रन',
    deepScriptDetail: 'अक्षर, शब्द और पढ़ना मजबूत करें',
    conversationSubtitle: 'संदर्भ में शब्दों का अभ्यास करें',
    conversationDetail: 'छोटे संवाद और वाक्य'
  }),
  bengali: homeCopy({
    conversationTitle: 'কথোপকথন',
    chooseLetters: 'অনুশীলনের জন্য অক্ষর বেছে নাও',
    letterProgress: 'দেখা {{seen}} · অনুশীলন {{practiced}} · আয়ত্ত {{mastered}}',
    wordsSeen: '{{total}}টির মধ্যে {{seen}}টি শব্দ দেখা হয়েছে',
    deepScriptSubtitle: 'প্যাক ফ্লোর এবং র‍্যান্ডম রান',
    deepScriptDetail: 'অক্ষর, শব্দ এবং পড়া শক্ত করো',
    conversationSubtitle: 'প্রসঙ্গে শব্দ অনুশীলন করো',
    conversationDetail: 'ছোট কথোপকথন এবং বাক্য'
  })
};
