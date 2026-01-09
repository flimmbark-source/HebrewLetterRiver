# Sentence Pattern Generator

This script automatically generates flexible grading patterns for all sentences using Claude AI.

## Purpose

The pattern generator creates `{alternative1, alternative2}` syntax patterns that allow the grading system to accept multiple valid variations of the same sentence. This makes grading more lenient and natural.

## Setup

1. Get an Anthropic API key from https://console.anthropic.com/

2. Set your API key as an environment variable:
   ```bash
   export ANTHROPIC_API_KEY=your_api_key_here
   ```

   Or create a `.env` file in the project root:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

## Usage

```bash
# From the project root
ANTHROPIC_API_KEY=your_key node scripts/generateSentencePatterns.js
```

Or if you've set the API key in your environment:
```bash
node scripts/generateSentencePatterns.js
```

## What It Does

1. **Reads all sentences** from `src/data/sentences/index.ts`
2. **For each sentence**, asks Claude to generate natural variations, including:
   - Contraction alternatives (I'm vs I am)
   - Synonym alternatives (Hi vs Hello)
   - Common phrasings (nice to meet you vs nice meeting you)
3. **Enhances existing patterns** - sentences that already have patterns will be reviewed and potentially improved
4. **Outputs results** to `scripts/generated-patterns.txt` as TypeScript code
5. **Creates backup** as `scripts/generated-patterns.json`

## Output

The script generates two files:

- `scripts/generated-patterns.txt` - TypeScript code ready to copy into the sentences file
- `scripts/generated-patterns.json` - JSON backup for reference

## After Running

1. Review the generated patterns in `scripts/generated-patterns.txt`
2. Copy the content and replace the `sentencesByTheme` object in `src/data/sentences/index.ts`
3. Test the patterns to ensure they work as expected
4. Commit the changes

## Rate Limiting

The script waits 1 second between API calls to avoid rate limiting. Processing all ~40+ sentences takes about 1 minute.

## Cost

Using Claude 3.5 Sonnet, each sentence pattern generation costs approximately $0.001-0.002, so processing all sentences costs less than $0.10.

## Example Output

```typescript
createSentence({
  id: 'greetings-1',
  hebrew: 'שלום, אני דני, שמח להכיר.',
  english: "Hi, I'm Dani, nice to meet you.",
  pattern: "{Hi, Hello}, {I'm, I am} Dani, {nice to meet you, nice meeting you, it's nice to meet you}.",
  theme: 'Greetings & Introductions',
  difficulty: 1,
  grammarPoints: ['greeting', 'simple present']
})
```
