import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronRight, Volume2 } from 'lucide-react';

/**
 * GrammarCard - Displays a grammar pattern with examples
 * User reviews the pattern and examples, then marks as understood
 */
export default function GrammarCard({ grammar, onComplete }) {
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const currentExample = grammar.examples[currentExampleIndex];
  const isLastExample = currentExampleIndex === grammar.examples.length - 1;

  const handleNext = () => {
    if (isLastExample) {
      if (onComplete) {
        onComplete(grammar.id);
      }
      // Reset for next grammar pattern
      setCurrentExampleIndex(0);
      setShowTranslation(false);
    } else {
      setCurrentExampleIndex(currentExampleIndex + 1);
      setShowTranslation(false);
    }
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Grammar Pattern Name */}
          <div className="text-center">
            <h3 className="text-2xl font-bold">{grammar.name}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {grammar.description}
            </p>
          </div>

          {/* Example Counter */}
          <div className="text-center text-sm text-muted-foreground">
            Example {currentExampleIndex + 1} of {grammar.examples.length}
          </div>

          {/* Current Example */}
          <div className="space-y-4">
            {/* Hebrew Example */}
            <div className="flex items-center justify-center gap-2 p-4 bg-secondary rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSpeak(currentExample.hebrew)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <p className="text-2xl font-semibold" dir="rtl">
                {currentExample.hebrew}
              </p>
            </div>

            {/* Translation Toggle */}
            {!showTranslation ? (
              <Button
                onClick={() => setShowTranslation(true)}
                variant="outline"
                className="w-full"
              >
                Show Translation
              </Button>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-lg text-center">
                  {currentExample.english}
                </p>
                {currentExample.highlightedWord && (
                  <p className="text-sm text-center text-muted-foreground mt-2">
                    Key word: <span className="font-semibold">{currentExample.highlightedWord}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mt-4">
            {showTranslation && (
              <Button onClick={handleNext} className="flex-1">
                {isLastExample ? 'Complete' : 'Next Example'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-1 justify-center">
            {grammar.examples.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentExampleIndex
                    ? 'bg-primary'
                    : index < currentExampleIndex
                    ? 'bg-primary/50'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
