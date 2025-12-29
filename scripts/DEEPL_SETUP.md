# DeepL API Setup for Cafe Talk Lexicons

## Prerequisites

1. Get a DeepL API key (Free tier available):
   - Visit https://www.deepl.com/pro-api
   - Sign up for an account
   - Get your API authentication key

## Setup in GitHub Codespaces

1. Go to your GitHub repository settings
2. Navigate to: Settings → Secrets and variables → Codespaces
3. Click "New repository secret"
4. Name: `DEEPL_AUTH_KEY`
5. Value: Your DeepL API key
6. Save

## Restart Codespace

After adding the secret, restart your Codespace for the environment variable to be available.

## Generate Lexicons

Once the API key is configured, run:

```bash
node scripts/generateCafeTalkLexiconsWithDeepL.mjs
```

This will:
- Translate all 145 Cafe Talk words into 12 languages
- Create lexicon files in `src/data/readingTexts/cafeTalk/lexicon/`
- Take approximately 2-3 minutes (due to API rate limiting)

## Supported Languages

The script will generate lexicons for:
- ✓ English (no translation needed)
- ✓ Spanish, French, Portuguese, Russian
- ✓ Mandarin, Japanese
- ✓ Hindi, Bengali
- ✓ Arabic
- ⚠ Hebrew (may not be supported by DeepL)
- ⚠ Amharic (not supported by DeepL - will need manual translation)

## Manual Translation Fallback

For languages not supported by DeepL (Hebrew, Amharic), you'll need to:
1. Copy the English lexicon as a template
2. Manually translate each word
3. Ensure the structure matches other lexicons
