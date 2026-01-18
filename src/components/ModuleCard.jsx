import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Lock, Check, BookOpen, Languages, MessageSquare } from 'lucide-react';
import ReadingArea from './ReadingArea';
import SentencePracticeArea from './SentencePracticeArea';
import ModuleDictionaryModal from './ModuleDictionaryModal';
import {
  getModuleProgress,
  markVocabSectionPracticed,
  markGrammarPracticed,
  getModuleCompletionPercentage,
  autoUnlockNextModule,
  initializeModuleProgress,
  syncSentenceCompletion,
} from '../lib/moduleProgressStorage';
import { allSentences } from '../data/sentences';
import { getThemeStats } from '../lib/sentenceProgressStorage';
import { getReadingTextById } from '../data/readingTexts/index.js';
import { useLanguage } from '../context/LanguageContext';
import { getCardProgress, isCardComplete } from '../lib/cardProgressHelper';
import { useGame } from '../context/GameContext.jsx';

/**
 * ModuleCard - Displays a learning module with vocab, grammar, and sentences
 * Layout: Vocab (left) | Grammar (right)
 *         Sentences (bottom, full width)
 */
export default function ModuleCard({ module, isLocked, onModuleComplete, onPracticeChange }) {
  const { languageId: practiceLanguageId } = useLanguage();
  const vocabTextIds = module.vocabTextIds || [];
  const grammarTextIds = module.grammarTextIds || [];
  const [activeSection, setActiveSection] = useState(null); // 'grammar', 'sentences', or a vocab text ID
  const [progress, setProgress] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showDictionary, setShowDictionary] = useState(false);
  const [selectedGrammarTextId, setSelectedGrammarTextId] = useState(module.grammarTextId);
  const [cardProgressMap, setCardProgressMap] = useState({}); // Track progress for each card
  const [expandedVocabId, setExpandedVocabId] = useState(null); // Track which vocab section has options expanded
  const { openGame } = useGame();
  const hasPerVocabGrammar =
    grammarTextIds.length > 0 && grammarTextIds.length === vocabTextIds.length;

  // Load progress on mount and ensure module is initialized
  useEffect(() => {
    let moduleProgress = getModuleProgress(module.id);
    if (!moduleProgress) {
      moduleProgress = initializeModuleProgress(
        module.id,
        module.sentenceIds.length,
        vocabTextIds.length
      );
    }
    setProgress(moduleProgress);
    setCompletionPercentage(getModuleCompletionPercentage(module.id));
    setSelectedGrammarTextId(grammarTextIds?.[0] || module.grammarTextId);
  }, [
    module.id,
    module.sentenceIds.length,
    module.vocabTextIds?.length,
    module.grammarTextId,
    module.grammarTextIds?.join(','),
  ]);

  // Calculate progress for all vocab and grammar cards
  useEffect(() => {
    const newProgressMap = {};

    // Calculate progress for vocab cards
    vocabTextIds.forEach(vocabTextId => {
      newProgressMap[vocabTextId] = getCardProgress(vocabTextId, practiceLanguageId);
    });

    // Calculate progress for grammar cards
    grammarTextIds.forEach(grammarTextId => {
      newProgressMap[grammarTextId] = getCardProgress(grammarTextId, practiceLanguageId);
    });

    // Also calculate for single grammar text if it exists
    if (module.grammarTextId) {
      newProgressMap[module.grammarTextId] = getCardProgress(module.grammarTextId, practiceLanguageId);
    }

    setCardProgressMap(newProgressMap);
  }, [vocabTextIds.join(','), grammarTextIds.join(','), module.grammarTextId, practiceLanguageId, activeSection]);

  // Notify parent when practice mode changes
  useEffect(() => {
    if (onPracticeChange) {
      onPracticeChange(module.id, activeSection);
    }
  }, [activeSection, module.id, onPracticeChange]);

  useEffect(() => {
    if (!activeSection) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [activeSection]);

  // Get sentences for this module
  const moduleSentences = allSentences.filter(s =>
    module.sentenceIds.includes(s.id)
  );

  const handleVocabSectionComplete = (vocabTextId) => {
    // Mark vocab section as practiced when ReadingArea practice is complete
    markVocabSectionPracticed(module.id, vocabTextId);
    setActiveSection(null);
    updateProgress();
  };

  const handleGrammarComplete = () => {
    // Mark grammar as practiced when ReadingArea practice is complete
    markGrammarPracticed(module.id);
    setActiveSection(null);
    updateProgress();
  };

  const handleSentenceComplete = () => {
    updateProgress();
  };

  const updateProgress = () => {
    const updated = getModuleProgress(module.id);
    setProgress(updated);
    setCompletionPercentage(getModuleCompletionPercentage(module.id));

    if (updated?.isCompleted) {
      autoUnlockNextModule(module.id);
      if (onModuleComplete) {
        onModuleComplete(module.id);
      }
    }
  };

  const handleStartGrammar = (grammarTextId) => {
    setSelectedGrammarTextId(grammarTextId || module.grammarTextId);
    setActiveSection('grammar');
  };

  const handleStartSentences = () => {
    setActiveSection('sentences');
  };

  const handleBack = () => {
    // Sync sentence progress when returning from sentence practice
    if (activeSection === 'sentences') {
      const stats = getThemeStats(module.title, moduleSentences);
      syncSentenceCompletion(module.id, stats.practiced);
      updateProgress();
    }
    setActiveSection(null);
  };

  const handlePlayGame = (vocabTextId) => {
    const vocabText = getReadingTextById(vocabTextId, 'hebrew');
    if (!vocabText) {
      console.error('Vocab text not found:', vocabTextId);
      return;
    }

    // Prepare vocab data for the game
    const vocabData = {
      textId: vocabTextId,
      title: vocabText.title?.en || 'Vocabulary Practice',
      subtitle: vocabText.subtitle?.en || 'Match words with their emojis',
      words: vocabText.tokens
        .filter(token => token.type === 'word')
        .map(token => ({
          id: token.id,
          text: token.text,
          gloss: vocabText.glosses?.en?.[token.id] || token.id,
          transliteration: vocabText.translations?.en?.[token.id]?.canonical || token.id
        })),
      emojis: vocabText.emojis || {}
    };

    // Open the game with vocab mode
    openGame({
      mode: 'vocab',
      vocabData,
      autostart: true
    });
  };

  // Render locked state
  if (isLocked) {
    return (
      <Card className="w-full opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <span>{module.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Complete the previous module to unlock this lesson
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render active vocab section
  if (activeSection && vocabTextIds.includes(activeSection)) {
    return (
      <ReadingArea
        textId={activeSection}
        onBack={() => handleVocabSectionComplete(activeSection)}
      />
    );
  }

  if (activeSection === 'grammar') {
    return (
      <ReadingArea
        textId={selectedGrammarTextId || module.grammarTextId}
        onBack={handleGrammarComplete}
      />
    );
  }

  if (activeSection === 'sentences') {
    // Convert first sentence to reading text format for ReadingArea
    const firstSentence = moduleSentences[0];
    if (!firstSentence) {
      return (
        <div className="p-4">
          <p>No sentences available</p>
          <button onClick={handleBack}>Back</button>
        </div>
      );
    }

    // Create a synthetic reading text ID for this sentence
    const sentenceTextId = `sentence-${firstSentence.id}`;

    return (
      <ReadingArea
        textId={sentenceTextId}
        onBack={handleBack}
        mode="sentence"
      />
    );
  }

  // Render module overview
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span>{module.title}</span>
              {progress?.isCompleted && (
                <Check className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {module.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm font-semibold text-primary">
              {completionPercentage}% Complete
            </div>
            <Button
              onClick={() => setShowDictionary(true)}
              variant="outline"
              className="text-xs px-3 py-1 h-auto"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Dictionary
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-3">
              {vocabTextIds.map((vocabTextId, index) => {
                const vocabText = getReadingTextById(vocabTextId, 'hebrew');
                const vocabTitle = vocabText?.title?.en || `Vocabulary Part ${index + 1}`;
                const vocabSubtitle = vocabText?.subtitle?.en || 'Practice vocabulary words';

                const cardProgress = cardProgressMap[vocabTextId] || { correct: 0, total: 0 };
                const isComplete = isCardComplete(vocabTextId, practiceLanguageId);

                return (
                  <div key={vocabTextId} className="border rounded-lg p-4 space-y-3 relative">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold">{vocabTitle}</h4>
                      {isComplete && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {/* Progress counter in top right */}
                    {cardProgress.total > 0 && (
                      <div className="absolute top-4 right-4 text-xs font-semibold text-green-600">
                        {cardProgress.correct}/{cardProgress.total}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {vocabSubtitle}
                    </p>
                    {expandedVocabId === vocabTextId ? (
                      <div className="space-y-2">
                        <Button
                          onClick={() => {
                            setActiveSection(vocabTextId);
                            setExpandedVocabId(null);
                          }}
                          className="w-full"
                          variant="default"
                        >
                          Reading
                        </Button>
                        <Button
                          onClick={() => {
                            handlePlayGame(vocabTextId);
                            setExpandedVocabId(null);
                          }}
                          className="w-full"
                          variant="outline"
                        >
                          Play Game
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setExpandedVocabId(vocabTextId)}
                        className="w-full"
                        variant={progress?.vocabSectionsPracticed?.includes(vocabTextId) ? "outline" : "default"}
                      >
                        {progress?.vocabSectionsPracticed?.includes(vocabTextId) ? 'Practice' : 'Start Practice'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              {hasPerVocabGrammar
                ? vocabTextIds.map((vocabTextId, index) => {
                    const grammarTextId = grammarTextIds?.[index] || module.grammarTextId;

                    if (!grammarTextId) {
                      return null;
                    }

                    const grammarText = getReadingTextById(grammarTextId, 'hebrew');
                    const grammarTitle = grammarText?.title?.en || `Grammar Part ${index + 1}`;
                    const grammarSubtitle = grammarText?.subtitle?.en || 'Practice grammar with vocabulary words';

                    const cardProgress = cardProgressMap[grammarTextId] || { correct: 0, total: 0 };
                    const isComplete = isCardComplete(grammarTextId, practiceLanguageId);

                    return (
                      <div key={grammarTextId} className="border rounded-lg p-4 space-y-3 relative">
                        <div className="flex items-center gap-2">
                          <Languages className="h-5 w-5 text-purple-600" />
                          <h4 className="font-semibold">{grammarTitle}</h4>
                          {isComplete && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        {/* Progress counter in top right */}
                        {cardProgress.total > 0 && (
                          <div className="absolute top-4 right-4 text-xs font-semibold text-green-600">
                            {cardProgress.correct}/{cardProgress.total}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {grammarSubtitle}
                        </p>
                        <Button
                          onClick={() => handleStartGrammar(grammarTextId)}
                          className="w-full"
                          variant={isComplete ? "outline" : "default"}
                        >
                          {isComplete ? 'Practice' : 'Start Grammar'}
                        </Button>
                      </div>
                    );
                  })
                : module.grammarTextId && (() => {
                    const cardProgress = cardProgressMap[module.grammarTextId] || { correct: 0, total: 0 };
                    const isComplete = isCardComplete(module.grammarTextId, practiceLanguageId);

                    return (
                      <div className="border rounded-lg p-4 space-y-3 relative">
                        <div className="flex items-center gap-2">
                          <Languages className="h-5 w-5 text-purple-600" />
                          <h4 className="font-semibold">Grammar</h4>
                          {isComplete && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        {/* Progress counter in top right */}
                        {cardProgress.total > 0 && (
                          <div className="absolute top-4 right-4 text-xs font-semibold text-green-600">
                            {cardProgress.correct}/{cardProgress.total}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Practice grammar with vocabulary words
                        </p>
                        <Button
                          onClick={() => handleStartGrammar(module.grammarTextId)}
                          className="w-full"
                          variant={isComplete ? "outline" : "default"}
                        >
                          {isComplete ? 'Practice' : 'Start Grammar'}
                        </Button>
                      </div>
                    );
                  })()}
            </div>
          </div>

          {/* Sentence Practice Section (Full Width Below) */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold">Sentence Reading</h4>
              {progress && progress.sentencesCompleted >= progress.totalSentences && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {progress ? `${progress.sentencesCompleted}/${progress.totalSentences}` : `${moduleSentences.length}`} sentences
            </p>
            <Button
              onClick={handleStartSentences}
              className="w-full"
              variant={
                progress && progress.sentencesCompleted >= progress.totalSentences
                  ? "outline"
                  : "default"
              }
            >
              {progress && progress.sentencesCompleted >= progress.totalSentences
                ? 'Practice'
                : 'Start Reading'}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Dictionary Modal */}
      <ModuleDictionaryModal
        module={module}
        isOpen={showDictionary}
        onClose={() => setShowDictionary(false)}
      />
    </Card>
  );
}
