import { useEffect, useMemo, useState } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';

function shuffleItems(items) {
  const indexed = items.map((item, sourceIndex) => ({ ...item, sourceIndex }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return indexed;
}

function hasRtlText(text) {
  return /[֐-׿؀-ۿ]/.test(String(text || ''));
}

function getDirectionFromTokens(tokens = []) {
  return tokens.some((token) => hasRtlText(token.text)) ? 'rtl' : 'ltr';
}

function normalizeTokenText(text) {
  return String(text || '').replace(/[?.!,]/g, '').trim();
}

function getSelectedConceptIds(selected) {
  return selected.map((token) => token.conceptId).filter(Boolean);
}

function conceptSequenceMatches(selected, acceptedSequence) {
  const selectedConcepts = getSelectedConceptIds(selected);
  if (selectedConcepts.length !== acceptedSequence.length) return false;
  const selectedKey = selectedConcepts.join('|');
  const acceptedKey = acceptedSequence.join('|');
  const reversedAcceptedKey = [...acceptedSequence].reverse().join('|');
  return selectedKey === acceptedKey || selectedKey === reversedAcceptedKey;
}

function conceptSetMatches(selected, acceptedSet) {
  const selectedConcepts = getSelectedConceptIds(selected);
  if (selectedConcepts.length !== acceptedSet.length) return false;
  const a = [...selectedConcepts].sort();
  const b = [...acceptedSet].sort();
  return a.every((c, i) => c === b[i]);
}

function answerLineTokensMatch(selected, answerLine) {
  const expected = answerLine.tokens || [];
  if (selected.length !== expected.length) return false;
  const sel = selected.map((t) => normalizeTokenText(t.text)).sort();
  const exp = expected.map((t) => normalizeTokenText(t.text)).sort();
  return sel.every((v, i) => v === exp[i]);
}

function isAcceptableAnswer(selected, beat) {
  const sets = beat.acceptedConceptSets || [];
  for (const set of sets) {
    if (conceptSetMatches(selected, set)) return true;
  }
  const sequences = beat.acceptedConceptSequences || [];
  for (const seq of sequences) {
    if (conceptSequenceMatches(selected, seq)) return true;
  }
  for (const line of beat.answerLines || []) {
    if (answerLineTokensMatch(selected, line)) return true;
  }
  return false;
}

function buildTilePool(beat) {
  if (Array.isArray(beat.tileBankTokens) && beat.tileBankTokens.length > 0) {
    return beat.tileBankTokens.map((token) => ({
      text: token.text,
      conceptId: token.conceptId || null,
    }));
  }
  // Fallback: derive from answer lines (defensive — resolver normally
  // populates tileBankTokens).
  const seen = new Set();
  const tiles = [];
  for (const line of beat.answerLines || []) {
    for (const token of line.tokens || []) {
      const key = `${normalizeTokenText(token.text)}::${token.conceptId || ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      tiles.push({ text: token.text, conceptId: token.conceptId || null });
    }
  }
  return tiles;
}

function getMaxAnswerLength(beat) {
  let max = 0;
  for (const line of beat.answerLines || []) {
    if (Array.isArray(line.tokens) && line.tokens.length > max) max = line.tokens.length;
  }
  for (const set of beat.acceptedConceptSets || []) {
    if (set.length > max) max = set.length;
  }
  for (const seq of beat.acceptedConceptSequences || []) {
    if (seq.length > max) max = seq.length;
  }
  return max;
}

export default function PackSceneBuildLine({ beat, direction: directionProp, onStateChange }) {
  const { t } = useLocalization();
  const tilePool = useMemo(() => buildTilePool(beat), [beat]);
  const tiles = useMemo(() => shuffleItems(tilePool), [tilePool]);
  const direction = directionProp
    || (beat.answerLines?.[0]?.direction)
    || getDirectionFromTokens(beat.answerLines?.[0]?.tokens || []);
  const maxLength = useMemo(() => getMaxAnswerLength(beat), [beat]);

  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const selectedKeys = new Set(selected.map((token) => token.sourceIndex));
  const complete = maxLength > 0 && selected.length >= maxLength;

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
    const correct = isAcceptableAnswer(selected, beat);
    setIsCorrect(correct);
    setSubmitted(true);
  }, [complete, selected, beat, submitted]);

  useEffect(() => {
    onStateChange?.({
      complete,
      submitted,
      isCorrect,
      producedConceptIds: isCorrect ? getSelectedConceptIds(selected) : [],
    });
  }, [complete, submitted, isCorrect, selected, onStateChange]);

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
