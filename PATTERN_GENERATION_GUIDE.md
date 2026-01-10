# Sentence Pattern Generation Guide

## Quick Start

Generate flexible grading patterns for all sentences using Claude AI:

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...

# Run the pattern generator
npm run generate-patterns
```

## What This Does

The script will:
1. Process all 40+ sentences in the dataset
2. Generate natural variations for each sentence using Claude
3. Create patterns with `{alternative1, alternative2}` syntax
4. Include contractions, synonyms, and common phrasings
5. Enhance existing patterns to ensure completeness
6. Output ready-to-use TypeScript code

## Example Output

**Before (no pattern):**
```typescript
createSentence({
  id: 'home-1',
  hebrew: 'הבית שלנו מלא במשפחה וחברים.',
  english: 'Our home is full of family and friends.',
  theme: 'At Home',
  difficulty: 2,
  grammarPoints: ['possession', 'adjectives']
})
```

**After (with pattern):**
```typescript
createSentence({
  id: 'home-1',
  hebrew: 'הבית שלנו מלא במשפחה וחברים.',
  english: 'Our home is full of family and friends.',
  pattern: "{Our, The} home is full of family and friends.",
  theme: 'At Home',
  difficulty: 2,
  grammarPoints: ['possession', 'adjectives']
})
```

## Types of Variations Generated

The AI generates patterns that accept:

### 1. Contractions
- `{I am, I'm}`
- `{you are, you're}`
- `{it is, it's}`
- `{we are, we're}`

### 2. Synonyms
- `{Hi, Hello}`
- `{thanks, thank you}`
- `{happy, glad}`
- `{nice, great}`

### 3. Phrasings
- `{nice to meet you, nice meeting you, it's nice to meet you}`
- `{where are you from, where do you come from}`

### 4. Articles
- `{the city, city}`
- `{a book, the book}`

## After Generation

1. **Review the output** in `scripts/generated-patterns.txt`
2. **Check for quality** - ensure variations make sense
3. **Copy the content** into `src/data/sentences/index.ts`
4. **Replace** the `sentencesByTheme` object with the generated code
5. **Test** by running the app and trying different variations
6. **Commit** the changes

## Cost

- **Model**: Claude 3.5 Sonnet
- **Cost per sentence**: ~$0.001-0.002
- **Total for all sentences**: Less than $0.10

## Rate Limiting

The script automatically waits 1 second between API calls to avoid rate limits. Processing takes about 1-2 minutes for all sentences.

## Troubleshooting

### API Key Not Set
```
Error: ANTHROPIC_API_KEY environment variable not set
```
**Solution**: Set your API key: `export ANTHROPIC_API_KEY=your_key`

### Rate Limit Errors
The script handles rate limiting automatically by waiting between requests.

### Import Errors
Make sure you've installed dependencies:
```bash
npm install
```

## Manual Review

After generation, review patterns for:
- ✓ Natural variations that learners would actually type
- ✓ Grammatically correct alternatives
- ✗ Don't include incorrect grammar
- ✗ Don't make every word optional

## See Also

- [Script Documentation](scripts/README.md)
- [Pattern Matcher Tests](src/lib/patternMatcher.test.js)
- [Pattern Matcher Code](src/lib/patternMatcher.js)
