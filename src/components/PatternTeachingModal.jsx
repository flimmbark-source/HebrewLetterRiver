import React, { useEffect } from 'react';
import { getPatternById, basicConnectorsVowelPatterns } from '../data/vowelPatterns/hebrewBasicConnectorsPatterns';

/**
 * PatternTeachingModal Component
 *
 * Shows detailed information about a vowel pattern, including:
 * - Title and description
 * - Learning rules
 * - Dynamic examples from the current pack
 *
 * Props:
 * - isOpen: boolean - Whether the modal is visible
 * - patternId: string - The pattern ID to display (e.g., 'P1')
 * - readingText: object - Current reading text with tokens, translations, glosses, meaningKeys
 * - practiceLanguageId: string - Practice language (e.g., 'hebrew')
 * - appLanguageId: string - App language (e.g., 'english')
 * - onGotIt: function - Callback when "Got it" is clicked (marks pattern as learned)
 * - onClose: function - Callback when modal is closed
 */
export function PatternTeachingModal({
  isOpen,
  patternId,
  readingText,
  practiceLanguageId,
  appLanguageId,
  onGotIt,
  onClose
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !patternId) {
    return null;
  }

  const pattern = getPatternById(patternId);

  if (!pattern) {
    return null;
  }

  // Get examples from current pack that use this pattern
  const examples = getExamplesForPattern(patternId, readingText, practiceLanguageId, appLanguageId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-semibold text-slate-100">
              {pattern.chipLabel}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {pattern.title}
          </h2>
          <p className="text-slate-300">
            {pattern.description}
          </p>
        </div>

        {/* Learning Rules */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            How it works:
          </h3>
          <ul className="space-y-2">
            {pattern.rules.map((rule, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-200">
                <span className="text-blue-400 mt-1">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Examples from Current Pack */}
        {examples.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Examples in this pack:
            </h3>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  {/* Hebrew */}
                  <div className="text-2xl font-semibold text-white language-font-hebrew min-w-[60px] text-right">
                    {example.hebrew}
                  </div>
                  {/* Transliteration */}
                  <div className="text-lg text-blue-300 font-mono min-w-[100px]">
                    {example.transliteration}
                  </div>
                  {/* Meaning */}
                  <div className="text-slate-300 flex-1">
                    "{example.meaning}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onGotIt();
              onClose();
            }}
            className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to extract examples for a specific pattern from the reading text
 */
function getExamplesForPattern(patternId, readingText, practiceLanguageId, appLanguageId) {
  if (!readingText || !readingText.tokens) {
    return [];
  }

  const examples = [];

  // Find all word IDs that use this pattern
  const wordIdsForPattern = Object.entries(basicConnectorsVowelPatterns)
    .filter(([_, pId]) => pId === patternId)
    .map(([wordId, _]) => wordId);

  // Get language code for glosses
  const langCode = getLanguageCode(appLanguageId);

  // Find tokens that match
  readingText.tokens.forEach(token => {
    if (token.type === 'word' && wordIdsForPattern.includes(token.id)) {
      const hebrew = token.text;
      const transliteration = readingText.translations?.[practiceLanguageId]?.[token.id]?.canonical || '';

      // Get meaning from glosses
      const meaning = readingText.glosses?.[langCode]?.[token.id]
                   || readingText.glosses?.en?.[token.id]
                   || token.id;

      examples.push({
        hebrew,
        transliteration,
        meaning
      });
    }
  });

  return examples;
}

/**
 * Get language code from language ID
 */
function getLanguageCode(languageId) {
  const codeMap = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'portuguese': 'pt',
    'russian': 'ru',
    'japanese': 'ja',
    'korean': 'ko',
    'mandarin': 'zh',
    'arabic': 'ar',
    'hebrew': 'he'
  };
  return codeMap[languageId] || 'en';
}
