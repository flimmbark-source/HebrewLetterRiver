import { useMemo, useState } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';

function shuffleItems(items) {
  return [...items]
    .map((item, index) => ({ item, index, sort: Math.sin(index + 1) }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item, index }) => ({ ...item, sourceIndex: index }));
}

export default function PackSceneBuildLine({ beat, line, onResult }) {
  const { t } = useLocalization();
  const tiles = useMemo(() => shuffleItems(line.tokens || []), [line]);
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const selectedKeys = new Set(selected.map((token) => token.sourceIndex));
  const expected = (line.tokens || []).map((token) => token.text).join('|');
  const current = selected.map((token) => token.text).join('|');
  const complete = selected.length === (line.tokens || []).length;

  function addTile(tile) {
    if (submitted || selectedKeys.has(tile.sourceIndex)) return;
    setSelected((prev) => [...prev, tile]);
  }

  function removeTile(index) {
    if (submitted) return;
    setSelected((prev) => prev.filter((_, idx) => idx !== index));
  }

  function submitAnswer() {
    if (!complete || submitted) return;
    const correct = current === expected;
    setSubmitted(true);
    setIsCorrect(correct);
    if (correct) {
      window.setTimeout(() => {
        onResult({
          type: 'buildLine',
          isCorrect: true,
          producedConceptIds: beat.targetConceptIds || [],
        });
      }, 650);
    }
  }

  function tryAgain() {
    setSubmitted(false);
    setIsCorrect(false);
    setSelected([]);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      {beat.buildMeaning && (
        <p className="text-center text-sm font-semibold text-[#4e665b]">
          {beat.buildMeaning}
        </p>
      )}

      <div className="min-h-[4rem] rounded-[1.25rem] border border-[#d8cdb7] bg-white/72 p-3 shadow-sm">
        {selected.length === 0 ? (
          <div className="flex h-full min-h-[2.5rem] items-center justify-center text-sm font-semibold text-[#7b8077]">
            {t('packScene.buildLine.answerPlaceholder', 'Tap words to build your answer')}
          </div>
        ) : (
          <div className="flex flex-row-reverse flex-wrap justify-center gap-2" dir="rtl">
            {selected.map((token, index) => (
              <button
                key={`${token.text}-${token.sourceIndex}`}
                type="button"
                onClick={() => removeTile(index)}
                className="rounded-2xl border border-[#2f6b4c]/35 bg-[#e4f0df] px-3 py-2 text-xl font-bold text-[#183d2e] shadow-sm active:scale-[0.97]"
              >
                {token.text}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-row-reverse flex-wrap justify-center gap-2" dir="rtl">
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

      {submitted && !isCorrect && (
        <div className="rounded-2xl border border-[#c77912]/35 bg-[#fff0d8] px-3 py-2 text-center text-sm font-semibold text-[#6d4213]">
          {t('packScene.buildLine.tryAgainMessage', 'That is not quite the answer. Try again.')}
        </div>
      )}

      <button
        type="button"
        onClick={submitted && !isCorrect ? tryAgain : submitAnswer}
        disabled={!complete && !submitted}
        className={`w-full rounded-2xl px-5 py-4 text-lg font-bold shadow-lg transition active:scale-[0.99] ${
          complete || submitted
            ? 'text-white hover:brightness-105'
            : 'bg-[#d8cdb7] text-[#7b8077] shadow-none'
        }`}
        style={complete || submitted ? { background: 'linear-gradient(180deg, #2f6b4c, #1e4d35)', boxShadow: '0 12px 28px rgba(31,77,53,0.28)' } : undefined}
      >
        {submitted && !isCorrect
          ? t('packScene.buildLine.tryAgain', 'Try again')
          : t('packScene.buildLine.check', 'Check answer')}
      </button>
    </div>
  );
}
