/**
 * Translation Evaluation Utility
 *
 * Shared evaluation logic for comparing user input against expected text.
 * Used by sentence practice and conversation practice modules.
 */

/**
 * Normalize a word for comparison
 */
function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[.,!?;:'"()\[\]،؛]/g, '')
    .trim();
}

/**
 * Tokenize a sentence into normalized words
 */
function tokenizeSentence(sentence: string): string[] {
  return sentence
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean);
}

/**
 * Calculate longest common subsequence length (for order score)
 */
function longestCommonSubsequenceLength(a: string[], b: string[]): number {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[a.length][b.length];
}

export interface TranslationEvaluation {
  evaluations: Array<{ word: string; isMatch: boolean }>;
  status: 'correct' | 'partial' | 'incorrect';
  correctCount: number;
  total: number;
  contentScore: number;
  orderScore: number;
  blendedScore: number;
}

/**
 * Evaluate a user's translation against the correct answer
 *
 * Scoring:
 * - Content score: % of expected words present
 * - Order score: LCS / total words
 * - Blended: 70% content + 30% order
 *
 * Status:
 * - correct: >= 85%
 * - partial: >= 55%
 * - incorrect: < 55%
 */
export function evaluateTranslation(
  correctSentence: string,
  response: string
): TranslationEvaluation {
  const expectedWords = correctSentence.split(/\s+/);
  const expectedTokens = tokenizeSentence(correctSentence);
  const userTokens = tokenizeSentence(response);

  // Count expected tokens
  const tokenCounts: Record<string, number> = expectedTokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count matches
  let matchedCount = 0;
  const remainingCounts = { ...tokenCounts };

  userTokens.forEach((token) => {
    if (remainingCounts[token] > 0) {
      matchedCount += 1;
      remainingCounts[token] -= 1;
    }
  });

  // Calculate scores
  const contentScore = expectedTokens.length > 0 ? matchedCount / expectedTokens.length : 0;
  const orderScore = expectedTokens.length > 0
    ? longestCommonSubsequenceLength(expectedTokens, userTokens) / expectedTokens.length
    : 0;

  const blendedScore = (contentScore * 0.7) + (orderScore * 0.3);
  const status: 'correct' | 'partial' | 'incorrect' =
    blendedScore >= 0.85 ? 'correct' :
    blendedScore >= 0.55 ? 'partial' :
    'incorrect';

  // Create per-word evaluations
  const tempCounts = { ...tokenCounts };
  const evaluations = expectedWords.map((word) => {
    const token = normalizeWord(word);
    const isMatch = tempCounts[token] > 0;
    if (isMatch) {
      tempCounts[token] -= 1;
    }
    return { word, isMatch };
  });

  return {
    evaluations,
    status,
    correctCount: matchedCount,
    total: expectedTokens.length,
    contentScore,
    orderScore,
    blendedScore
  };
}

/**
 * Check if user input matches any of the acceptable variants
 */
export function matchesAnyVariant(
  userInput: string,
  acceptableVariants: string[]
): { matches: boolean; matchedVariant?: string } {
  const normalizedInput = normalizeWord(userInput);

  for (const variant of acceptableVariants) {
    const normalizedVariant = normalizeWord(variant);
    if (normalizedInput === normalizedVariant) {
      return { matches: true, matchedVariant: variant };
    }
  }

  return { matches: false };
}

/**
 * Evaluate with multiple acceptable answers (for pattern-based grading)
 */
export function evaluateWithVariants(
  acceptableAnswers: string[],
  response: string
): TranslationEvaluation | null {
  // First check for exact matches
  const exactMatch = matchesAnyVariant(response, acceptableAnswers);
  if (exactMatch.matches && exactMatch.matchedVariant) {
    return evaluateTranslation(exactMatch.matchedVariant, response);
  }

  // Otherwise, evaluate against the primary answer and take best score
  let bestEvaluation: TranslationEvaluation | null = null;

  for (const acceptableAnswer of acceptableAnswers) {
    const evaluation = evaluateTranslation(acceptableAnswer, response);

    if (!bestEvaluation || evaluation.blendedScore > bestEvaluation.blendedScore) {
      bestEvaluation = evaluation;
    }
  }

  return bestEvaluation;
}
