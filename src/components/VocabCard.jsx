import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Check, X, Volume2 } from 'lucide-react';

/**
 * VocabCard - Displays a single vocabulary word for practice
 * User sees the Hebrew word and must recall/type the meaning
 */
export default function VocabCard({ vocab, onComplete }) {
  const [showMeaning, setShowMeaning] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  const handleReveal = () => {
    setShowMeaning(true);
  };

  const handleCheck = () => {
    const normalized = userInput.trim().toLowerCase();
    const correct = vocab.meaning.toLowerCase().includes(normalized) ||
                    normalized.includes(vocab.meaning.toLowerCase());
    setIsCorrect(correct);
  };

  const handleNext = () => {
    if (onComplete) {
      onComplete(vocab.id);
    }
    // Reset for next word
    setShowMeaning(false);
    setUserInput('');
    setIsCorrect(null);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(vocab.hebrew);
      utterance.lang = 'he-IL';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Hebrew Word Display */}
          <div className="flex items-center gap-2">
            <h2 className="text-4xl font-bold" dir="rtl">
              {vocab.hebrew}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeak}
              className="ml-2"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Part of Speech */}
          {vocab.partOfSpeech && (
            <span className="text-sm text-muted-foreground">
              {vocab.partOfSpeech}
            </span>
          )}

          {/* Input or Reveal */}
          {!showMeaning ? (
            <div className="w-full space-y-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (userInput.trim()) {
                      handleCheck();
                    } else {
                      handleReveal();
                    }
                  }
                }}
                placeholder="Type the meaning..."
                className="w-full p-3 border rounded-md text-center"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCheck}
                  disabled={!userInput.trim()}
                  className="flex-1"
                >
                  Check
                </Button>
                <Button
                  onClick={handleReveal}
                  variant="outline"
                  className="flex-1"
                >
                  Reveal
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4">
              {/* Meaning Display */}
              <div className="p-4 bg-secondary rounded-md">
                <p className="text-xl text-center font-semibold">
                  {vocab.meaning}
                </p>
              </div>

              {/* Feedback if user tried to answer */}
              {isCorrect !== null && (
                <div className={`flex items-center justify-center gap-2 p-3 rounded-md ${
                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isCorrect ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5" />
                      <span>Not quite - keep practicing!</span>
                    </>
                  )}
                </div>
              )}

              <Button onClick={handleNext} className="w-full">
                Next
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
