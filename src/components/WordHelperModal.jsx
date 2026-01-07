import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { findDictionaryEntryForWord } from '../lib/sentenceDictionaryLookup.ts';
import { analyzeHebrewMorphology } from '../lib/grammarLensLite.ts';

function buildCacheKey(word) {
  if (!word) return 'none';
  return `${word.wordId || 'surface'}:${word.hebrew}`;
}

function buildHintFromBreakdown(breakdown) {
  if (!breakdown) return '';
  const prefixHints = breakdown.prefixes.map((p) => p.meaningHint || p.text);
  if (prefixHints.length) {
    return prefixHints.join(' + ');
  }
  if (breakdown.base?.meaningHint) {
    return breakdown.base.meaningHint;
  }
  return breakdown.base?.text || '';
}

export default function WordHelperModal({
  word,
  practiceLanguageId,
  appLanguageId,
  onClose,
  onUseHint,
  t
}) {
  const [activeTab, setActiveTab] = useState('dictionary');
  const [insight, setInsight] = useState(null);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    if (!word) return;
    const key = buildCacheKey(word);
    if (cacheRef.current.has(key)) {
      setInsight(cacheRef.current.get(key));
      return;
    }

    const dictionaryEntry = word.wordId
      ? findDictionaryEntryForWord(word.wordId, practiceLanguageId, appLanguageId, t)
      : null;
    const morphology = analyzeHebrewMorphology(word.hebrew, practiceLanguageId, appLanguageId, t, dictionaryEntry);
    const breakdown = morphology?.breakdown;
    const combinedMeaning = (() => {
      if (!breakdown) return null;
      const hints = [];
      if (breakdown.prefixes.length) {
        hints.push(breakdown.prefixes.map((p) => p.meaningHint || p.text).join(', '));
      }
      if (breakdown.base?.meaningHint) {
        hints.push(breakdown.base.meaningHint);
      }
      if (breakdown.suffixes.length) {
        hints.push(breakdown.suffixes.map((s) => s.meaningHint || s.text).join(', '));
      }
      return hints.length ? hints.join(' · ') : null;
    })();

    const assembled = {
      entry: dictionaryEntry || morphology?.dictionaryEntry,
      breakdown,
      combinedMeaning
    };

    cacheRef.current.set(key, assembled);
    setInsight(assembled);
  }, [word, practiceLanguageId, appLanguageId, t]);

  useEffect(() => {
    setActiveTab('dictionary');
  }, [word]);

  const hintText = useMemo(() => buildHintFromBreakdown(insight?.breakdown), [insight]);

  if (!word) return null;

  const { entry, breakdown } = insight || {};

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{t('read.sentence.wordHelper')}</p>
            <h3 className="text-2xl font-semibold text-slate-900">{word.hebrew}</h3>
          </div>
          <div className="flex items-center gap-2">
            {onUseHint && hintText && (
              <button
                type="button"
                onClick={() => onUseHint(hintText)}
                className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm hover:bg-amber-100"
              >
                {t('read.sentence.useHint')}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              {t('common.close')}
            </button>
          </div>
        </div>

        <div className="mb-3 flex gap-2 text-sm font-semibold text-slate-700">
          <button
            type="button"
            className={`rounded-full px-3 py-1 shadow-sm transition ${activeTab === 'dictionary' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            onClick={() => setActiveTab('dictionary')}
          >
            {t('read.sentence.dictionaryTab')}
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 shadow-sm transition ${activeTab === 'grammar' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            onClick={() => setActiveTab('grammar')}
          >
            {t('read.sentence.grammarTab')}
          </button>
        </div>

        <div className="space-y-3 text-left">
          {activeTab === 'dictionary' ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">{t('read.sentence.dictionary')}</p>
              {entry ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{entry.practiceWord}</p>
                  {entry.canonical && (
                    <p className="text-sm text-slate-700">{entry.canonical}</p>
                  )}
                  {entry.meaning && (
                    <p className="text-sm text-slate-600">{entry.meaning}</p>
                  )}
                  {entry.sourceTitle && (
                    <p className="mt-1 text-xs text-slate-400">{entry.sourceTitle}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-600">{t('read.sentence.noDictionary')}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-xs uppercase tracking-wide text-slate-500">
                  {t('read.sentence.grammarOriginal')}:
                </strong>
                <span className="text-base font-semibold">{word.hebrew}</span>
              </div>
              {breakdown ? (
                <>
                  <div className="flex flex-wrap items-center gap-2" dir="rtl">
                    <strong className="text-xs uppercase tracking-wide text-slate-500">
                      {t('read.sentence.grammarSegments')}:
                    </strong>
                    <div className="flex flex-wrap gap-1 text-base">
                      {breakdown.prefixes.map((p, idx) => (
                        <button
                          key={`pref-${idx}`}
                          type="button"
                          title={p.meaningHint}
                          className="rounded-md bg-slate-200 px-2 py-1 text-slate-800 hover:bg-slate-300"
                        >
                          {p.text}
                        </button>
                      ))}
                      <button
                        type="button"
                        title={breakdown.base.meaningHint}
                        className="rounded-md bg-amber-100 px-2 py-1 text-slate-900 shadow-sm"
                      >
                        {breakdown.base.text}
                      </button>
                      {breakdown.suffixes.map((s, idx) => (
                        <button
                          key={`suf-${idx}`}
                          type="button"
                          title={s.meaningHint}
                          className="rounded-md bg-slate-200 px-2 py-1 text-slate-800 hover:bg-slate-300"
                        >
                          {s.text}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <strong>{t('read.sentence.grammarMeaning')}:</strong>
                    <span>{insight?.combinedMeaning || t('read.sentence.grammarMeaningFallback')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <strong>{t('read.sentence.grammarConfidence')}:</strong>
                    <span>{Math.round((breakdown.confidence || 0) * 100)}%</span>
                  </div>
                  {entry ? null : (
                    <p className="text-xs text-slate-500">{t('read.sentence.grammarBaseMissing')}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-600">{t('read.sentence.grammarFallback')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

WordHelperModal.propTypes = {
  word: PropTypes.shape({
    hebrew: PropTypes.string,
    wordId: PropTypes.string,
    surface: PropTypes.string
  }),
  practiceLanguageId: PropTypes.string.isRequired,
  appLanguageId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onUseHint: PropTypes.func,
  t: PropTypes.func.isRequired
};
