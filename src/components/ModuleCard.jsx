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

/**
 * ModuleCard - Displays a learning module with vocab, grammar, and sentences
 * Layout: Vocab (left) | Grammar (right)
 *         Sentences (bottom, full width)
 */
export default function ModuleCard({ module, isLocked, onModuleComplete }) {
  const [activeSection, setActiveSection] = useState(null); // 'grammar', 'sentences', or a vocab text ID
  const [progress, setProgress] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showDictionary, setShowDictionary] = useState(false);

  // Load progress on mount and ensure module is initialized
  useEffect(() => {
    let moduleProgress = getModuleProgress(module.id);
    if (!moduleProgress) {
      moduleProgress = initializeModuleProgress(
        module.id,
        module.sentenceIds.length,
        module.vocabTextIds.length
      );
    }
    setProgress(moduleProgress);
    setCompletionPercentage(getModuleCompletionPercentage(module.id));
  }, [module.id, module.sentenceIds.length, module.vocabTextIds.length]);

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

  const handleStartGrammar = () => {
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
  if (activeSection && module.vocabTextIds.includes(activeSection)) {
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
        textId={module.grammarTextId}
        onBack={handleGrammarComplete}
      />
    );
  }

  if (activeSection === 'sentences') {
    return (
      <div className="w-full space-y-4">
        <SentencePracticeArea
          theme={module.title}
          sentences={moduleSentences}
          onExit={handleBack}
        />
      </div>
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
          {/* Vocabulary Sections */}
          {module.vocabTextIds.map((vocabTextId, index) => (
            <div key={vocabTextId} className="grid gap-3 md:grid-cols-2">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold">Vocabulary Part {index + 1}</h4>
                  {progress?.vocabSectionsPracticed?.includes(vocabTextId) && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Practice vocabulary words
                </p>
                <Button
                  onClick={() => setActiveSection(vocabTextId)}
                  className="w-full"
                  variant={progress?.vocabSectionsPracticed?.includes(vocabTextId) ? "outline" : "default"}
                >
                  {progress?.vocabSectionsPracticed?.includes(vocabTextId) ? 'Review' : 'Start Practice'}
                </Button>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold">Grammar for Vocab Part {index + 1}</h4>
                  {progress?.grammarPracticed && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Uses repeated words from Vocabulary Part {index + 1} with this module's grammar pieces
                </p>
                <Button
                  onClick={handleStartGrammar}
                  className="w-full"
                  variant={progress?.grammarPracticed ? "outline" : "default"}
                >
                  {progress?.grammarPracticed ? 'Review Grammar' : 'Start Grammar'}
                </Button>
              </div>
            </div>
          ))}

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
                ? 'Review Sentences'
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
