import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { getReadingTextById } from '../data/readingTexts/index.js';
import { getLanguageCode } from '../lib/languageUtils';
import { useLanguage } from '../context/LanguageContext';
import { useLocalization } from '../context/LocalizationContext';

/**
 * ModuleDictionaryModal - Displays all vocab and grammar words for a module
 * Shows Hebrew word, transliteration, and English meaning in a table
 */
export default function ModuleDictionaryModal({ module, isOpen, onClose }) {
  const { appLanguageId } = useLanguage();
  const { t } = useLocalization();

  if (!isOpen) return null;

  // Collect all words from vocab sections
  const vocabWords = [];
  module.vocabTextIds.forEach(vocabTextId => {
    const text = getReadingTextById(vocabTextId, 'hebrew');
    if (text && text.tokens) {
      text.tokens.forEach(token => {
        if (token.type === 'word') {
          const transliteration = text.translations?.en?.[token.id]?.canonical || token.id;
          const langCode = getLanguageCode(appLanguageId);
          const meaning = text.glosses?.[langCode]?.[token.id] || text.glosses?.en?.[token.id] || '—';

          vocabWords.push({
            hebrew: token.text,
            transliteration,
            meaning,
            id: token.id
          });
        }
      });
    }
  });

  // Collect all words from grammar
  const grammarWords = [];
  const grammarTextIds = module.grammarTextIds?.length
    ? module.grammarTextIds
    : [module.grammarTextId];

  grammarTextIds.forEach(grammarTextId => {
    const grammarText = getReadingTextById(grammarTextId, 'hebrew');
    if (grammarText && grammarText.tokens) {
      grammarText.tokens.forEach(token => {
        if (token.type === 'word') {
          const transliteration = grammarText.translations?.en?.[token.id]?.canonical || token.id;
          const langCode = getLanguageCode(appLanguageId);
          const meaning = grammarText.glosses?.[langCode]?.[token.id] || grammarText.glosses?.en?.[token.id] || '—';

          grammarWords.push({
            hebrew: token.text,
            transliteration,
            meaning,
            id: token.id
          });
        }
      });
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-white">
              {module.title} Dictionary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-800 transition-colors"
          >
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Vocabulary Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-slate-900 py-2">
              Vocabulary ({vocabWords.length} words)
            </h3>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr className="border-b border-slate-700">
                    <th className="p-3 text-left font-semibold text-slate-300 text-sm">Hebrew</th>
                    <th className="p-3 text-left font-semibold text-slate-300 text-sm">Transliteration</th>
                    <th className="p-3 text-left font-semibold text-slate-300 text-sm">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {vocabWords.map((word, idx) => (
                    <tr key={`${word.id}-${idx}`} className="border-b border-slate-700/50 last:border-0">
                      <td className="p-3 text-xl text-white font-hebrew">{word.hebrew}</td>
                      <td className="p-3 text-base text-slate-300 font-mono">{word.transliteration}</td>
                      <td className="p-3 text-base text-slate-300">{word.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grammar Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-slate-900 py-2">
              Grammar ({grammarWords.length} words)
            </h3>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr className="border-b border-slate-700">
                    <th className="p-3 text-left font-semibold text-slate-300 text-sm">Hebrew</th>
                    <th className="p-3 text-left font-semibold text-slate-300 text-sm">Transliteration</th>
                    <th className="p-3 text-left font-semibold text-slate-300 text-sm">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {grammarWords.map((word, idx) => (
                    <tr key={`${word.id}-${idx}`} className="border-b border-slate-700/50 last:border-0">
                      <td className="p-3 text-xl text-white font-hebrew">{word.hebrew}</td>
                      <td className="p-3 text-base text-slate-300 font-mono">{word.transliteration}</td>
                      <td className="p-3 text-base text-slate-300">{word.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-emerald-600 bg-emerald-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
