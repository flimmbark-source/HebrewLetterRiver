# Text-to-Speech Implementation for Reading Mode

## Overview
This implementation adds Text-to-Speech (TTS) functionality to the Reading Mode using the Web Speech API. Users can click a speaker button (🔈/🔊) to hear the pronunciation of words in their native language or as transliterated English.

## Architecture

### 1. TTS Service (`src/lib/ttsService.js`)
A singleton service that wraps the Web Speech API with the following features:

**Key Methods:**
- `initTts()` - Initializes the speech synthesis engine and loads available voices
- `getAvailableVoices()` - Returns all available system voices
- `pickVoiceForLocale(locale)` - Selects the best voice for a given BCP 47 locale (e.g., "he-IL", "es-ES")
- `speakSmart({ nativeText, nativeLocale, transliteration, mode })` - Intelligently speaks text:
  - Tries native language voice first
  - Falls back to English transliteration if no native voice available
  - Automatically stops previous speech before starting new speech
- `normalizeTranslit(text)` - Cleans transliteration for better English pronunciation
- `stop()`, `pause()`, `resume()` - Playback controls
- `addListener(callback)` - Subscribe to TTS events (start, end, cancel, error)

**Smart Voice Selection:**
1. Exact locale match (e.g., "he-IL")
2. Language prefix match (e.g., "he" for Hebrew)
3. Prefers local voices over remote/cloud voices
4. Falls back to English for transliteration if no native voice available

### 2. SpeakButton Component (`src/components/SpeakButton.jsx`)
A reusable button component with the following features:

**Props:**
- `nativeText` - Text in native script (e.g., "שלום")
- `nativeLocale` - BCP 47 locale code (e.g., "he-IL")
- `transliteration` - Romanized pronunciation (e.g., "shalom")
- `variant` - "icon" or "iconWithLabel"
- `sentenceNativeText` - (Optional) Full sentence for long press
- `sentenceTransliteration` - (Optional) Full sentence transliteration
- `className` - Additional CSS classes
- `disabled` - Disable the button

**Features:**
- Click: Speak the word
- Long press (500ms): Speak the full sentence (if provided)
- Visual feedback: Changes icon from 🔈 to 🔊 while speaking
- Pulsing animation during playback
- Proper touch target sizing (40x40px minimum)
- Automatic cleanup on unmount

### 3. Reading Area Integration (`src/components/ReadingArea.jsx`)
The TTS button is integrated into the HUD (heads-up display) on the right side, parallel to the streak counter and meaning display.

**Data Flow:**
- `currentWord.text` → Native script text (e.g., Hebrew/Arabic/etc.)
- `practiceLanguageId` → Converted to BCP 47 locale via `getLocaleForTts()`
- `readingText.translations.en[wordId].canonical` → Transliteration for fallback

**Placement:**
The button is positioned absolutely on the right side of the HUD:
```
[Streak: 5] ━━━━ [Meaning: hello] ━━━━ [🔈]
```

### 4. Language Utilities (`src/lib/languageUtils.js`)
Added locale mapping for TTS voice selection:

**New Exports:**
- `LOCALE_MAP` - Maps language IDs to BCP 47 locale codes
- `getLocaleForTts(languageId)` - Returns proper locale string for TTS

**Supported Languages:**
- Hebrew (he-IL)
- Spanish (es-ES)
- French (fr-FR)
- Arabic (ar-SA)
- Portuguese (pt-BR)
- Russian (ru-RU)
- Hindi (hi-IN)
- Japanese (ja-JP)
- Mandarin (zh-CN)
- Bengali (bn-IN)
- Amharic (am-ET)
- English (en-US)

## Browser Compatibility

### Supported Browsers:
- ✅ Chrome/Edge 33+
- ✅ Firefox 49+
- ✅ Safari 7+ (macOS), 7.1+ (iOS)
- ✅ Opera 21+

### Notes:
- Voice availability varies by operating system and browser
- Some browsers load voices asynchronously (handled by service)
- No native voice = automatic fallback to English transliteration
- Works offline if system voices are installed

## Usage

### Basic Usage (Word)
```jsx
<SpeakButton
  nativeText="שלום"
  nativeLocale="he-IL"
  transliteration="shalom"
  variant="icon"
/>
```

### With Sentence Support (Long Press)
```jsx
<SpeakButton
  nativeText="שלום"
  nativeLocale="he-IL"
  transliteration="shalom"
  sentenceNativeText="שלום, מה שלומך?"
  sentenceTransliteration="shalom, ma shlomkha?"
  variant="iconWithLabel"
/>
```

## Edge Cases Handled

1. **No TTS Support**: Gracefully logs warning, button remains visible but non-functional
2. **No Native Voice**: Automatically falls back to English transliteration
3. **Empty Text**: Button disabled, no speech attempted
4. **Rapid Taps**: Previous speech stopped before starting new speech
5. **Component Unmount**: TTS automatically stopped on unmount/navigation
6. **Long Press Cancellation**: Cleared if touch/mouse leaves button area

## No External Dependencies

This implementation uses **only** the built-in Web Speech API. No additional packages required!

## Future Enhancements (Optional)

1. **Rate/Pitch Controls**: Add user settings for speech rate and pitch
2. **Voice Selection**: Let users choose preferred voice from available options
3. **Sentence Auto-Play**: Option to auto-speak each word as user progresses
4. **Offline Caching**: Pre-cache common word pronunciations
5. **Visual Waveform**: Animated waveform during playback
6. **Keyboard Shortcut**: Add hotkey (e.g., "S" key) to trigger speech

## Testing Checklist

- [ ] Click speaker button on a Hebrew word → Hears Hebrew pronunciation
- [ ] Click speaker button with unsupported language → Hears English transliteration
- [ ] Long press button (if sentence provided) → Hears full sentence
- [ ] Rapid clicks → Previous speech stops before new starts
- [ ] Navigate away from reading area → Speech stops automatically
- [ ] Test on iOS Safari → Voices load correctly
- [ ] Test on Android Chrome → Voices load correctly
- [ ] Test with no internet (offline) → System voices still work

## Debugging

Enable TTS logs in browser console:
```javascript
// All TTS operations log with [TTS] prefix
// Example logs:
// [TTS] Initialized with 47 voices
// [TTS] Selected voice for he-IL: Google עברית (he-IL)
// [TTS] Speaking: שלום
// [TTS] No native voice for am-ET - falling back to English transliteration
```

---

**Implementation Date**: 2025-12-30
**Author**: Claude (Anthropic)
**Tech Stack**: React + Web Speech API
**Lines of Code**: ~450 LOC
