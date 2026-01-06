# Spaced Repetition System (SRS) Usage Guide

This guide explains how to use the SRS system implemented in the Hebrew Letter River app.

## Overview

The SRS system implements the **SM-2 (SuperMemo 2) algorithm**, which optimizes learning by scheduling reviews at increasing intervals based on how well you recall information. This scientifically-backed approach minimizes study time while maximizing long-term retention.

## Core Concepts

### Response Quality Grades (0-5 scale)

```javascript
import { GRADE } from './context/SRSContext';

GRADE.AGAIN      // 0 - Complete blackout, wrong response
GRADE.HARD       // 1 - Correct but with serious difficulty
GRADE.HARD_PLUS  // 2 - Correct after hesitation
GRADE.GOOD       // 3 - Correct with some effort
GRADE.GOOD_PLUS  // 4 - Correct after brief hesitation
GRADE.EASY       // 5 - Perfect, immediate recall
```

### Item Maturity Levels

```javascript
import { MATURITY } from './context/SRSContext';

MATURITY.NEW       // Never reviewed (interval = 0)
MATURITY.LEARNING  // In learning phase (interval < 21 days)
MATURITY.YOUNG     // Young mature (21 ≤ interval < 100 days)
MATURITY.MATURE    // Mature (interval ≥ 100 days)
```

## Using the SRS System

### 1. Basic Setup

```javascript
import { useSRS } from './context/SRSContext';

function MyComponent() {
  const {
    addItem,
    reviewItem,
    getDailyQueue,
    getItemStats,
    GRADE,
    MATURITY
  } = useSRS();

  // Component logic...
}
```

### 2. Adding Items to SRS

```javascript
// Add a letter to the SRS system
addItem('aleph', 'letter');

// Add vocabulary
addItem('shalom', 'vocabulary');

// Add grammar concept
addItem('present-tense', 'grammar');
```

### 3. Getting Daily Review Queue

```javascript
// Get prioritized review queue
const { queue, stats, hasOverflow } = getDailyQueue({
  includeNew: true,      // Include new items
  maxReviews: 100,       // Max reviews (default: 200)
  maxNew: 10             // Max new items (default: 20)
});

console.log(queue);       // Array of items to review
console.log(stats);       // Statistics about the queue
console.log(hasOverflow); // true if more items available

// Queue statistics structure:
// {
//   totalDue: 45,              // Total items due for review
//   totalNew: 12,              // Total new items available
//   queueSize: 55,             // Items in current queue
//   overdueCount: 8,           // Items overdue by >1 day
//   byType: {
//     letter: 30,
//     vocabulary: 20,
//     grammar: 5
//   },
//   byMaturity: {
//     new: 10,
//     learning: 25,
//     young: 15,
//     mature: 5
//   }
// }
```

### 4. Processing Reviews

```javascript
// When user reviews an item
function handleReview(itemId, itemType, userGrade) {
  const updatedItem = reviewItem(itemId, itemType, userGrade);

  console.log('Next review in:', updatedItem.interval, 'days');
  console.log('Due date:', new Date(updatedItem.dueDate));
}

// Examples:
handleReview('aleph', 'letter', GRADE.EASY);      // Perfect recall
handleReview('bet', 'letter', GRADE.GOOD);        // Correct with effort
handleReview('gimel', 'letter', GRADE.AGAIN);     // Failed (resets to interval 0)
```

### 5. Getting Item Statistics

```javascript
const stats = getItemStats('aleph', 'letter');

console.log(stats);
// {
//   maturity: 'learning',    // Current maturity level
//   successRate: 85,         // Success rate (0-100%)
//   totalReviews: 10,        // Total times reviewed
//   lapseCount: 2,           // Number of failures
//   currentStreak: 5,        // Current success streak
//   avgRecentGrade: 4.2,     // Average of recent grades
//   nextReviewIn: 3          // Days until next review
// }
```

### 6. Getting Review Forecast

```javascript
// Get 7-day forecast of upcoming reviews
const forecast = getForecast(7);

forecast.forEach(day => {
  console.log(`Day ${day.day} (${day.date.toDateString()}): ${day.dueCount} reviews`);
});

// Output:
// Day 0 (Mon Jan 06 2025): 15 reviews
// Day 1 (Tue Jan 07 2025): 23 reviews
// Day 2 (Wed Jan 08 2025): 18 reviews
// ...
```

### 7. Querying Items

```javascript
// Get due items by type
const dueLetters = getDueItems('letter', 20);
const dueVocab = getDueItems('vocabulary', 20);
const allDue = getDueItems('all', 50);

// Get new items
const newLetters = getNewItems('letter', 10);

// Get specific item
const item = getItem('aleph', 'letter');

// Check if item is due
const isDue = isItemDue('aleph', 'letter');

// Get item maturity
const maturity = getItemMaturity('aleph', 'letter');
```

### 8. Managing Settings

```javascript
// Update SRS settings
updateSettings({
  newCardsPerDay: 25,       // New items per day
  reviewsPerDay: 150,       // Max reviews per day
  enabled: true             // Enable/disable SRS
});
```

## Algorithm Details

### SM-2 Formula

The ease factor is calculated using:

```
EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
```

Where:
- `EF` = Current ease factor
- `q` = Response quality (0-5)
- `EF'` = New ease factor (minimum 1.3)

### Interval Progression

1. **First successful review**: 1 day
2. **Second successful review**: 6 days
3. **Subsequent reviews**: `previous_interval * ease_factor`
4. **Failed review (grade < 3)**: Reset to 0 (review immediately)
5. **Hard review (grade = 3)**: `interval * 1.2` (conservative increase)
6. **Easy review (grade = 5)**: `interval * ease_factor * 1.3` (bonus)

### Priority Sorting

Queue items are sorted by priority score:

```
Priority = (overdue_days × 10) + item_type_weight + maturity_weight
```

Weights:
- **Item Type**: Letters (30) > Vocabulary (20) > Grammar (10)
- **Maturity**: Learning (15) > Young (10) > New (5) > Mature (5)

## Event System

The SRS system emits events for integration with other parts of the app:

```javascript
import { on } from './lib/eventBus';

// Listen to SRS events
on('srs:item-added', ({ itemId, itemType, languageId }) => {
  console.log('Item added:', itemId);
});

on('srs:item-reviewed', ({ itemId, grade, newInterval, maturity }) => {
  console.log('Item reviewed:', itemId, 'Grade:', grade);
  console.log('Next review in:', newInterval, 'days');
});

on('srs:settings-updated', ({ settings }) => {
  console.log('Settings updated:', settings);
});
```

## Example: Complete Review Session Component

```javascript
import React, { useState, useEffect } from 'react';
import { useSRS } from './context/SRSContext';

function ReviewSession() {
  const { getDailyQueue, reviewItem, GRADE } = useSRS();
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const { queue: items, stats: queueStats } = getDailyQueue({
      includeNew: true,
      maxReviews: 20
    });
    setQueue(items);
    setStats(queueStats);
  }, [getDailyQueue]);

  const currentItem = queue[currentIndex];

  const handleGrade = (grade) => {
    reviewItem(currentItem.itemId, currentItem.itemType, grade);

    // Move to next item
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Session complete!
      alert('Review session complete!');
    }
  };

  if (!currentItem) {
    return <div>No items to review!</div>;
  }

  return (
    <div>
      <h2>Review Session</h2>
      <p>Progress: {currentIndex + 1} / {queue.length}</p>
      <p>Due Today: {stats?.totalDue}</p>

      <div className="flashcard">
        <h1>{currentItem.itemId}</h1>
      </div>

      <div className="buttons">
        <button onClick={() => handleGrade(GRADE.AGAIN)}>
          Again (0)
        </button>
        <button onClick={() => handleGrade(GRADE.HARD)}>
          Hard (1)
        </button>
        <button onClick={() => handleGrade(GRADE.GOOD)}>
          Good (3)
        </button>
        <button onClick={() => handleGrade(GRADE.EASY)}>
          Easy (5)
        </button>
      </div>
    </div>
  );
}
```

## Running Tests

The SRS engine includes comprehensive unit tests:

```bash
# Run all tests
npm test

# Run SRS engine tests specifically
npm test SRSEngine.test.js

# Watch mode for development
npm test -- --watch
```

Test coverage includes:
- ✅ SM-2 formula accuracy
- ✅ Interval calculation
- ✅ Ease factor adjustments
- ✅ Priority sorting
- ✅ Queue management
- ✅ Statistics calculation
- ✅ Edge cases and error handling
- ✅ Full review cycle integration tests

## Best Practices

1. **Daily Review Habit**: Reviews are most effective when done daily at consistent times

2. **Honest Grading**: Be honest with grades - the algorithm adapts to your actual performance

3. **New Item Pacing**: Don't add too many new items at once (20/day is a good default)

4. **Review Limit**: Keep daily reviews manageable (100-200 is sustainable)

5. **Failed Reviews**: Don't worry about failures - they're part of the learning process and help the algorithm

6. **Maturity Tracking**: Watch items progress from NEW → LEARNING → YOUNG → MATURE

## Architecture

```
┌─────────────────┐
│   Components    │ (ReviewSession, Dashboard, etc.)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   SRSContext    │ (React Context for state management)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   SRSEngine     │ (SM-2 algorithm implementation)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   IndexedDB     │ (Persistent storage)
└─────────────────┘
```

## References

- [SuperMemo SM-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- [Spaced Repetition Research](https://en.wikipedia.org/wiki/Spaced_repetition)
- Original paper: Wozniak, P. A. (1990). *Optimization of learning*

---

**Need Help?** Check the unit tests in `src/lib/SRSEngine.test.js` for more usage examples.
