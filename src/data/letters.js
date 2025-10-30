export const letters = [
  { hebrew: 'א', name: 'Aleph' },
  { hebrew: 'בּ', name: 'Bet' },
  { hebrew: 'ב', name: 'Vet' },
  { hebrew: 'ג', name: 'Gimel' },
  { hebrew: 'ד', name: 'Dalet' },
  { hebrew: 'ה', name: 'Heh' },
  { hebrew: 'ו', name: 'Vav' },
  { hebrew: 'ז', name: 'Zayin' },
  { hebrew: 'ח', name: 'Chet' },
  { hebrew: 'ט', name: 'Tet' },
  { hebrew: 'י', name: 'Yud' },
  { hebrew: 'כּ', name: 'Kaf' },
  { hebrew: 'כ', name: 'Chaf' },
  { hebrew: 'ך', name: 'Final Chaf' },
  { hebrew: 'ל', name: 'Lamed' },
  { hebrew: 'מ', name: 'Mem' },
  { hebrew: 'ם', name: 'Final Mem' },
  { hebrew: 'נ', name: 'Nun' },
  { hebrew: 'ן', name: 'Final Nun' },
  { hebrew: 'ס', name: 'Samech' },
  { hebrew: 'ע', name: 'Ayin' },
  { hebrew: 'פּ', name: 'Pei' },
  { hebrew: 'פ', name: 'Fei' },
  { hebrew: 'ף', name: 'Final Fei' },
  { hebrew: 'צ', name: 'Tzadi' },
  { hebrew: 'ץ', name: 'Final Tzadi' },
  { hebrew: 'ק', name: 'Kuf' },
  { hebrew: 'ר', name: 'Resh' },
  { hebrew: 'שׁ', name: 'Shin' },
  { hebrew: 'שׂ', name: 'Sin' },
  { hebrew: 'ת', name: 'Tav' }
];

export const letterMap = letters.reduce((acc, letter) => {
  acc[letter.hebrew] = letter;
  return acc;
}, {});
