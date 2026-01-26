# Segment Practice Debugging Notes

## Issue
All 5 segments show the same Hebrew text (greetings-1-short) when clicked, instead of showing different sentence pairs for each segment.

## Data Verification
✅ All 20 sentences exist correctly in `/src/data/sentences/index.ts`:
- 10 short sentences (greetings-1-short through greetings-10-short)
- 10 long sentences (greetings-1 through greetings-10)
- No duplicate IDs
- Each short sentence has a corresponding long sentence

## Code Logic Verification
✅ The `generateSegments()` function logic appears sound:
1. Filters for sentences ending in '-short' (should find 10)
2. Pairs each short sentence with its corresponding long sentence (should create 10 pairs)
3. Groups pairs into segments of 2 pairs each (should create 5 segments)
4. Creates beats for each pair in each segment (each segment should have different lineIds)

## Diagnostic Logs Added

### 1. ConversationBriefScreen.jsx (lines 22-35)
- Logs detailed segment structure when the brief screen renders
- Shows: segment count, pairs, beat lineIds, plan names
- Checks if all segments share the same plan object reference (would indicate a bug)
- Shows whether rendering "SEGMENT PATH" or "START BUTTON"

### 2. PracticeSegmentPath.jsx (lines 32-40)
- Logs segment data when a segment button is clicked
- Shows: segment ID, pairs, first 5 beat lineIds

### 3. ConversationSession.jsx (lines 52-55)
- Logs segment data in handleStartSegment when starting a segment
- Shows: segment ID, pairs, first 5 beat lineIds

### 4. ConversationSession.jsx (lines 140-147)
- Logs when rendering the beat screen
- Shows: current beat index, beat lineId, total beats, first 5 beats, active plan name

### 5. scenarioFactory.ts (lines 600-604)
- Logs segment generation (runs once at module load time)
- Shows: pairs, beat count, first beat lineId for each segment

## Expected Console Output

When refreshing and clicking Segment 2, you should see:

```
[ConversationBriefScreen] DETAILED SEGMENT ANALYSIS:
Segment count: 5

--- SEGMENT 1 (greetings-and-introductions-segment-1) ---
Pairs: [
  { shortSentenceId: "greetings-1-short", longSentenceId: "greetings-1" },
  { shortSentenceId: "greetings-2-short", longSentenceId: "greetings-2" }
]
Beat count: 16
First 8 beat lineIds: greetings-1-short, greetings-1-short, greetings-1-short, greetings-1-short, greetings-1, greetings-1, greetings-1, greetings-1
Plan name: segment-1

--- SEGMENT 2 (greetings-and-introductions-segment-2) ---
Pairs: [
  { shortSentenceId: "greetings-3-short", longSentenceId: "greetings-3" },
  { shortSentenceId: "greetings-4-short", longSentenceId: "greetings-4" }
]
Beat count: 16
First 8 beat lineIds: greetings-3-short, greetings-3-short, greetings-3-short, greetings-3-short, greetings-3, greetings-3, greetings-3, greetings-3
Plan name: segment-2

[... segments 3, 4, 5 ...]

⚠️  All segments share same plan object? false

[ConversationBriefScreen] RENDERING: SEGMENT PATH

[PracticeSegmentPath] Clicked segment: {
  id: "greetings-and-introductions-segment-2",
  pairs: [...],
  firstBeatLineId: "greetings-3-short",
  first5BeatLineIds: ["greetings-3-short", "greetings-3-short", ...]
}

=== Starting Segment ===
Segment ID: greetings-and-introductions-segment-2
Segment pairs: [...]
First 5 beat lineIds: ["greetings-3-short", ...]

[ConversationSession] Rendering beat screen: {
  currentBeatIndex: 0,
  beatLineId: "greetings-3-short",
  ...
}
```

## Hypothesis

If the console logs show:
1. **"RENDERING: START BUTTON"** instead of "SEGMENT PATH" → segments are undefined/empty
2. **"CLICKED START BUTTON"** → user is clicking the regular start button, not segments
3. **All segments have the same firstBeatLineId** → bug in segment generation
4. **"All segments share same plan object? true"** → segments pointing to same plan
5. **handleStartSegment logs don't appear** → segment click handler not being called

Most likely scenario: Segments are not being generated (returning undefined), so the brief screen shows the regular "Start Practice" button instead of the segment path. User clicks this button repeatedly, always starting from greetings-1-short.

## Next Steps

1. Refresh the page to see the ConversationBriefScreen logs
2. Check if "SEGMENT PATH" or "START BUTTON" is logged
3. Click on what looks like "Segment 2"
4. Check which logs appear (segment click or start button click)
5. The logs will show exactly where the problem is
