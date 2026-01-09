/**
 * Tests for pattern matching utility
 */

import { matchesPattern, getCanonicalFromPattern } from './patternMatcher.js';

// Test basic pattern matching
console.log('Testing pattern matching...\n');

// Test 1: Simple alternatives
const pattern1 = "{Hi, Hello}, {I'm, I am} Dani.";
console.log('Pattern 1:', pattern1);
console.log('  "Hi, I\'m Dani." should match:', matchesPattern("Hi, I'm Dani.", pattern1)); // true
console.log('  "Hello, I am Dani." should match:', matchesPattern("Hello, I am Dani.", pattern1)); // true
console.log('  "Hi, I am Dani." should match:', matchesPattern("Hi, I am Dani.", pattern1)); // true
console.log('  "Hello, I\'m Dani." should match:', matchesPattern("Hello, I'm Dani.", pattern1)); // true
console.log('  "Hey, I\'m Dani." should NOT match:', matchesPattern("Hey, I'm Dani.", pattern1)); // false
console.log('');

// Test 2: More complex pattern from the actual sentences
const pattern2 = "{Hi, Hello}, {I'm, I am} Dani, {nice to meet you, nice meeting you, it's nice to meet you}.";
console.log('Pattern 2:', pattern2);
console.log('  "Hi, I\'m Dani, nice to meet you." should match:', matchesPattern("Hi, I'm Dani, nice to meet you.", pattern2)); // true
console.log('  "Hello, I am Dani, nice meeting you." should match:', matchesPattern("Hello, I am Dani, nice meeting you.", pattern2)); // true
console.log('  "Hi, I\'m Dani, it\'s nice to meet you." should match:', matchesPattern("Hi, I'm Dani, it's nice to meet you.", pattern2)); // true
console.log('  "Hello, I am Dani, nice to meet you." should match:', matchesPattern("Hello, I am Dani, nice to meet you.", pattern2)); // true
console.log('');

// Test 3: Case insensitivity
const pattern3 = "{Hi, Hello} there";
console.log('Pattern 3:', pattern3);
console.log('  "hi there" should match:', matchesPattern("hi there", pattern3)); // true
console.log('  "HELLO THERE" should match:', matchesPattern("HELLO THERE", pattern3)); // true
console.log('  "Hi There" should match:', matchesPattern("Hi There", pattern3)); // true
console.log('');

// Test 4: Extra whitespace and punctuation handling
console.log('Pattern 1 (with extra whitespace and punctuation):');
console.log('  "Hi,  I\'m   Dani." should match:', matchesPattern("Hi,  I'm   Dani.", pattern1)); // true
console.log('  "Hi, I\'m Dani" (no period) should match:', matchesPattern("Hi, I'm Dani", pattern1)); // true
console.log('  "Hi I\'m Dani" (no comma) should match:', matchesPattern("Hi I'm Dani", pattern1)); // true (punctuation optional)
console.log('  "Hi Im Dani" (no punctuation at all) should match:', matchesPattern("Hi Im Dani", pattern1)); // true
console.log('');

// Test 5: Canonical extraction
console.log('Canonical extraction:');
console.log('  Pattern 1 canonical:', getCanonicalFromPattern(pattern1)); // "Hi, I'm Dani."
console.log('  Pattern 2 canonical:', getCanonicalFromPattern(pattern2)); // "Hi, I'm Dani, nice to meet you."
console.log('');

// Test 6: Pattern from greetings-2
const pattern4 = "{Where are you from, Where do you come from}? {I am, I'm} new in the city.";
console.log('Pattern 4:', pattern4);
console.log('  "Where are you from? I am new in the city." should match:', matchesPattern("Where are you from? I am new in the city.", pattern4)); // true
console.log('  "Where do you come from? I\'m new in the city." should match:', matchesPattern("Where do you come from? I'm new in the city.", pattern4)); // true
console.log('');

// Test 7: User's specific case
console.log('Test user\'s specific case:');
console.log('  "hello I\'m Dani, nice to meet you" should match pattern 2:', matchesPattern("hello I'm Dani, nice to meet you", pattern2)); // true
console.log('  "hello Im Dani nice to meet you" (no punctuation) should match:', matchesPattern("hello Im Dani nice to meet you", pattern2)); // true
console.log('');

console.log('All tests completed!');
