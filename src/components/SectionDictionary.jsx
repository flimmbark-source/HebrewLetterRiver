import { useState, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getSectionDictionary } from '../lib/sectionDictionary.js';
import { getFontClass } from '../lib/readingUtils.js';

/**
 * SectionDictionary Component
 *
 * Modal that displays all unique words from a section with translations and meanings
 *
 * Props:
 * - sectionId: Section identifier ('starter', 'cafeTalk', etc.)
 * - sectionTitle: Display title for the section
 * - isOpen: Whether modal is open
 * - onClose: Callback to close modal
 */
export default function SectionDictionary({ sectionId, sectionTitle, isOpen, onClose }) {
  const { t } = useLocalization();
  const { languageId: practiceLanguageId, appLanguageId } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [dictionaryGroups, setDictionaryGroups] = useState([]);

  // Load dictionary entries when modal opens or languages change
  useEffect(() => {
    if (!isOpen) return;

    const entries = getSectionDictionary(sectionId, practiceLanguageId, appLanguageId, t);
    setDictionaryGroups(entries);
  }, [isOpen, sectionId, practiceLanguageId, appLanguageId, t]);

  // Filter entries based on search query while preserving groupings
  const filteredGroups = searchQuery.trim()
    ? dictionaryGroups
        .map(group => ({
          ...group,
          entries: group.entries.filter(entry => {
            const query = searchQuery.toLowerCase();
            return (
              entry.practiceWord.toLowerCase().includes(query) ||
              entry.canonical.toLowerCase().includes(query) ||
              entry.meaning.toLowerCase().includes(query)
            );
          })
        }))
        .filter(group => group.entries.length > 0)
    : dictionaryGroups;

  const totalFilteredEntries = filteredGroups.reduce((sum, group) => sum + group.entries.length, 0);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const appFontClass = getFontClass(appLanguageId);

  return (
    <div
      className="fixed inset-1 z-50 overflow-y-auto md:-translate-y-6"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center">
        <div
          className="w-full max-w-4xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {sectionTitle} {t('read.dictionary.title')}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {totalFilteredEntries} {t('read.dictionary.words')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              aria-label={t('common.close')}
            >
              {t('common.close')}
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('read.dictionary.search')}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
  
          {/* Dictionary Table */}
          <div className="mb-6 max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-800/50">
            {totalFilteredEntries === 0 ? (
              <div className="p-8 text-center text-slate-400">
                {searchQuery.trim() ? t('read.dictionary.noResults') : t('read.dictionary.noWords')}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredGroups.map(group => (
                  <div key={group.textId} className="border-b border-slate-700/60 last:border-b-0">
                    <div className="sticky top-0 z-10 bg-slate-800/90 px-4 py-3 backdrop-blur">
                      <h3 className="text-lg font-semibold text-white">{group.title}</h3>
                      <p className="text-xs text-slate-400">{group.entries.length} {t('read.dictionary.words')}</p>
                    </div>
                    <table className="w-full">
                      <thead className="bg-slate-800 text-sm">
                        <tr className="border-b border-slate-700">
                          <th className="p-3 text-left font-semibold text-slate-300">
                            {t('read.dictionary.practiceWord')}
                          </th>
                          <th className="p-3 text-left font-semibold text-slate-300">
                            {t('read.dictionary.translation')}
                          </th>
                          <th className="p-3 text-left font-semibold text-slate-300">
                            {t('read.dictionary.meaning')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.entries.map((entry, idx) => (
                          <tr key={entry.wordId || idx} className="border-b border-slate-700/50 last:border-0">
                            {/* Practice Word */}
                            <td className="p-3">
                              <span
                                className={`${entry.fontClass} text-xl text-white`}
                                dir={entry.direction}
                              >
                                {entry.practiceWord}
                              </span>
                            </td>
                            {/* Translation */}
                            <td className="p-3">
                              {entry.ghostSequence ? (
                                <div className="inline-flex gap-0.5">
                                  {entry.ghostSequence.map((g, i) => {
                                    const colorClass = {
                                      ok: 'text-emerald-400',
                                      bad: 'text-rose-400',
                                      miss: 'text-slate-500',
                                      extra: 'text-yellow-400'
                                    }[g.cls] || 'text-white';
                                    return (
                                      <span key={i} className={`${appFontClass} font-mono text-base ${colorClass}`}>
                                        {g.char}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className={`${appFontClass} font-mono text-base text-white`}>
                                  {entry.canonical}
                                </span>
                              )}
                            </td>
                            {/* Meaning */}
                            <td className="p-3">
                              <span className={`${appFontClass} text-base text-slate-300`}>
                                {entry.meaning}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  </div>
  );
}
