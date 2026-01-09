#!/usr/bin/env node

/**
 * Generate flexible sentence patterns for all sentences using Claude API
 *
 * This script:
 * 1. Reads all sentences from the data file
 * 2. Uses Claude to generate natural variations for each sentence
 * 3. Creates patterns with {alternative1, alternative2} syntax
 * 4. Outputs updated TypeScript code
 *
 * Usage:
 *   ANTHROPIC_API_KEY=your_key node scripts/generateSentencePatterns.js
 *
 * Or set the API key in a .env file
 */

import Anthropic from '@anthropic-ai/sdk';
import { allSentences } from '../src/data/sentences/index.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Anthropic client
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('Error: ANTHROPIC_API_KEY environment variable not set');
  console.error('Usage: ANTHROPIC_API_KEY=your_key node scripts/generateSentencePatterns.js');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey });

/**
 * Generate a pattern for a single sentence using Claude
 */
async function generatePattern(sentence) {
  const prompt = `You are helping create flexible grading patterns for English sentences in a language learning app.

Given this English sentence: "${sentence.english}"

Generate a pattern that captures natural variations a learner might type. Use this syntax:
- {option1, option2, option3} for alternatives at a specific position
- Plain text for words that must appear exactly

Guidelines:
1. Include contraction variations (I'm vs I am, you're vs you are, it's vs it is, etc.)
2. Include common synonym variations (Hi vs Hello, thanks vs thank you, etc.)
3. Include article variations where natural (the X vs X)
4. Include common phrasings (nice to meet you vs nice meeting you)
5. Keep alternatives natural - don't include grammatically incorrect options
6. Don't make every word optional - focus on genuinely interchangeable alternatives
7. Names and most nouns should stay as plain text (not alternatives)

Examples of good patterns:
- "{Hi, Hello}, {I'm, I am} Dani, {nice to meet you, nice meeting you, it's nice to meet you}."
- "{Where are you from, Where do you come from}? {I am, I'm} new in the city."
- "{Thanks, Thank you} for coming today, we were waiting for you."

Current sentence: "${sentence.english}"
${sentence.pattern ? `Existing pattern: "${sentence.pattern}"\n(You can improve or expand this if needed)` : ''}

Respond with ONLY the pattern string, nothing else. No explanations, no quotes around it, just the pattern.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const pattern = message.content[0].text.trim();
    // Remove surrounding quotes if present
    return pattern.replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error(`Error generating pattern for "${sentence.english}":`, error.message);
    return null;
  }
}

/**
 * Process all sentences and generate patterns
 */
async function generateAllPatterns() {
  console.log(`Processing ${allSentences.length} sentences...\n`);

  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < allSentences.length; i++) {
    const sentence = allSentences[i];
    const progress = `[${i + 1}/${allSentences.length}]`;

    console.log(`${progress} Processing: ${sentence.id}`);
    console.log(`  English: ${sentence.english}`);
    if (sentence.pattern) {
      console.log(`  Has existing pattern: ${sentence.pattern.substring(0, 60)}...`);
    }

    const pattern = await generatePattern(sentence);

    if (pattern) {
      console.log(`  ✓ Generated: ${pattern.substring(0, 80)}${pattern.length > 80 ? '...' : ''}`);
      results.push({
        ...sentence,
        pattern
      });
      successCount++;
    } else {
      console.log(`  ✗ Failed to generate pattern`);
      results.push(sentence);
      errorCount++;
    }

    console.log('');

    // Rate limiting: wait 1 second between requests
    if (i < allSentences.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\nCompleted: ${successCount} successful, ${errorCount} errors`);
  return results;
}

/**
 * Format results as TypeScript code
 */
function formatAsTypeScript(results) {
  const sentencesByTheme = {};

  // Group sentences by theme
  results.forEach(sentence => {
    if (!sentencesByTheme[sentence.theme]) {
      sentencesByTheme[sentence.theme] = [];
    }
    sentencesByTheme[sentence.theme].push(sentence);
  });

  let output = '';

  // Generate TypeScript code for each theme
  for (const [theme, sentences] of Object.entries(sentencesByTheme)) {
    output += `  '${theme}': [\n`;

    sentences.forEach((sentence, idx) => {
      output += `    createSentence({\n`;
      output += `      id: '${sentence.id}',\n`;
      output += `      hebrew: '${sentence.hebrew}',\n`;
      output += `      english: "${sentence.english}",\n`;
      if (sentence.pattern) {
        // Escape quotes in pattern
        const escapedPattern = sentence.pattern.replace(/"/g, '\\"');
        output += `      pattern: "${escapedPattern}",\n`;
      }
      output += `      theme: '${sentence.theme}',\n`;
      output += `      difficulty: ${sentence.difficulty},\n`;
      output += `      grammarPoints: [${sentence.grammarPoints.map(g => `'${g}'`).join(', ')}]\n`;
      output += `    })${idx < sentences.length - 1 ? ',' : ''}\n`;
    });

    output += `  ],\n`;
  }

  return output;
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(80));
  console.log('Sentence Pattern Generator');
  console.log('='.repeat(80));
  console.log('');

  const results = await generateAllPatterns();

  // Save results to file
  const outputPath = path.join(__dirname, 'generated-patterns.txt');
  const typescript = formatAsTypeScript(results);

  fs.writeFileSync(outputPath, typescript, 'utf-8');
  console.log(`\n✓ Results saved to: ${outputPath}`);
  console.log('\nYou can now copy this content into src/data/sentences/index.ts');
  console.log('to replace the sentencesByTheme object contents.');

  // Also save as JSON for reference
  const jsonPath = path.join(__dirname, 'generated-patterns.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`✓ JSON backup saved to: ${jsonPath}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
