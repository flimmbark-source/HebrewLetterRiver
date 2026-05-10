import { useState, useCallback, useRef } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';

export default function SpotPackWords({ beat, line, onResult, suppressHeader = false }) {
  const { t } = useLocalization();
  const [tappedConceptIds, setTappedConceptIds] = useState(new Set());
  const [nonTargetFlash, setNonTargetFlash] = useState(null);
  const flashTimer = useRef(null);

  const targetSet = new Set(beat.targetConceptIds);
  const foundCount = beat.targetConceptIds.filter((id) => tappedConceptIds.has(id)).length;
  const totalTarget = beat.targetConceptIds.length;
  const allFound = foundCount === totalTarget;

  const handleTokenTap = useCallback((token) => {
    if (!token.conceptId) return;
    if (targetSet.has(token.conceptId)) {
      setTappedConceptIds((prev) => new Set([...prev, token.conceptId]));
      return;
    }
    clearTimeout(flashTimer.current);
    setNonTargetFlash(token.text);
    flashTimer.current = setTimeout(() => setNonTargetFlash(null), 650);
  }, [targetSet]);

  const handleContinue = useCallback(() => {
    onResult({
      actionType: 'spotPackWords',
      seenConceptIds: beat.targetConceptIds.filter((id) => tappedConceptIds.has(id)),
      missedConceptIds: [],
      isCorrect: true,
    });
  }, [beat.targetConceptIds, tappedConceptIds, onResult]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      {!suppressHeader && (
        <div className="text-center">
          <h3 className="text-xl font-bold text-[#183d2e]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
            {t('packScene.spotWords.instruction', 'Find the words you know')}
          </h3>
          <p className="mt-1 text-sm font-medium text-[#4e665b]">
            {t('packScene.spotWords.hint', 'Tap the words from your pack.')}
          </p>
        </div>
      )}

      <div className="text-center text-sm font-bold text-[#2f6b4c]" aria-live="polite" aria-atomic="true">
        {foundCount} / {totalTarget} {t('packScene.spotWords.packWordsFound', 'pack words found')}
      </div>

      <div className="rounded-[1.25rem] border border-[#d8cdb7] bg-white/72 p-4 shadow-sm" aria-label={t('packScene.spotWords.lineLabel', 'Tap words you recognise from your pack')}>
        <div className="flex flex-row-reverse flex-wrap justify-center gap-2" dir="rtl">
          {line.tokens.map((token, idx) => {
            const isTarget = targetSet.has(token.conceptId);
            const isTapped = isTarget && tappedConceptIds.has(token.conceptId);
            const isFlashing = nonTargetFlash === token.text;
            let cls = 'rounded-2xl border px-3 py-2 text-xl font-bold transition-all duration-200 active:scale-[0.97] ';
            if (isTapped) cls += 'border-[#2f6b4c] bg-[#e4f0df] text-[#183d2e] ring-2 ring-[#2f6b4c]/20 shadow-md';
            else if (isFlashing) cls += 'border-[#c77912] bg-[#fff0d8] text-[#6d4213]';
            else cls += 'border-[#d8cdb7] bg-white/86 text-[#183d2e] shadow-sm hover:bg-white hover:shadow-md';

            return (
              <button
                key={`${token.text}-${idx}`}
                type="button"
                aria-pressed={isTapped}
                onClick={() => handleTokenTap(token)}
                disabled={allFound}
                className={cls}
              >
                {token.text}
              </button>
            );
          })}
        </div>
      </div>

      {allFound ? (
        <button
          type="button"
          onClick={handleContinue}
          className="w-full rounded-2xl px-5 py-4 text-lg font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99]"
          style={{ background: 'linear-gradient(180deg, #2f6b4c, #1e4d35)', boxShadow: '0 12px 28px rgba(31,77,53,0.28)' }}
        >
          {t('packScene.spotWords.continue', 'Continue')}
        </button>
      ) : (
        <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff8e8]/70 px-3 py-2 text-center text-xs font-semibold text-[#4e665b]">
          {t('packScene.spotWords.tapHint', 'Tap the words you recognise from this pack.')}
        </div>
      )}
    </div>
  );
}
