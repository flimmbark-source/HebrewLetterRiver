# Premium Matrix: Free vs Premium Features

## Feature Matrix

| Feature | Free | Premium |
|---------|------|---------|
| Letter River | Unlimited | Unlimited |
| Bridge Builder | 2 packs/section | All packs |
| Deep Script | 3 runs/day | Unlimited |
| Conversation | 1 scenario/day | Unlimited |
| Daily Quests | Yes | Yes |
| Achievements | Yes | Yes |
| SRS Reviews | Yes | Yes |
| Custom Themes | Basic | All |
| Advanced Stats | No | Yes |
| Ad-Free | No | Yes |

## Pricing

| Plan | Price | Per Month |
|------|-------|-----------|
| Monthly | $6.99 | $6.99/month |
| Annual | $47.99 | $3.99/month |
| Lifetime | $89.99 | One-time |

## Free Tier Details

### Always Free (no limits)
- **Letter River**: The core alphabet learning game is always free and unlimited. This is the entry point for all learners.
- **Daily Quests**: All daily challenges are available to free users. These drive engagement and retention.
- **Achievements**: All badges and achievement progress are tracked and claimable for free.
- **SRS Reviews**: Spaced repetition review sessions are always available. Learning reinforcement should never be gated.

### Free with Limits
- **Bridge Builder**: The first 2 packs in each section are free. This gives users a meaningful taste of vocabulary building before asking them to upgrade. Remaining packs require premium.
- **Deep Script**: 3 dungeon runs per day for free. This provides a solid daily session without unlimited grinding. Resets at midnight.
- **Conversation Practice**: 1 scenario per day for free. Enough to experience the feature, but premium unlocks unlimited practice. Resets at midnight.

### Premium Only
- **Advanced Statistics**: Detailed learning analytics, progress charts, and performance breakdowns.
- **Custom Themes**: Premium visual themes and avatar options beyond the basic set.
- **Ad-Free Experience**: No promotional banners or interstitials.
- **Priority Content**: Early access to new packs and features.

## Design Principles

1. **Core learning is always free.** No learner should be blocked from fundamental alphabet and vocabulary acquisition.
2. **Premium unlocks depth and volume.** More packs, more runs, more scenarios — but the free tier is genuinely useful.
3. **No paywall interrupts the first session.** New users should experience the app's value before seeing any premium prompt.
4. **No essential learning feature is locked.** SRS, daily quests, and achievements are always available.
5. **Generous free tier builds trust.** Users who feel the free tier is useful are more likely to convert.
6. **Soft paywalls explain value, not guilt.** Every paywall shows what users gain, never shames them for being free.

## Content Locking Logic

All premium checks go through `PremiumContext` — no scattered hard-coded logic.

```
isContentLocked(contentType, contentId)
  - 'bridgePack'            -> locked if not in first 2 packs of its section
  - 'deepScriptRun'         -> locked if 3+ runs today
  - 'conversationScenario'  -> locked if 1+ scenario today
  - 'customTheme'           -> always locked for free
  - 'advancedStats'         -> always locked for free
  - anything else            -> not locked
```

## Daily Usage Tracking

Daily usage counts are stored in localStorage under `premium.dailyUsage.{YYYY-MM-DD}`.
Counts reset naturally when the date changes. Old date keys are not actively cleaned up
but could be pruned periodically if storage becomes a concern.

## Implementation Notes

- Premium state is persisted at `premium.status` in localStorage (via the `hlr.` prefix)
- `PremiumProvider` sits in the provider chain after `ProgressProvider`
- The `usePremium()` hook is the single interface for all premium checks
- Mock purchase flow available in dev mode via `dev.mockPremium` localStorage flag
- No real payment processing is implemented — checkout is scaffolded with placeholder URLs
