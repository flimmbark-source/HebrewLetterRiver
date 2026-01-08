# UX Writing Guide

This guide documents the tone, accessibility requirements, and content locations for instructional copy in Hebrew Letter River. It is anchored in the current i18n strings and reading flows.

## Tone & Voice

**Principles**

- **Supportive and clear**: Use short, actionable sentences (“Type the translation and press Enter to continue.”).
- **Encouraging but neutral**: Celebrate progress without shaming; avoid sarcasm.
- **Direct verbs**: Start with an action verb to reduce cognitive load (“Select a text…”, “Type…”, “Tap…”).
- **Consistent terms**: Reuse standard nouns (e.g., “Reading Results”, “Practice Word”, “Your Answer”).

**Examples from current copy**

- Short prompt: “Type translation...” (`reading.typeHere`).
- Instructional intro: “Select a text to practice translating word by word. Type the translation and press Enter to continue.” (`read.intro`).
- Results framing: “Reading Results”, “Practice Word”, “Your Answer”, “Try Again”.

## Progressive Disclosure Rules

1. **Start with the minimal next step** (e.g., “Type translation…” in the input field).
2. **Reveal optional guidance only when needed** (e.g., “Show answer” / “Hide answer” toggles).
3. **Summarize performance at the end** rather than interrupting flow (results modal title + table). 

**Implementation cues**

- Use “Show answer” / “Hide answer” labels for optional reveal actions.
- Keep results copy scannable with short column labels.

## Accessibility & Localization

### Reading level and clarity

- Aim for **A2–B1** readability; avoid idioms and slang.
- Prefer concrete verbs and avoid multiple clauses in a single sentence.

### Localization constraints

- Preserve templated placeholders (e.g., `{{stars}}`) exactly as defined in i18n.
- Keep line lengths flexible; some languages require more characters.
- Avoid hard-coding punctuation that assumes English grammar.

### RTL languages

- Keep strings direction-neutral (avoid embedding LTR-only sequences like “(a/b)” unless necessary).
- Minimize mixed-script punctuation when possible to reduce bidi rendering issues.

## Where Instructional Strings Live

Primary sources:

- **UI copy**: `src/i18n/en.json` (top-level `read`, `reading`, `daily`, `achievements`, `tutorials`, etc.).
- **Reading content metadata**: `src/data/readingTexts/**` for text titles/subtitles and meaning keys.
- **Daily task templates**: `src/data/dailyTemplates.json` for task titles and descriptions.
- **Achievements/badges**: `src/data/badges.json` for badge names and tier summaries.

## Example Copy Patterns

### Short-form guidance

- `reading.typeHere`: “Type translation...”
- `reading.results.tryAgain`: “Try Again”
- `reading.results.back`: “Back”

### Long-form guidance

- `read.intro`: “Select a text to practice translating word by word. Type the translation and press Enter to continue.”
- `read.sentencesIntro`: “Practice full sentences by tapping words for help, then try translating.”
- `reading.results.title`: “Reading Results”

### Review & feedback phrasing

- `reading.results.title`: “Reading Results”
- `reading.results.practiceWord`: “Practice Word”
- `reading.results.yourAnswer`: “Your Answer”
- `reading.results.translation`: “Translation”
- `reading.results.meaning`: “Meaning”

## Writing Checklist

Before adding or changing a string:

1. **Is it actionable?** (Starts with a verb.)
2. **Is it translatable?** (No slang, avoid nested punctuation.)
3. **Does it match existing nouns?** (“Practice”, “Reading”, “Results”, etc.)
4. **Does it preserve placeholders?** (e.g., `{{count}}`, `{{stars}}`.)
5. **Is it scannable on mobile?** (Short, minimal line breaks.)

