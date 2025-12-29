/**
 * Mandarin Cafe Talk reading texts
 * Conversational vocabulary organized by theme
 */

import { createReadingText } from '../common/helpers.js';
import { CAFE_TALK_CONVERSATION_GLUE, buildCafeTalkTranslations } from '../common/cafeTalkTranslations.js';

export const mandarinCafeTalkTexts = [
  // Conversation Glue (25 words)
  createReadingText({
    id: 'cafeTalk.conversationGlue',
    title: {
      en: 'Conversation Glue (25)',
      es: 'Conectores de Conversación (25)',
      fr: 'Mots de Liaison (25)',
      he: 'דבק שיחה (25)'
    },
    subtitle: {
      en: 'Essential discourse markers and connectors',
      es: 'Marcadores y conectores esenciales',
      fr: 'Marqueurs et connecteurs essentiels',
      he: 'סמנים וקישורים חיוניים'
    },
    practiceLanguage: 'mandarin',
    tokens: [
      { type: 'word', text: 'so', id: 'so' },
      { type: 'word', text: 'but', id: 'but' },
      { type: 'word', text: 'well', id: 'well' },
      { type: 'word', text: 'actually', id: 'actually' },
      { type: 'word', text: 'maybe', id: 'maybe' },
      { type: 'word', text: 'probably', id: 'probably' },
      { type: 'word', text: 'basically', id: 'basically' },
      { type: 'word', text: 'anyway', id: 'anyway' },
      { type: 'word', text: 'also', id: 'also' },
      { type: 'word', text: 'too', id: 'too' },
      { type: 'word', text: 'either', id: 'either' },
      { type: 'word', text: 'neither', id: 'neither' },
      { type: 'word', text: 'however', id: 'however' },
      { type: 'word', text: 'therefore', id: 'therefore' },
      { type: 'word', text: 'meanwhile', id: 'meanwhile' },
      { type: 'word', text: 'besides', id: 'besides' },
      { type: 'word', text: 'instead', id: 'instead' },
      { type: 'word', text: 'otherwise', id: 'otherwise' },
      { type: 'word', text: 'still', id: 'still' },
      { type: 'word', text: 'yet', id: 'yet' },
      { type: 'word', text: 'just', id: 'just' },
      { type: 'word', text: 'even', id: 'even' },
      { type: 'word', text: 'already', id: 'already' },
      { type: 'word', text: 'almost', id: 'almost' },
      { type: 'word', text: 'quite', id: 'quite' },
      { type: 'punct', text: '.' }
    ],
    meaningKeys: {
      so: 'reading.meaning.so',
      but: 'reading.meaning.but',
      well: 'reading.meaning.well',
      actually: 'reading.meaning.actually',
      maybe: 'reading.meaning.maybe',
      probably: 'reading.meaning.probably',
      basically: 'reading.meaning.basically',
      anyway: 'reading.meaning.anyway',
      also: 'reading.meaning.also',
      too: 'reading.meaning.too',
      either: 'reading.meaning.either',
      neither: 'reading.meaning.neither',
      however: 'reading.meaning.however',
      therefore: 'reading.meaning.therefore',
      meanwhile: 'reading.meaning.meanwhile',
      besides: 'reading.meaning.besides',
      instead: 'reading.meaning.instead',
      otherwise: 'reading.meaning.otherwise',
      still: 'reading.meaning.still',
      yet: 'reading.meaning.yet',
      just: 'reading.meaning.just',
      even: 'reading.meaning.even',
      already: 'reading.meaning.already',
      almost: 'reading.meaning.almost',
      quite: 'reading.meaning.quite'
    },
    translations: buildCafeTalkTranslations(CAFE_TALK_CONVERSATION_GLUE)
  }),

  // Time Sequencing (20 words)
  createReadingText({
    id: 'cafeTalk.timeSequencing',
    title: { en: 'Time & Sequencing (20)', he: 'זמן ורצף (20)' },
    subtitle: { en: 'Words for expressing when things happen', he: 'מילים לביטוי מתי דברים קורים' },
    practiceLanguage: 'mandarin',
    tokens: [
      { type: 'word', text: 'now', id: 'now' },
      { type: 'word', text: 'then', id: 'then' },
      { type: 'word', text: 'when', id: 'when' },
      { type: 'word', text: 'before', id: 'before' },
      { type: 'word', text: 'after', id: 'after' },
      { type: 'word', text: 'during', id: 'during' },
      { type: 'word', text: 'while', id: 'while' },
      { type: 'word', text: 'until', id: 'until' },
      { type: 'word', text: 'since', id: 'since' },
      { type: 'word', text: 'today', id: 'today' },
      { type: 'word', text: 'yesterday', id: 'yesterday' },
      { type: 'word', text: 'tomorrow', id: 'tomorrow' },
      { type: 'word', text: 'soon', id: 'soon' },
      { type: 'word', text: 'later', id: 'later' },
      { type: 'word', text: 'early', id: 'early' },
      { type: 'word', text: 'late', id: 'late' },
      { type: 'word', text: 'always', id: 'always' },
      { type: 'word', text: 'never', id: 'never' },
      { type: 'word', text: 'sometimes', id: 'sometimes' },
      { type: 'word', text: 'often', id: 'often' },
      { type: 'punct', text: '.' }
    ],
    meaningKeys: {
      now: 'reading.meaning.now', then: 'reading.meaning.then', when: 'reading.meaning.when',
      before: 'reading.meaning.before', after: 'reading.meaning.after', during: 'reading.meaning.during',
      while: 'reading.meaning.while', until: 'reading.meaning.until', since: 'reading.meaning.since',
      today: 'reading.meaning.today', yesterday: 'reading.meaning.yesterday', tomorrow: 'reading.meaning.tomorrow',
      soon: 'reading.meaning.soon', later: 'reading.meaning.later', early: 'reading.meaning.early',
      late: 'reading.meaning.late', always: 'reading.meaning.always', never: 'reading.meaning.never',
      sometimes: 'reading.meaning.sometimes', often: 'reading.meaning.often'
    },
    translations: {
      en: {
        now: { canonical: 'now', variants: ['now'] },
        then: { canonical: 'then', variants: ['then'] },
        when: { canonical: 'when', variants: ['when'] },
        before: { canonical: 'before', variants: ['before'] },
        after: { canonical: 'after', variants: ['after'] },
        during: { canonical: 'during', variants: ['during'] },
        while: { canonical: 'while', variants: ['while'] },
        until: { canonical: 'until', variants: ['until', 'till'] },
        since: { canonical: 'since', variants: ['since'] },
        today: { canonical: 'today', variants: ['today'] },
        yesterday: { canonical: 'yesterday', variants: ['yesterday'] },
        tomorrow: { canonical: 'tomorrow', variants: ['tomorrow'] },
        soon: { canonical: 'soon', variants: ['soon'] },
        later: { canonical: 'later', variants: ['later'] },
        early: { canonical: 'early', variants: ['early'] },
        late: { canonical: 'late', variants: ['late'] },
        always: { canonical: 'always', variants: ['always'] },
        never: { canonical: 'never', variants: ['never'] },
        sometimes: { canonical: 'sometimes', variants: ['sometimes'] },
        often: { canonical: 'often', variants: ['often', 'frequently'] }
      }
    }
  }),

  // People Words (18 words)
  createReadingText({
    id: 'cafeTalk.peopleWords',
    title: { en: 'People Words (18)', he: 'מילות אנשים (18)' },
    subtitle: { en: 'Pronouns and references to people', he: 'כינויים והתייחסויות לאנשים' },
    practiceLanguage: 'mandarin',
    tokens: [
      { type: 'word', text: 'I', id: 'I' },
      { type: 'word', text: 'you', id: 'you' },
      { type: 'word', text: 'he', id: 'he' },
      { type: 'word', text: 'she', id: 'she' },
      { type: 'word', text: 'we', id: 'we' },
      { type: 'word', text: 'they', id: 'they' },
      { type: 'word', text: 'who', id: 'who' },
      { type: 'word', text: 'someone', id: 'someone' },
      { type: 'word', text: 'everyone', id: 'everyone' },
      { type: 'word', text: 'nobody', id: 'nobody' },
      { type: 'word', text: 'friend', id: 'friend' },
      { type: 'word', text: 'family', id: 'family' },
      { type: 'word', text: 'person', id: 'person' },
      { type: 'word', text: 'people', id: 'people' },
      { type: 'word', text: 'child', id: 'child' },
      { type: 'word', text: 'parent', id: 'parent' },
      { type: 'word', text: 'neighbor', id: 'neighbor' },
      { type: 'word', text: 'stranger', id: 'stranger' },
      { type: 'punct', text: '.' }
    ],
    meaningKeys: {
      I: 'reading.meaning.I', you: 'reading.meaning.you', he: 'reading.meaning.he', she: 'reading.meaning.she',
      we: 'reading.meaning.we', they: 'reading.meaning.they', who: 'reading.meaning.who',
      someone: 'reading.meaning.someone', everyone: 'reading.meaning.everyone', nobody: 'reading.meaning.nobody',
      friend: 'reading.meaning.friend', family: 'reading.meaning.family', person: 'reading.meaning.person',
      people: 'reading.meaning.people', child: 'reading.meaning.child', parent: 'reading.meaning.parent',
      neighbor: 'reading.meaning.neighbor', stranger: 'reading.meaning.stranger'
    },
    translations: {
      en: {
        I: { canonical: 'i', variants: ['i'] },
        you: { canonical: 'you', variants: ['you'] },
        he: { canonical: 'he', variants: ['he'] },
        she: { canonical: 'she', variants: ['she'] },
        we: { canonical: 'we', variants: ['we'] },
        they: { canonical: 'they', variants: ['they'] },
        who: { canonical: 'who', variants: ['who'] },
        someone: { canonical: 'someone', variants: ['someone', 'somebody'] },
        everyone: { canonical: 'everyone', variants: ['everyone', 'everybody'] },
        nobody: { canonical: 'nobody', variants: ['nobody', 'no one'] },
        friend: { canonical: 'friend', variants: ['friend'] },
        family: { canonical: 'family', variants: ['family'] },
        person: { canonical: 'person', variants: ['person'] },
        people: { canonical: 'people', variants: ['people'] },
        child: { canonical: 'child', variants: ['child', 'kid'] },
        parent: { canonical: 'parent', variants: ['parent'] },
        neighbor: { canonical: 'neighbor', variants: ['neighbor', 'neighbour'] },
        stranger: { canonical: 'stranger', variants: ['stranger'] }
      }
    }
  }),

  // Core Story Verbs (22 words)
  createReadingText({
    id: 'cafeTalk.coreStoryVerbs',
    title: { en: 'Core Story Verbs (22)', he: 'פעלים מרכזיים לסיפור (22)' },
    subtitle: { en: 'Essential action verbs for storytelling', he: 'פעלי פעולה חיוניים לסיפור סיפורים' },
    practiceLanguage: 'mandarin',
    tokens: [
      { type: 'word', text: 'go', id: 'go' },
      { type: 'word', text: 'come', id: 'come' },
      { type: 'word', text: 'see', id: 'see' },
      { type: 'word', text: 'hear', id: 'hear' },
      { type: 'word', text: 'say', id: 'say' },
      { type: 'word', text: 'tell', id: 'tell' },
      { type: 'word', text: 'ask', id: 'ask' },
      { type: 'word', text: 'think', id: 'think' },
      { type: 'word', text: 'know', id: 'know' },
      { type: 'word', text: 'want', id: 'want' },
      { type: 'word', text: 'need', id: 'need' },
      { type: 'word', text: 'like', id: 'like' },
      { type: 'word', text: 'love', id: 'love' },
      { type: 'word', text: 'hate', id: 'hate' },
      { type: 'word', text: 'make', id: 'make' },
      { type: 'word', text: 'do', id: 'do' },
      { type: 'word', text: 'get', id: 'get' },
      { type: 'word', text: 'give', id: 'give' },
      { type: 'word', text: 'take', id: 'take' },
      { type: 'word', text: 'find', id: 'find' },
      { type: 'word', text: 'lose', id: 'lose' },
      { type: 'word', text: 'try', id: 'try' },
      { type: 'punct', text: '.' }
    ],
    meaningKeys: {
      go: 'reading.meaning.go', come: 'reading.meaning.come', see: 'reading.meaning.see', hear: 'reading.meaning.hear',
      say: 'reading.meaning.say', tell: 'reading.meaning.tell', ask: 'reading.meaning.ask', think: 'reading.meaning.think',
      know: 'reading.meaning.know', want: 'reading.meaning.want', need: 'reading.meaning.need', like: 'reading.meaning.like',
      love: 'reading.meaning.love', hate: 'reading.meaning.hate', make: 'reading.meaning.make', do: 'reading.meaning.do',
      get: 'reading.meaning.get', give: 'reading.meaning.give', take: 'reading.meaning.take', find: 'reading.meaning.find',
      lose: 'reading.meaning.lose', try: 'reading.meaning.try'
    },
    translations: {
      en: {
        go: { canonical: 'go', variants: ['go'] },
        come: { canonical: 'come', variants: ['come'] },
        see: { canonical: 'see', variants: ['see'] },
        hear: { canonical: 'hear', variants: ['hear'] },
        say: { canonical: 'say', variants: ['say'] },
        tell: { canonical: 'tell', variants: ['tell'] },
        ask: { canonical: 'ask', variants: ['ask'] },
        think: { canonical: 'think', variants: ['think'] },
        know: { canonical: 'know', variants: ['know'] },
        want: { canonical: 'want', variants: ['want'] },
        need: { canonical: 'need', variants: ['need'] },
        like: { canonical: 'like', variants: ['like'] },
        love: { canonical: 'love', variants: ['love'] },
        hate: { canonical: 'hate', variants: ['hate'] },
        make: { canonical: 'make', variants: ['make'] },
        do: { canonical: 'do', variants: ['do'] },
        get: { canonical: 'get', variants: ['get'] },
        give: { canonical: 'give', variants: ['give'] },
        take: { canonical: 'take', variants: ['take'] },
        find: { canonical: 'find', variants: ['find'] },
        lose: { canonical: 'lose', variants: ['lose'] },
        try: { canonical: 'try', variants: ['try'] }
      }
    }
  }),

  // Life Logistics (20 words)
  createReadingText({
    id: 'cafeTalk.lifeLogistics',
    title: { en: 'Life Logistics (20)', he: 'לוגיסטיקה יומיומית (20)' },
    subtitle: { en: 'Daily life and practical words', he: 'חיי יום יום ומילים מעשיות' },
    practiceLanguage: 'mandarin',
    tokens: [
      { type: 'word', text: 'eat', id: 'eat' },
      { type: 'word', text: 'drink', id: 'drink' },
      { type: 'word', text: 'sleep', id: 'sleep' },
      { type: 'word', text: 'work', id: 'work' },
      { type: 'word', text: 'study', id: 'study' },
      { type: 'word', text: 'home', id: 'home' },
      { type: 'word', text: 'house', id: 'house' },
      { type: 'word', text: 'place', id: 'place' },
      { type: 'word', text: 'time', id: 'time' },
      { type: 'word', text: 'day', id: 'day' },
      { type: 'word', text: 'money', id: 'money' },
      { type: 'word', text: 'buy', id: 'buy' },
      { type: 'word', text: 'pay', id: 'pay' },
      { type: 'word', text: 'help', id: 'help' },
      { type: 'word', text: 'wait', id: 'wait' },
      { type: 'word', text: 'leave', id: 'leave' },
      { type: 'word', text: 'arrive', id: 'arrive' },
      { type: 'word', text: 'start', id: 'start' },
      { type: 'word', text: 'finish', id: 'finish' },
      { type: 'word', text: 'stop', id: 'stop' },
      { type: 'punct', text: '.' }
    ],
    meaningKeys: {
      eat: 'reading.meaning.eat', drink: 'reading.meaning.drink', sleep: 'reading.meaning.sleep',
      work: 'reading.meaning.work', study: 'reading.meaning.study', home: 'reading.meaning.home',
      house: 'reading.meaning.house', place: 'reading.meaning.place', time: 'reading.meaning.time',
      day: 'reading.meaning.day', money: 'reading.meaning.money', buy: 'reading.meaning.buy',
      pay: 'reading.meaning.pay', help: 'reading.meaning.help', wait: 'reading.meaning.wait',
      leave: 'reading.meaning.leave', arrive: 'reading.meaning.arrive', start: 'reading.meaning.start',
      finish: 'reading.meaning.finish', stop: 'reading.meaning.stop'
    },
    translations: {
      en: {
        eat: { canonical: 'eat', variants: ['eat'] },
        drink: { canonical: 'drink', variants: ['drink'] },
        sleep: { canonical: 'sleep', variants: ['sleep'] },
        work: { canonical: 'work', variants: ['work'] },
        study: { canonical: 'study', variants: ['study'] },
        home: { canonical: 'home', variants: ['home'] },
        house: { canonical: 'house', variants: ['house'] },
        place: { canonical: 'place', variants: ['place'] },
        time: { canonical: 'time', variants: ['time'] },
        day: { canonical: 'day', variants: ['day'] },
        money: { canonical: 'money', variants: ['money'] },
        buy: { canonical: 'buy', variants: ['buy'] },
        pay: { canonical: 'pay', variants: ['pay'] },
        help: { canonical: 'help', variants: ['help'] },
        wait: { canonical: 'wait', variants: ['wait'] },
        leave: { canonical: 'leave', variants: ['leave'] },
        arrive: { canonical: 'arrive', variants: ['arrive'] },
        start: { canonical: 'start', variants: ['start', 'begin'] },
        finish: { canonical: 'finish', variants: ['finish', 'end'] },
        stop: { canonical: 'stop', variants: ['stop'] }
      }
    }
  }),

  // Reactions & Feelings (20 words)
  createReadingText({
    id: 'cafeTalk.reactionsFeelings',
    title: { en: 'Reactions & Feelings (20)', he: 'תגובות ורגשות (20)' },
    subtitle: { en: 'Emotional responses and descriptions', he: 'תגובות רגשיות ותיאורים' },
    practiceLanguage: 'mandarin',
    tokens: [
      { type: 'word', text: 'happy', id: 'happy' },
      { type: 'word', text: 'sad', id: 'sad' },
      { type: 'word', text: 'angry', id: 'angry' },
      { type: 'word', text: 'scared', id: 'scared' },
      { type: 'word', text: 'surprised', id: 'surprised' },
      { type: 'word', text: 'tired', id: 'tired' },
      { type: 'word', text: 'excited', id: 'excited' },
      { type: 'word', text: 'bored', id: 'bored' },
      { type: 'word', text: 'worried', id: 'worried' },
      { type: 'word', text: 'confused', id: 'confused' },
      { type: 'word', text: 'okay', id: 'okay' },
      { type: 'word', text: 'fine', id: 'fine' },
      { type: 'word', text: 'great', id: 'great' },
      { type: 'word', text: 'bad', id: 'bad' },
      { type: 'word', text: 'terrible', id: 'terrible' },
      { type: 'word', text: 'wonderful', id: 'wonderful' },
      { type: 'word', text: 'nice', id: 'nice' },
      { type: 'word', text: 'beautiful', id: 'beautiful' },
      { type: 'word', text: 'ugly', id: 'ugly' },
      { type: 'word', text: 'strange', id: 'strange' },
      { type: 'punct', text: '.' }
    ],
    meaningKeys: {
      happy: 'reading.meaning.happy', sad: 'reading.meaning.sad', angry: 'reading.meaning.angry',
      scared: 'reading.meaning.scared', surprised: 'reading.meaning.surprised', tired: 'reading.meaning.tired',
      excited: 'reading.meaning.excited', bored: 'reading.meaning.bored', worried: 'reading.meaning.worried',
      confused: 'reading.meaning.confused', okay: 'reading.meaning.okay', fine: 'reading.meaning.fine',
      great: 'reading.meaning.great', bad: 'reading.meaning.bad', terrible: 'reading.meaning.terrible',
      wonderful: 'reading.meaning.wonderful', nice: 'reading.meaning.nice', beautiful: 'reading.meaning.beautiful',
      ugly: 'reading.meaning.ugly', strange: 'reading.meaning.strange'
    },
    translations: {
      en: {
        happy: { canonical: 'happy', variants: ['happy', 'glad'] },
        sad: { canonical: 'sad', variants: ['sad'] },
        angry: { canonical: 'angry', variants: ['angry', 'mad'] },
        scared: { canonical: 'scared', variants: ['scared', 'afraid'] },
        surprised: { canonical: 'surprised', variants: ['surprised'] },
        tired: { canonical: 'tired', variants: ['tired'] },
        excited: { canonical: 'excited', variants: ['excited'] },
        bored: { canonical: 'bored', variants: ['bored'] },
        worried: { canonical: 'worried', variants: ['worried'] },
        confused: { canonical: 'confused', variants: ['confused'] },
        okay: { canonical: 'okay', variants: ['okay', 'ok'] },
        fine: { canonical: 'fine', variants: ['fine'] },
        great: { canonical: 'great', variants: ['great'] },
        bad: { canonical: 'bad', variants: ['bad'] },
        terrible: { canonical: 'terrible', variants: ['terrible'] },
        wonderful: { canonical: 'wonderful', variants: ['wonderful'] },
        nice: { canonical: 'nice', variants: ['nice'] },
        beautiful: { canonical: 'beautiful', variants: ['beautiful'] },
        ugly: { canonical: 'ugly', variants: ['ugly'] },
        strange: { canonical: 'strange', variants: ['strange', 'weird'] }
      }
    }
  }),

  // Everyday Topics (20 words)
  createReadingText({
    id: 'cafeTalk.everydayTopics',
    title: { en: 'Everyday Topics (20)', he: 'נושאים יומיומיים (20)' },
    subtitle: { en: 'Common conversation topics and things', he: 'נושאי שיחה נפוצים ודברים' },
    practiceLanguage: 'mandarin',
    tokens: [
      { type: 'word', text: 'food', id: 'food' },
      { type: 'word', text: 'water', id: 'water' },
      { type: 'word', text: 'coffee', id: 'coffee' },
      { type: 'word', text: 'weather', id: 'weather' },
      { type: 'word', text: 'book', id: 'book' },
      { type: 'word', text: 'phone', id: 'phone' },
      { type: 'word', text: 'car', id: 'car' },
      { type: 'word', text: 'street', id: 'street' },
      { type: 'word', text: 'city', id: 'city' },
      { type: 'word', text: 'country', id: 'country' },
      { type: 'word', text: 'language', id: 'language' },
      { type: 'word', text: 'word', id: 'word' },
      { type: 'word', text: 'thing', id: 'thing' },
      { type: 'word', text: 'something', id: 'something' },
      { type: 'word', text: 'nothing', id: 'nothing' },
      { type: 'word', text: 'everything', id: 'everything' },
      { type: 'word', text: 'problem', id: 'problem' },
      { type: 'word', text: 'question', id: 'question' },
      { type: 'word', text: 'answer', id: 'answer' },
      { type: 'word', text: 'idea', id: 'idea' },
      { type: 'punct', text: '.' }
    ],
    meaningKeys: {
      food: 'reading.meaning.food', water: 'reading.meaning.water', coffee: 'reading.meaning.coffee',
      weather: 'reading.meaning.weather', book: 'reading.meaning.book', phone: 'reading.meaning.phone',
      car: 'reading.meaning.car', street: 'reading.meaning.street', city: 'reading.meaning.city',
      country: 'reading.meaning.country', language: 'reading.meaning.language', word: 'reading.meaning.word',
      thing: 'reading.meaning.thing', something: 'reading.meaning.something', nothing: 'reading.meaning.nothing',
      everything: 'reading.meaning.everything', problem: 'reading.meaning.problem', question: 'reading.meaning.question',
      answer: 'reading.meaning.answer', idea: 'reading.meaning.idea'
    },
    translations: {
      en: {
        food: { canonical: 'food', variants: ['food'] },
        water: { canonical: 'water', variants: ['water'] },
        coffee: { canonical: 'coffee', variants: ['coffee'] },
        weather: { canonical: 'weather', variants: ['weather'] },
        book: { canonical: 'book', variants: ['book'] },
        phone: { canonical: 'phone', variants: ['phone'] },
        car: { canonical: 'car', variants: ['car'] },
        street: { canonical: 'street', variants: ['street', 'road'] },
        city: { canonical: 'city', variants: ['city', 'town'] },
        country: { canonical: 'country', variants: ['country', 'nation'] },
        language: { canonical: 'language', variants: ['language'] },
        word: { canonical: 'word', variants: ['word'] },
        thing: { canonical: 'thing', variants: ['thing'] },
        something: { canonical: 'something', variants: ['something'] },
        nothing: { canonical: 'nothing', variants: ['nothing'] },
        everything: { canonical: 'everything', variants: ['everything'] },
        problem: { canonical: 'problem', variants: ['problem', 'issue'] },
        question: { canonical: 'question', variants: ['question'] },
        answer: { canonical: 'answer', variants: ['answer', 'response'] },
        idea: { canonical: 'idea', variants: ['idea', 'thought'] }
      }
    }
  })
];
