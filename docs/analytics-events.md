# Analytics Event Taxonomy

Complete reference for all canonical analytics events tracked by `src/lib/analytics.js`.

## Event Reference

### app_open

Fired when the app is opened or foregrounded.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| returning | boolean | Whether this is a returning user |

### onboarding_started

Fired when the onboarding flow begins.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |

### onboarding_completed

Fired when onboarding is finished.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| goal | string | User-selected learning goal |
| skillLevel | string | User-selected skill level |

### first_session_started

Fired only for the user's very first game session.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| mode | string | Game mode (letter-river, bridge-builder, deep-script) |

### first_session_completed

Fired when the first game session completes.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| mode | string | Game mode |
| score | number | Session score |

### session_started

Fired at the start of any game session.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| mode | string | Game mode |

### session_completed

Fired at the end of any game session.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| mode | string | Game mode |
| score | number | Session score |
| accuracy | number | Session accuracy (0-1) |

### streak_viewed

Fired when the user views their streak display.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| current | number | Current streak count |

### streak_extended

Fired when the user extends their streak.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| current | number | New streak count |
| previous | number | Previous streak count |

### streak_frozen

Fired when a streak freeze is consumed.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| current | number | Preserved streak count |

### review_started

Fired when a SRS review session begins.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| itemCount | number | Number of items in the review queue |

### review_completed

Fired when a SRS review session ends.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| itemCount | number | Number of items reviewed |
| accuracy | number | Review accuracy (0-1) |

### share_clicked

Fired when a share action is initiated.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| surface | string | Where the share was triggered (e.g. results, achievements) |
| type | string | Share type (link, image, etc.) |

### share_completed

Fired when a share action completes successfully.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| surface | string | Where the share was triggered |
| type | string | Share type |

### paywall_viewed

Fired when a paywall or premium upsell is shown.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| surface | string | Where the paywall appeared |

### premium_started

Fired when a user begins a premium subscription flow.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |

### experiment_exposure

Fired when an experiment flag is evaluated via `isEnabled()`.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | Unix ms timestamp |
| flag | string | Flag name (e.g. newOnboarding, streakUI) |
| variant | string | Current value: "on" or "off" |

## Event Bus Bridge

The analytics module automatically bridges existing eventBus events:

| eventBus Event | Analytics Event | Notes |
|----------------|-----------------|-------|
| `game:session-start` | `session_started` | mode from payload |
| `game:session-complete` | `session_completed` | letter-river mode |
| `bridge:session-complete` | `session_completed` | bridge-builder mode |
| `deep-script:combat-won` | `session_completed` | deep-script mode |
| `deep-script:run-end` | `session_completed` | deep-script mode |
