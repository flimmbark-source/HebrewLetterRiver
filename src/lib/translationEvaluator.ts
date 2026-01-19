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
 * Calculate Levenshtein distance (edit distance) between two strings
 * Returns both the distance and the diff matrix for traceback
 */
function levenshteinDistanceWithMatrix(a: string, b: string): { distance: number; matrix: number[][] } {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return { distance: matrix[b.length][a.length], matrix };
}

/**
 * Calculate Levenshtein distance (edit distance) between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  return levenshteinDistanceWithMatrix(a, b).distance;
}

/**
 * Generate character-level diff showing which characters in the correct answer differ from user input
 */
function generateCharDiff(correct: string, userInput: string): CharDiff[] {
  const { matrix } = levenshteinDistanceWithMatrix(correct, userInput);
  const diff: CharDiff[] = [];

  let i = userInput.length;
  let j = correct.length;

  // Traceback to find the actual differences
  while (i > 0 || j > 0) {
    if (i === 0) {
      // Remaining characters in correct were deleted from user input
      diff.unshift({ char: correct[j - 1], type: 'delete' });
      j--;
    } else if (j === 0) {
      // User inserted extra characters (we skip these in correct answer display)
      i--;
    } else if (userInput[i - 1] === correct[j - 1]) {
      // Characters match
      diff.unshift({ char: correct[j - 1], type: 'match' });
      i--;
      j--;
    } else {
      // Find which operation was used
      const substituteCost = matrix[i - 1][j - 1];
      const insertCost = matrix[i][j - 1];
      const deleteCost = matrix[i - 1][j];
      const minCost = Math.min(substituteCost, insertCost, deleteCost);

      if (minCost === substituteCost) {
        // Substitution
        diff.unshift({ char: correct[j - 1], type: 'substitute' });
        i--;
        j--;
      } else if (minCost === deleteCost) {
        // Deletion (character missing in user input)
        diff.unshift({ char: correct[j - 1], type: 'delete' });
        j--;
      } else {
        // Insertion (extra character in user input)
        i--;
      }
    }
  }

  return diff;
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

export interface CharDiff {
  char: string;
  type: 'match' | 'insert' | 'delete' | 'substitute';
}

export interface TranslationEvaluation {
  evaluations: Array<{ word: string; isMatch: boolean }>;
  status: 'correct' | 'partial' | 'incorrect';
  correctCount: number;
  total: number;
  contentScore: number;
  orderScore: number;
  blendedScore: number;
  charDiff?: CharDiff[];
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

  // Check character-level edit distance for lenient grading
  // Normalize both strings by removing all whitespace and punctuation
  const normalizedCorrect = correctSentence.toLowerCase().replace(/[\s.,!?;:'"()\[\]،؛-]/g, '');
  const normalizedResponse = response.toLowerCase().replace(/[\s.,!?;:'"()\[\]،؛-]/g, '');
  const editDistance = levenshteinDistance(normalizedCorrect, normalizedResponse);

  // If edit distance is 2 or less, consider it correct (lenient grading)
  // Otherwise use the percentage-based thresholds
  const status: 'correct' | 'partial' | 'incorrect' =
    editDistance <= 2 ? 'correct' :
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

  // Generate character-level diff for highlighting mistakes
  const charDiff = generateCharDiff(correctSentence, response);

  return {
    evaluations,
    status,
    correctCount: matchedCount,
    total: expectedTokens.length,
    contentScore,
    orderScore,
    blendedScore,
    charDiff
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
