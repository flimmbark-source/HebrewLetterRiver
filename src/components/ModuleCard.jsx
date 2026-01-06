import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Lock, Check, BookOpen, Languages, MessageSquare } from 'lucide-react';
import VocabCard from './VocabCard';
import GrammarCard from './GrammarCard';
import SentencePracticeArea from './SentencePracticeArea';
import {
  getModuleProgress,
  markVocabPracticed,
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
  const [activeSection, setActiveSection] = useState(null); // 'vocab', 'grammar', or 'sentences'
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const [currentGrammarIndex, setCurrentGrammarIndex] = useState(0);
  const [progress, setProgress] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Load progress on mount and ensure module is initialized
  useEffect(() => {
    let moduleProgress = getModuleProgress(module.id);
    if (!moduleProgress) {
      moduleProgress = initializeModuleProgress(module.id, module.sentenceIds.length);
    }
    setProgress(moduleProgress);
    setCompletionPercentage(getModuleCompletionPercentage(module.id));
  }, [module.id, module.sentenceIds.length]);

  // Get sentences for this module
  const moduleSentences = allSentences.filter(s =>
    module.sentenceIds.includes(s.id)
  );

  const handleVocabComplete = (vocabId) => {
    const nextIndex = currentVocabIndex + 1;
    if (nextIndex >= module.vocab.length) {
      // All vocab practiced
      markVocabPracticed(module.id);
      setActiveSection(null);
      updateProgress();
    } else {
      setCurrentVocabIndex(nextIndex);
    }
  };

  const handleGrammarComplete = (grammarId) => {
    const nextIndex = currentGrammarIndex + 1;
    if (nextIndex >= module.grammar.length) {
      // All grammar practiced
      markGrammarPracticed(module.id);
      setActiveSection(null);
      updateProgress();
    } else {
      setCurrentGrammarIndex(nextIndex);
    }
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

  const handleStartVocab = () => {
    setCurrentVocabIndex(0);
    setActiveSection('vocab');
  };

  const handleStartGrammar = () => {
    setCurrentGrammarIndex(0);
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

  // Render active practice session
  if (activeSection === 'vocab') {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {module.title} - Vocabulary
          </h3>
          <Button onClick={handleBack} variant="outline">
            Back to Module
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Word {currentVocabIndex + 1} of {module.vocab.length}
        </p>
        <VocabCard
          vocab={module.vocab[currentVocabIndex]}
          onComplete={handleVocabComplete}
        />
      </div>
    );
  }

  if (activeSection === 'grammar') {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {module.title} - Grammar
          </h3>
          <Button onClick={handleBack} variant="outline">
            Back to Module
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Pattern {currentGrammarIndex + 1} of {module.grammar.length}
        </p>
        <GrammarCard
          grammar={module.grammar[currentGrammarIndex]}
          onComplete={handleGrammarComplete}
        />
      </div>
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
          <div>
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
          <div className="text-sm font-semibold text-primary">
            {completionPercentage}% Complete
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Vocab and Grammar Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vocabulary Section */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Vocabulary</h4>
                {progress?.vocabPracticed && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {module.vocab.length} words to learn
              </p>
              <Button
                onClick={handleStartVocab}
                className="w-full"
                variant={progress?.vocabPracticed ? "outline" : "default"}
              >
                {progress?.vocabPracticed ? 'Review Vocab' : 'Start Vocab'}
              </Button>
            </div>

            {/* Grammar Section */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold">Grammar</h4>
                {progress?.grammarPracticed && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {module.grammar.length} patterns to learn
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
    </Card>
  );
}
