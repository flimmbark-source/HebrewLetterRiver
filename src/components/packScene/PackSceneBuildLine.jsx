import { useEffect, useMemo, useState } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';

const FOOD_SCENE_DISTRACTOR_TILES = [
  { text: 'מים', conceptId: 'water' },
  { text: 'לחם', conceptId: 'bread' },
  { text: 'תודה', conceptId: 'thank-you' },
  { text: 'כן', conceptId: 'yes' },
];

function shuffleItems(items) {
  return [...items]
    .map((item, index) => ({ item, index, sort: Math.sin(index + 1) }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item, index }) => ({ ...item, sourceIndex: index }));
}

function hasRtlText(text) {
  return /[\u0590-\u05ff\u0600-\u06ff]/.test(String(text || ''));
}

function getLineDirection(tokens = []) {
  return tokens.some((token) => hasRtlText(token.text)) ? 'rtl' : 'ltr';
}

function buildKey(items) {
  return items.map((token) => token.text).join('|');
}

function buildConceptKey(items) {
  return items.map((token) => token.conceptId || token.text).join('|');
}

function sameTokenSet(a, b) {
  if (a.length !== b.length) return false;
  const aKeys = a.map((token) => `${token.text}::${token.conceptId || ''}`).sort();
  const bKeys = b.map((token) => `${token.text}::${token.conceptId || ''}`).sort();
  return aKeys.every((key, index) => key === bKeys[index]);
}

function normalizeTokenText(text) {
  return String(text || '').replace(/[?.!,]/g, '').trim();
}

function isExpectedTokenSet(selected, expectedTokens) {
  if (selected.length !== expectedTokens.length) return false;
  const selectedKeys = selected
    .map((token) => `${normalizeTokenText(token.text)}::${token.conceptId || ''}`)
    .sort();
  const expectedKeys = expectedTokens
    .map((token) => `${normalizeTokenText(token.text)}::${token.conceptId || ''}`)
    .sort();
  return selectedKeys.every((key, index) => key === expectedKeys[index]);
}

function isAcceptableAnswer(selected, expectedTokens) {
  if (selected.length !== expectedTokens.length) return false;

  const selectedText = buildKey(selected);
  const expectedText = buildKey(expectedTokens);
  const reversedExpectedText = buildKey([...expectedTokens].reverse());

  if (selectedText === expectedText || selectedText === reversedExpectedText) return true;

  const selectedConcepts = buildConceptKey(selected);
  const expectedConcepts = buildConceptKey(expectedTokens);
  const reversedExpectedConcepts = buildConceptKey([...expectedTokens].reverse());

  if (selectedConcepts === expectedConcepts || selectedConcepts === reversedExpectedConcepts) return true;

  return sameTokenSet(selected, expectedTokens) || isExpectedTokenSet(selected, expectedTokens);
}

function buildTileBank(expectedTokens) {
  const seen = new Set();
  const addUnique = (token) => {
    const key = `${normalizeTokenText(token.text)}::${token.conceptId || ''}`;
    if (seen.has(key)) return null;
    seen.add(key);
    return token;
  };

  const answerTiles = expectedTokens.map(addUnique).filter(Boolean);
  const needsDistractors = expectedTokens.length <= 3;
  if (!needsDistractors) return answerTiles;

  const distractors = FOOD_SCENE_DISTRACTOR_TILES.map(addUnique).filter(Boolean);
  return [...answerTiles, ...distractors];
}

export default function PackSceneBuildLine({ beat, line, onStateChange }) {
  const { t } = useLocalization();
  const expectedTokens = useMemo(() => line.tokens || [], [line]);
  const allTiles = useMemo(() => buildTileBank(expectedTokens), [expectedTokens]);
  const tiles = useMemo(() => shuffleItems(allTiles), [allTiles]);
  const direction = getLineDirection(expectedTokens);
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const selectedKeys = new Set(selected.map((token) => token.sourceIndex));
  const complete = selected.length === expectedTokens.length;

  function addTile(tile) {
    if (submitted || selectedKeys.has(tile.sourceIndex)) return;
    setSelected((prev) => [...prev, tile]);
  }

  function removeTile(index) {
    if (submitted) return;
    setSelected((prev) => prev.filter((_, idx) => idx !== index));
  }

  useEffect(() => {
    if (!complete || submitted) return;

    const correct = isAcceptableAnswer(selected, expectedTokens);
    setIsCorrect(correct);
    setSubmitted(true);
  }, [complete, selected, expectedTokens, submitted]);

  useEffect(() => {
    onStateChange?.({
      complete,
      submitted,
      isCorrect,
      producedConceptIds: isCorrect ? (beat.targetConceptIds || []) : [],
    });
  }, [complete, submitted, isCorrect, beat.targetConceptIds, onStateChange]);

  function tryAgain() {
    setSubmitted(false);
    setIsCorrect(false);
    setSelected([]);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      <div className="min-h-[4rem] rounded-[1.25rem] border border-[#d8cdb7] bg-white/72 p-3 shadow-sm">
        {selected.length === 0 ? (
          <div className="flex h-full min-h-[2.5rem] items-center justify-center text-sm font-semibold text-[#7b8077]">
            {t('packScene.buildLine.answerPlaceholder', 'Tap words to build your answer')}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2" dir={direction}>
            {selected.map((token, index) => (
              <button
                key={`${token.text}-${token.sourceIndex}`}
                type="button"
                onClick={() => removeTile(index)}
                className={`rounded-2xl border px-3 py-2 text-xl font-bold shadow-sm active:scale-[0.97] ${
                  submitted && isCorrect
                    ? 'border-[#2f6b4c] bg-[#e4f0df] text-[#183d2e] ring-2 ring-[#2f6b4c]/20'
                    : submitted && !isCorrect
                      ? 'border-[#c77912] bg-[#fff0d8] text-[#6d4213]'
                      : 'border-[#2f6b4c]/35 bg-[#e4f0df] text-[#183d2e]'
                }`}
              >
                {token.text}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2" dir={direction}>
        {tiles.map((tile) => {
          const used = selectedKeys.has(tile.sourceIndex);
          return (
            <button
              key={`${tile.text}-${tile.sourceIndex}`}
              type="button"
              onClick={() => addTile(tile)}
              disabled={used || submitted}
              className={`rounded-2xl border px-3 py-2 text-xl font-bold shadow-sm transition active:scale-[0.97] ${
                used
                  ? 'border-[#d8cdb7]/60 bg-white/30 text-[#9b9a8d] opacity-45'
                  : 'border-[#d8cdb7] bg-[#fff8e8] text-[#183d2e] hover:bg-white hover:shadow-md'
              }`}
            >
              {tile.text}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className={`rounded-2xl border px-3 py-2 text-center text-sm font-semibold ${
          isCorrect
            ? 'border-[#2f6b4c]/30 bg-[#e4f0df] text-[#183d2e]'
            : 'border-[#c77912]/35 bg-[#fff0d8] text-[#6d4213]'
        }`}
        >
          {isCorrect
            ? t('packScene.buildLine.correctMessage', 'Nice answer.')
            : t('packScene.buildLine.tryAgainMessage', 'That is not quite the answer. You can try again or continue.')}
        </div>
      )}

      {submitted && !isCorrect ? (
        <button
          type="button"
          onClick={tryAgain}
          className="w-full rounded-2xl border border-[#d8cdb7] bg-white/72 px-4 py-4 text-base font-bold text-[#315846] shadow-sm transition hover:bg-white active:scale-[0.99]"
        >
          {t('packScene.buildLine.tryAgain', 'Try again')}
        </button>
      ) : !submitted ? (
        <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff8e8]/70 px-3 py-2 text-center text-xs font-semibold text-[#4e665b]">
          {t('packScene.buildLine.tapHint', 'Pick the words for your answer.')}
        </div>
      ) : null}
    </div>
  );
}
