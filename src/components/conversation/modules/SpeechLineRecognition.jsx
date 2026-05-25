import { useCallback, useMemo, useRef, useState } from 'react';
import SpeakButton from '../../SpeakButton.jsx';
import { useLocalization } from '../../../context/LocalizationContext.jsx';

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function normalizeSpeechText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[.,!?;:'"״׳()\[\]{}\-־]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value = '') {
  const normalized = normalizeSpeechText(value);
  return normalized ? normalized.split(' ') : [];
}

function scoreSpeech({ expected, transcript, alternates = [] }) {
  const expectedOptions = [expected, ...alternates].filter(Boolean);
  const spokenTokens = tokenize(transcript);

  if (!spokenTokens.length) {
    return {
      score: 0,
      resultType: 'incorrect',
      isCorrect: false,
      matchedWords: [],
      missingWords: tokenize(expected),
      extraWords: []
    };
  }

  let best = null;

  for (const option of expectedOptions) {
    const expectedTokens = tokenize(option);
    const unmatchedSpoken = [...spokenTokens];
    const matchedWords = [];
    const missingWords = [];

    for (const expectedToken of expectedTokens) {
      const matchIndex = unmatchedSpoken.indexOf(expectedToken);
      if (matchIndex >= 0) {
        matchedWords.push(expectedToken);
        unmatchedSpoken.splice(matchIndex, 1);
      } else {
        missingWords.push(expectedToken);
      }
    }

    const coverage = expectedTokens.length ? matchedWords.length / expectedTokens.length : 0;
    const extraPenalty = spokenTokens.length ? Math.min(unmatchedSpoken.length / spokenTokens.length, 0.25) : 0;
    const score = Math.max(0, coverage - extraPenalty);
    const candidate = {
      score,
      matchedWords,
      missingWords,
      extraWords: unmatchedSpoken,
      resultType: score >= 0.92 ? 'correct' : score >= 0.55 ? 'partial' : 'incorrect',
      isCorrect: score >= 0.92
    };

    if (!best || candidate.score > best.score) {
      best = candidate;
    }
  }

  return best;
}

export default function SpeechLineRecognition({ line, onResult }) {
  const { t } = useLocalization();
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const Recognition = useMemo(() => getSpeechRecognition(), []);
  const isSupported = Boolean(Recognition);

  const speechResult = useMemo(() => {
    return scoreSpeech({
      expected: line.he,
      transcript,
      alternates: line.acceptableVariants?.hebrew ?? []
    });
  }, [line, transcript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!Recognition || isListening || hasSubmitted) return;

    setErrorMessage('');
    setTranscript('');

    const recognition = new Recognition();
    recognition.lang = 'he-IL';
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const heard = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();
      setTranscript(heard);
    };

    recognition.onerror = (event) => {
      setErrorMessage(
        event.error === 'not-allowed'
          ? t('conversation.modules.speechLineRecognition.micBlocked', 'Microphone access was blocked. You can still skip this voice attempt.')
          : t('conversation.modules.speechLineRecognition.error', 'I could not hear that clearly. Try once more or skip for now.')
      );
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [Recognition, hasSubmitted, isListening, t]);

  const submitTranscript = useCallback(() => {
    if (hasSubmitted || !transcript.trim()) return;
    setHasSubmitted(true);
    stopListening();

    onResult({
      userResponse: t('conversation.modules.speechLineRecognition.heardResponse', 'Heard: {{transcript}}', { transcript }),
      isCorrect: speechResult.isCorrect,
      resultType: speechResult.resultType,
      suggestedAnswer: speechResult.isCorrect ? undefined : line.he,
      score: speechResult.score
    });
  }, [hasSubmitted, line.he, onResult, speechResult, stopListening, t, transcript]);

  const skipAttempt = useCallback(() => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    stopListening();

    onResult({
      userResponse: t('conversation.modules.speechLineRecognition.skipped', 'Skipped voice attempt'),
      isCorrect: false,
      resultType: 'partial',
      suggestedAnswer: line.he,
      score: 0
    });
  }, [hasSubmitted, line.he, onResult, stopListening, t]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 text-[#173d2e]">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2f6b4c]">
          {t('conversation.modules.speechLineRecognition.kicker', 'Voice warm-up')}
        </p>
        <h3 className="mt-1 text-xl font-bold text-[#183d2e]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
          {t('conversation.modules.speechLineRecognition.instruction', 'Say the line out loud')}
        </h3>
        <p className="mt-1 text-sm font-semibold text-[#4e665b]">
          {t('conversation.modules.speechLineRecognition.hint', 'Listen first, then press the mic and say the Hebrew sentence.')}
        </p>
      </div>

      <div className="relative rounded-[1.5rem] border border-[#d8cdb7] bg-white/75 p-4 text-center shadow-sm">
        <div className="absolute left-3 top-[5px]">
          <SpeakButton
            nativeText={line.he}
            nativeLocale="he-IL"
            transliteration={line.tl}
            variant="icon"
            className="!rounded-full !border-transparent !bg-transparent !p-2 !text-base !text-[#214d39] hover:!bg-transparent"
          />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6c7469]">
          {t('conversation.modules.speechLineRecognition.targetLabel', 'Target line')}
        </div>
        <div className="mt-2 text-3xl font-bold leading-tight text-[#183d2e]" dir="rtl">
          {line.he}
        </div>
      </div>

      {!isSupported && (
        <div className="rounded-2xl border border-[#c77912]/40 bg-[#fff3d9] p-3 text-sm font-semibold text-[#8a560f]">
          {t('conversation.modules.speechLineRecognition.unsupported', 'Voice recognition is not available in this browser yet. Use Skip for now, or try Chrome/Edge on a device with microphone access.')}
        </div>
      )}

      <div className="rounded-[1.5rem] border border-[#d8cdb7] bg-[#fffaf0]/92 p-4 shadow-sm">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported || hasSubmitted}
            className={`flex-1 rounded-2xl px-4 py-3 text-base font-bold text-white shadow-md transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 ${isListening ? 'bg-[#a06413]' : 'bg-[#2f6b4c]'}`}
          >
            {isListening
              ? t('conversation.modules.speechLineRecognition.stopListening', 'Stop listening')
              : t('conversation.modules.speechLineRecognition.startListening', 'Start speaking')}
          </button>
          <button
            type="button"
            onClick={skipAttempt}
            disabled={hasSubmitted}
            className="rounded-2xl border border-[#d8cdb7] bg-white px-4 py-3 text-sm font-bold text-[#4e665b] shadow-sm transition hover:bg-[#f8ead2] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {t('conversation.modules.speechLineRecognition.skip', 'Skip')}
          </button>
        </div>

        <div className="mt-3 min-h-[5rem] rounded-2xl border border-[#d8cdb7]/80 bg-white/70 p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6c7469]">
            {t('conversation.modules.speechLineRecognition.heardLabel', 'I heard')}
          </div>
          <div className="mt-1 text-lg font-bold text-[#183d2e]" dir="auto">
            {transcript || (isListening
              ? t('conversation.modules.speechLineRecognition.listening', 'Listening...')
              : t('conversation.modules.speechLineRecognition.emptyTranscript', 'Your spoken line will appear here.'))}
          </div>
        </div>

        {errorMessage && (
          <div className="mt-3 rounded-2xl border border-[#c77912]/40 bg-[#fff3d9] p-3 text-sm font-semibold text-[#8a560f]">
            {errorMessage}
          </div>
        )}

        {transcript && !hasSubmitted && (
          <div className="mt-3 rounded-2xl border border-[#d8cdb7] bg-white/70 p-3 text-sm text-[#4e665b]">
            <div className="font-bold text-[#183d2e]">
              {speechResult.resultType === 'correct'
                ? t('conversation.modules.speechLineRecognition.matchGood', 'This sounds like a match.')
                : speechResult.resultType === 'partial'
                  ? t('conversation.modules.speechLineRecognition.matchPartial', 'Close. Some words may be missing.')
                  : t('conversation.modules.speechLineRecognition.matchLow', 'That does not look close yet.')}
            </div>
            {speechResult.missingWords.length > 0 && (
              <div className="mt-1">
                {t('conversation.modules.speechLineRecognition.missingWords', 'Missing: {{words}}', { words: speechResult.missingWords.join(' · ') })}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={submitTranscript}
          disabled={!transcript.trim() || hasSubmitted}
          className="mt-3 flex w-full items-center justify-center rounded-2xl px-5 py-3 text-base font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
          style={{ background: 'linear-gradient(180deg, #d98818, #b96a10)', boxShadow: '0 12px 28px rgba(175, 101, 14, 0.22)' }}
        >
          {t('conversation.modules.speechLineRecognition.submit', 'Use this answer')}
        </button>
      </div>
    </div>
  );
}
