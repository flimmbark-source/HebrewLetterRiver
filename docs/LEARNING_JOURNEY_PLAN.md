# Learning Journey Plan: Connecting the Games into One Guided Experience

## The problem

Letter River has four strong game modes, but they behave like four separate apps.
The learner's intended path is:

1. **Letters** — Letter River (`src/game/game.js`)
2. **Pronunciation & Vocabulary** — Bridge Builder + Loose Planks (`/bridge`)
3. **Sentence Structure & Reading** — Deep Script sentence combat + Reading texts (`/read`, `/deep-script`)
4. **Conversation Practice** — Cafe Talk scenarios (`src/components/conversation`)

Today the user has to figure out that path themselves. Three progression systems
exist in parallel and don't reference each other:

| System | Location | What it models |
| --- | --- | --- |
| Stage heuristic | `getStageForUser` in `src/lib/progressTerms.js` | letters → words → reading → conversation, inferred from session counts and accuracy thresholds |
| Journey packs | `JOURNEY_PACKS` in `src/data/journeyPackRegistry.js` | vocab pack ordering, with a `modeSequence` field only used by one pack |
| Learning modules | `src/data/modules/index.ts` | module-1..4 with `prerequisiteModuleId`, feeding reading/sentence/conversation content |

Consequences for the learner:

- **No visible "why."** Nothing explains what each game teaches or how it teaches it.
- **No visible "when."** Stage transitions happen silently inside a heuristic
  (`sessions >= 10 || letterAccuracy >= 50` → "words"). The user never experiences
  graduating from one stage to the next.
- **No content linkage.** Letters mastered in Letter River don't gate which vocab
  packs appear; Bridge Builder vocabulary doesn't visibly feed the reading texts or
  conversation scenarios, even though the SRS engine tracks all of it.
- **Deep Script is mislabeled.** The home path shows it as the "reading" stage, but
  it's really a cross-stage reinforcement mode (letters, words, and sentences).

## Design principles

1. **One source of truth.** A single journey definition that every surface
   (home, mode setup screens, post-game screens, onboarding) reads from.
2. **Explicit, celebrated transitions.** Stages unlock with clear criteria the user
   can see in advance ("Master 15 more letters to unlock Vocabulary"), and
   graduation is a moment, not a silent flag flip.
3. **Every session answers three questions:** what am I learning, how is this game
   teaching it, and what comes next.
4. **Reinforcement is a lane, not a stage.** SRS Daily Review and Deep Script run
   alongside every stage rather than being a step on the path.
5. **Never lock a returning user out.** Stages unlock forward; earlier stages stay
   playable. A placement check lets non-beginners skip ahead.

## The journey model

```
Stage 1: LETTERS            Stage 2: WORDS              Stage 3: SENTENCES          Stage 4: CONVERSATION
"Recognize the alphabet"    "Pronounce & build vocab"   "Read & build sentences"    "Use it in dialogue"
Primary: Letter River       Primary: Bridge Builder     Primary: Reading texts +    Primary: Cafe Talk
Content: letter groups      + Loose Planks              sentence practice           scenarios
                            Content: vocab packs        Content: learning modules   Content: module scenarios
        └──────────────────────────── Reinforcement lane (always available once unlocked) ────────────────────────────┘
                                  SRS Daily Review · Deep Script runs · Daily Quests
```

Each stage definition carries, in data:

- `id`, `label`, `icon` (extend `PROGRESS_TERMS.stages`)
- `whatYouLearn` / `howYouLearn` copy keys — shown on stage intro and mode setup screens
- `primaryModes` and `supportModes`
- `contentUnits` — letter groups / pack ids / module ids / scenario ids
- `unlockCriteria` — deterministic, human-readable (see Phase 1)
- `graduationCriteria` — what "done enough to advance" means

## Phased implementation

### Phase 1 — Canonical journey data + persisted progression state

**New file `src/data/learningJourney.js`**: the four stage definitions above,
referencing existing content ids (`bridgeBuilderPacks` sections, `learningModules`,
conversation scenario ids). `JOURNEY_PACKS.modeSequence` moves here as the
per-pack flow within Stage 2.

**Persisted journey state in `ProgressContext`** (`player.journey`):

```js
{ currentStage: 'words', unlockedStages: ['letters','words'],
  stageProgress: { letters: { mastered: 14, total: 27 }, ... },
  advancedAt: { words: '2026-07-01' } }
```

- Deterministic unlock criteria replace the opaque heuristic, e.g.:
  - **Words** unlocks at ~60% of the alphabet at "practiced" level (data already in `player.letters`)
  - **Sentences** unlocks when N starter packs are completed (`getPackProgress` in `src/lib/bridgeBuilderStorage.js`) or N SRS items reach "young"
  - **Conversation** unlocks when module-1 reading/sentence content is completed with a passing grade (grading exists in `docs/READING_GRADING.md` flow)
- Keep `getStageForUser` as the **migration path**: on first load after upgrade,
  seed `player.journey` from the heuristic so existing users don't regress.
- `SkillCheckScreen` becomes the **test-out gate**: any locked stage offers
  "Already know this? Take a 2-minute check" to unlock early.

### Phase 2 — Journey-first home + stage transitions

- **Home** (`HomeLearningPath` / `homeState.js`): render from the journey model.
  Locked stages show their unlock criterion as live progress ("12 of 16 letters —
  4 more to unlock Vocabulary"). The primary CTA is always the recommended next
  session in the current stage.
- **Stage intro screen** (new, reuse `SentenceIntroPopup`/modal patterns): shown
  once when a stage unlocks — what you'll learn, how the game teaches it, what
  mastery looks like. Re-openable from the stage node.
- **Graduation moment**: celebration modal (confetti via `src/lib/celebration.js`,
  pattern from `StreakMilestoneModal`) + a badge in `badges.json`.
- **Mode framing**: each mode's setup screen (`BridgeBuilderSetup`, Deep Script
  `KitSelectScreen`, conversation `ConversationBriefScreen`, Letter River start)
  gets a one-line journey banner: "Stage 2 · Vocabulary — you're learning to
  pronounce and recognize whole words."
- Fix the Deep Script mislabel: home path stages become Letters / Words /
  Sentences & Reading / Conversation, with Deep Script surfaced in the
  reinforcement lane (`TodayPlanCard` rows) instead of as stage 3.

### Phase 3 — Cross-mode content linkage

- **Letters → packs**: annotate vocab packs with the letters they use; the pack
  list shows "uses 3 letters you haven't met — practice them first" with a
  one-tap Letter River session seeded with exactly those letters.
- **Packs → modules**: each `LearningModule` lists `requiredPackIds`; reading and
  sentence screens can then say "you know 18 of 20 words in this text" (SRS data
  makes this computable today).
- **Modules → scenarios**: conversation scenarios declare their source module, so
  Cafe Talk is framed as "use what you read in Module 1."
- **Per-pack mode flow**: generalize `modeSequence` so completing a pack means
  intro (Bridge Builder) → recall (Loose Planks) → review (Daily Review) →
  reinforce (Deep Script floor), with the pack card showing which step is next.

### Phase 4 — The guidance loop

- **Session plan** (`TodayPlanCard`): generate a 3-row daily plan from journey
  state: ① warm-up = SRS due reviews, ② core = next unit in current stage,
  ③ reinforce = Deep Script / weak-item practice.
- **Post-game next step** (`SessionNextStep` + `getSessionRecommendation`): make
  recommendations journey-aware, including the key moment "You've met the
  criteria — ready to advance to Sentences?" with a CTA into the graduation flow.
- **Daily quests** (`dailyTemplates.json`): bias quest generation toward the
  current stage's primary mode plus one reinforcement quest.

### Phase 5 — Onboarding that sets the map

- `OnboardingFlow` gains a journey preview screen ("Here's your path: Letters →
  Words → Sentences → Conversation") before the first session.
- Ask "Are you new to <language>?" — beginners start at Stage 1 with the stage-1
  intro; others go straight to `SkillCheckScreen` for placement.
- Revive `GuidedFirstSession` (currently a no-op) as a scripted first Letter River
  session that ends on the journey map with stage 1 progress visibly ticking up.

## Cross-cutting work

- **i18n**: all new copy keyed in `src/i18n/en.json` first, with fallbacks; the
  13 other dictionaries follow the existing patch workflow.
- **Analytics**: `stage_unlocked`, `stage_intro_viewed`, `graduation_shown`,
  `skill_check_passed`, `next_step_followed` events (extend `docs/analytics-events.md`)
  so we can measure whether guidance actually moves users along the path.
- **Migration**: seed journey state from `getStageForUser`; never show a locked
  stage to a user who was already past it.

## Suggested build order

| Order | Work | Why first |
| --- | --- | --- |
| 1 | Phase 1 (journey data + state + migration) | Everything else reads from it |
| 2 | Phase 2 (home + transitions + mode framing) | Highest user-visible payoff; answers "what/when/why" |
| 3 | Phase 4 (session plan + next-step loop) | Turns the map into daily behavior |
| 4 | Phase 3 (content linkage) | Deepens the connection; content annotation is the slow part |
| 5 | Phase 5 (onboarding) | Best done once the journey UI it previews is real |

Phases 1+2 alone deliver the core ask: the user always sees where they are on the
path, what each game is for, and what it takes to reach the next stage.
