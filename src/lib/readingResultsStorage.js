/**
 * Reading Results Storage
 *
 * Manages persistence of reading exercise results for dictionary transaction colors
 */

const STORAGE_KEY = 'hebrewLetterRiver_readingResults';

/**
 * Get the overall grading color for a word based on its ghost sequence
 * Priority: bad > miss > extra > ok
 *
 * @param {Array} ghostSequence - Array of ghost characters with cls property
 * @returns {string} Color class ('ok', 'bad', 'miss', 'extra')
 */
function getOverallGradeColor(ghostSequence) {
  if (!ghostSequence || ghostSequence.length === 0) return 'ok';

  // Check for errors in priority order
  if (ghostSequence.some(g => g.cls === 'bad')) return 'bad';
  if (ghostSequence.some(g => g.cls === 'miss')) return 'miss';
  if (ghostSequence.some(g => g.cls === 'extra')) return 'extra';

  return 'ok';
}

/**
 * Save reading results to localStorage
 *
 * @param {string} sectionId - Section identifier ('cafeTalk', etc.)
 * @param {string} textId - Reading text ID
 * @param {string} practiceLanguageId - Practice language ID
 * @param {Array} results - Array of result objects with wordId and ghostSequence
 */
export function saveReadingResults(sectionId, textId, practiceLanguageId, results) {
  try {
    // Get existing results
    const allResults = getAllResults();

    // Ensure structure exists
    if (!allResults[practiceLanguageId]) {
      allResults[practiceLanguageId] = {};
    }
    if (!allResults[practiceLanguageId][sectionId]) {
      allResults[practiceLanguageId][sectionId] = {};
    }

    // Process and store results for each word
    results.forEach(result => {
      const wordId = result.wordId;
      if (!wordId) return;

      const gradeColor = getOverallGradeColor(result.ghostSequence);

      // Store the result with timestamp
      if (!allResults[practiceLanguageId][sectionId][wordId]) {
        allResults[practiceLanguageId][sectionId][wordId] = [];
      }

      allResults[practiceLanguageId][sectionId][wordId].push({
        textId,
        color: gradeColor,
        timestamp: Date.now(),
        isCorrect: gradeColor === 'ok'
      });

      // Keep only the last 10 attempts per word
      if (allResults[practiceLanguageId][sectionId][wordId].length > 10) {
        allResults[practiceLanguageId][sectionId][wordId] =
          allResults[practiceLanguageId][sectionId][wordId].slice(-10);
      }
    });

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allResults));
  } catch (error) {
    console.error('Error saving reading results:', error);
  }
}

/**
 * Get all stored reading results
 *
 * @returns {Object} All results organized by language/section/word
 */
function getAllResults() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading reading results:', error);
    return {};
  }
}

/**
 * Get the most recent grading color for a word
 *
 * @param {string} practiceLanguageId - Practice language ID
 * @param {string} sectionId - Section identifier
 * @param {string} wordId - Word identifier
 * @returns {string|null} Most recent color class or null if no history
 */
export function getWordGradeColor(practiceLanguageId, sectionId, wordId) {
  try {
    const allResults = getAllResults();
    const wordResults = allResults[practiceLanguageId]?.[sectionId]?.[wordId];

    if (!wordResults || wordResults.length === 0) {
      return null;
    }

    // Return the most recent result's color
    return wordResults[wordResults.length - 1].color;
  } catch (error) {
    console.error('Error getting word grade color:', error);
    return null;
  }
}

/**
 * Get transaction history for a word (all attempts)
 *
 * @param {string} practiceLanguageId - Practice language ID
 * @param {string} sectionId - Section identifier
 * @param {string} wordId - Word identifier
 * @returns {Array} Array of transaction objects
 */
export function getWordTransactions(practiceLanguageId, sectionId, wordId) {
  try {
    const allResults = getAllResults();
    return allResults[practiceLanguageId]?.[sectionId]?.[wordId] || [];
  } catch (error) {
    console.error('Error getting word transactions:', error);
    return [];
  }
}

/**
 * Clear all reading results (for testing or reset)
 */
export function clearAllResults() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing reading results:', error);
  }
}
