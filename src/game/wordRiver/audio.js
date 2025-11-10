const AUDIO_SOURCES = {};

/**
 * Basic abstraction for playing practice word audio.
 * TODO: Integrate with the production audio manager and real audio assets.
 * @param {string} audioKey
 * @returns {Promise<void>}
 */
export function playWordAudio(audioKey) {
  if (!audioKey) {
    return Promise.resolve();
  }

  const source = AUDIO_SOURCES[audioKey];
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (source) {
    try {
      let element = source.element;
      if (!element) {
        element = new Audio(source.url);
        source.element = element;
      }
      element.currentTime = 0;
      return element.play().catch(() => {});
    } catch (err) {
      console.warn('Audio playback failed', err);
      return Promise.resolve();
    }
  }

  console.info(`Word River audio stub invoked for key: "${audioKey}"`);
  return Promise.resolve();
}
