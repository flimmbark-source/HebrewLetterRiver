import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';

/**
 * SpotPackWords — tap the tokens in the line that belong to this beat's pack concepts.
 *
 * Tokens with a conceptId in beat.targetConceptIds are target tokens.
 * Non-target tokens briefly flash amber but do not hard-fail the beat.
 * The beat completes when all targetConceptIds have been found (one tap per concept).
 */
export default function SpotPackWords({ beat, line, onResult }) {
  const { t } = useLocalization();
  const [tappedConceptIds, setTappedConceptIds] = useState(new Set());
  const [nonTargetFlash, setNonTargetFlash] = useState(null);
  const [done, setDone] = useState(false);
  const flashTimer = useRef(null);

  const targetSet = new Set(beat.targetConceptIds);
  const foundCount = beat.targetConceptIds.filter((id) => tappedConceptIds.has(id)).length;
  const totalTarget = beat.targetConceptIds.length;
  const allFound = foundCount === totalTarget;

  useEffect(() => {
    if (allFound && !done) {
      setDone(true);
      const seenConceptIds = beat.targetConceptIds.filter((id) => tappedConceptIds.has(id));
      const timer = setTimeout(() => {
        onResult({
          actionType: 'spotPackWords',
          seenConceptIds,
          missedConceptIds: [],
          isCorrect: true,
        });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [allFound, done]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTokenTap = useCallback((token) => {
    if (done || !token.conceptId) return;

    if (targetSet.has(token.conceptId)) {
      setTappedConceptIds((prev) => new Set([...prev, token.conceptId]));
    } else {
      clearTimeout(flashTimer.current);
      setNonTargetFlash(token.text);
      flashTimer.current = setTimeout(() => setNonTargetFlash(null), 650);
    }
  }, [done, targetSet]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="text-center">
        <h3
          className="text-xl font-bold text-[#183d2e]"
          style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}
        >
          {t('packScene.spotWords.instruction', 'Spot the Pack Words')}
        </h3>
        <p className="mt-1 text-sm font-medium text-[#4e665b]">
          {t('packScene.spotWords.hint', 'Tap the words from your pack.')}
        </p>
      </div>

      <div
        className="text-center text-sm font-bold text-[#2f6b4c]"
        aria-live="polite"
        aria-atomic="true"
      >
        {foundCount} / {totalTarget} {t('packScene.spotWords.packWordsFound', 'pack words found')}
      </div>

      <div
        className="rounded-[1.5rem] border border-[#d8cdb7] bg-[#fff8e8]/90 p-5 shadow-sm"
        aria-label={t('packScene.spotWords.lineLabel', 'Target line — tap words you recognise from your pack')}
      >
        <div className="flex flex-row-reverse flex-wrap justify-center gap-2" dir="rtl">
          {line.tokens.map((token, idx) => {
            const isTarget = targetSet.has(token.conceptId);
            const isTapped = isTarget && tappedConceptIds.has(token.conceptId);
            const isFlashing = nonTargetFlash === token.text;

            let cls =
              'rounded-2xl border px-3 py-2 text-xl font-bold transition-all duration-200 active:scale-[0.97] ';
            if (isTapped) {
              cls += 'border-[#2f6b4c] bg-[#e4f0df] text-[#183d2e] ring-2 ring-[#2f6b4c]/20 shadow-md';
            } else if (isFlashing) {
              cls += 'border-[#c77912] bg-[#fff0d8] text-[#6d4213]';
            } else {
              cls += 'border-[#d8cdb7] bg-white/80 text-[#183d2e] shadow-sm hover:bg-white hover:shadow-md';
            }

            return (
              <button
                // eslint-disable-next-line react/no-array-index-key
                key={`${token.text}-${idx}`}
                type="button"
                aria-pressed={isTapped}
                onClick={() => handleTokenTap(token)}
                disabled={done}
                className={cls}
              >
                {token.text}
              </button>
            );
          })}
        </div>

        {line.transliteration && (
          <p className="mt-3 text-center text-sm italic text-[#4e665b]">
            {line.transliteration}
          </p>
        )}
      </div>

      {allFound && (
        <div className="rounded-2xl border border-[#2f6b4c] bg-[#e4f0df] px-4 py-3 text-center text-sm font-bold text-[#183d2e]">
          {t('packScene.spotWords.allFound', 'All pack words found!')}
        </div>
      )}
    </div>
  );
}
