import { emit } from '../lib/eventBus.js';
import { loadLanguage } from '../lib/languageLoader.js';
import { getDictionary, translate as translateWithDictionary, formatTemplate } from '../i18n/index.js';

const trackedTimeouts = new Set();
const trackedIntervals = new Set();

function trackTimeout(callback, delay) {
  const handle = setTimeout(() => {
    trackedTimeouts.delete(handle);
    callback();
  }, delay);
  trackedTimeouts.add(handle);
  return handle;
}

function trackInterval(callback, delay) {
  const handle = setInterval(callback, delay);
  trackedIntervals.add(handle);
  return handle;
}

function clearTrackedTimeout(handle) {
  if (handle === undefined || handle === null) return;
  clearTimeout(handle);
  trackedTimeouts.delete(handle);
}

function clearTrackedInterval(handle) {
  if (handle === undefined || handle === null) return;
  clearInterval(handle);
  trackedIntervals.delete(handle);
}

function clearAllTimers() {
  trackedTimeouts.forEach((handle) => clearTimeout(handle));
  trackedTimeouts.clear();
  trackedIntervals.forEach((handle) => clearInterval(handle));
  trackedIntervals.clear();
}

export function setupGame({ onReturnToMenu, languagePack, translate, dictionary } = {}) {
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const livesContainer = document.getElementById('lives-container');
  const choicesContainer = document.getElementById('choices-container');
  const modal = document.getElementById('modal');
  const startButton = document.getElementById('start-button');
  const playArea = document.getElementById('play-area');
  const learnOverlay = document.getElementById('learn-overlay');
  const learnLetterEl = document.getElementById('learn-letter');
  const learnName = document.getElementById('learn-name');
  const learnSound = document.getElementById('learn-sound');
  const ghostEl = document.getElementById('correct-answer-ghost');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const setupView = document.getElementById('setup-view');
  const gameOverView = document.getElementById('game-over-view');
  const gameContainer = document.getElementById('game-container');
  const summaryTooltip = document.getElementById('summary-tooltip');
  const accessibilityBtn = document.getElementById('accessibility-btn');
  const accessibilityView = document.getElementById('accessibility-view');
  const closeAccessibilityBtn = document.getElementById('close-accessibility-btn');
  const highContrastToggle = document.getElementById('high-contrast-toggle');
  const randomLettersToggle = document.getElementById('random-letters-toggle');
  const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
  const gameSpeedSlider = document.getElementById('game-speed-slider');
  const speedLabel = document.getElementById('speed-label');
  const gameFontSelect = document.getElementById('game-font-select');
  const slowRiverToggle = document.getElementById('slow-river-toggle');
  const clickModeToggle = document.getElementById('click-mode-toggle');
  const installBtn = document.getElementById('install-btn');
  const backToMenuButton = document.getElementById('back-to-menu-button');
  const setupExitButton = document.getElementById('setup-exit-button');
  const gameOverExitButton = document.getElementById('game-over-exit-button');
  const modeOptionsContainer = document.getElementById('mode-options');
  const goalValueEl = document.getElementById('goalValue');
  const goalIncreaseBtn = document.getElementById('goalIncrease');
  const goalDecreaseBtn = document.getElementById('goalDecrease');
  const goalProgressFillEl = document.getElementById('goalProgressFill');
  const goalInfoIcon = document.getElementById('goalInfoIcon');
  const goalTooltip = document.getElementById('goalTooltip');
  const winView = document.getElementById('win-view');
  const continuePlayingButton = document.getElementById('continue-playing-button');
  const winExitButton = document.getElementById('win-exit-button');
  const winGoalDisplay = document.getElementById('win-goal-display');
  const totalWinsDisplay = document.getElementById('total-wins-display');
  const sessionCorrectDisplay = document.getElementById('session-correct-display');
  const waveStatValue = document.getElementById('wave-stat-value');
  const streakStatValue = document.getElementById('streak-stat-value');
  const waveStatGhost = document.getElementById('wave-stat-ghost');
  const streakStatGhost = document.getElementById('streak-stat-ghost');

  if (!scoreEl || !levelEl) {
    throw new Error('Game elements failed to initialize.');
  }

  const activeLanguage = languagePack ?? loadLanguage();
  const activeDictionary = dictionary ?? getDictionary(activeLanguage.id);
  const t = translate
    ? (key, replacements) => translate(key, replacements)
    : (key, replacements) => translateWithDictionary(activeDictionary, key, replacements);
  const translateWithFallback = (key, fallback, replacements = {}) => {
    const result = t(key, replacements);
    if (!result || result === key) return fallback;
    return result;
  };
  let practiceModes = (activeLanguage.practiceModes ?? []).map((mode) => ({ ...mode }));
  const modeItems = { ...(activeLanguage.modeItems ?? {}) };
  const baseItems = activeLanguage.items ?? [];
  const allLanguageItems = activeLanguage.allItems ?? [];
  const itemsById = activeLanguage.itemsById ?? {};
  const itemsBySymbol = activeLanguage.itemsBySymbol ?? {};
  const introductionsConfig = activeLanguage.introductions ?? {};
  const defaultSubtitle = translateWithFallback(
    'game.setup.subtitleFallback',
    introductionsConfig.subtitleTemplate ?? 'Drag the letters to the correct boxes!'
  );
  const subtitleTemplate = translateWithFallback(
    `game.introductions.${activeLanguage.id}.subtitle`,
    defaultSubtitle
  );
  const defaultNoun = translateWithFallback(
    'game.setup.defaultNoun',
    introductionsConfig.nounFallback ?? 'item'
  );
  const nounFallback = translateWithFallback(
    `game.introductions.${activeLanguage.id}.nounFallback`,
    introductionsConfig.nounFallback ?? defaultNoun
  );
  const metadata = activeLanguage.metadata ?? {};
  const fontClass = metadata.fontClass ?? 'language-font-hebrew';
  const accessibilityHints = metadata.accessibility ?? {};
  const letterDescriptionTemplate = accessibilityHints.letterDescriptionTemplate ?? null;

  const defaultModeLabel = translateWithFallback(
    'game.setup.defaultModeLabel',
    'Core Practice'
  );
  const defaultModeDescription = translateWithFallback(
    'game.setup.defaultModeDescription',
    'Practice the main set of characters.'
  );

  if (!practiceModes.length) {
    practiceModes = [
      {
        id: 'letters',
        label: defaultModeLabel,
        description: defaultModeDescription,
        type: 'consonants',
        noun: nounFallback
      }
    ];
  }

  practiceModes = practiceModes.map((mode) => {
    const label = translateWithFallback(
      `game.modes.${mode.id}.label`,
      mode.label ?? defaultModeLabel
    );
    const description = translateWithFallback(
      `game.modes.${mode.id}.description`,
      mode.description ?? defaultModeDescription
    );
    const noun = translateWithFallback(
      `game.modes.${mode.id}.noun`,
      mode.noun ?? nounFallback
    );
    return { ...mode, label, description, noun };
  });

  if (!modeItems.letters && baseItems.length) {
    modeItems.letters = baseItems.map((item) => ({ ...item }));
  }

  const modeNounMap = practiceModes.reduce((acc, mode) => {
    acc[mode.id] = mode.noun ?? nounFallback;
    return acc;
  }, {});

  function renderPracticeModes() {
    if (!modeOptionsContainer) return;
    modeOptionsContainer.innerHTML = '';

    practiceModes.forEach((mode, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mode-button';
      button.dataset.mode = mode.id;
      button.textContent = mode.label;
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', index === 0 ? 'true' : 'false');

      if (index === 0) {
        button.classList.add('selected');
        gameMode = mode.id;
      }

      button.addEventListener('click', () => {
        // Remove selected class from all buttons
        modeOptionsContainer.querySelectorAll('.mode-button').forEach((btn) => {
          btn.classList.remove('selected');
          btn.setAttribute('aria-checked', 'false');
        });

        // Add selected class to clicked button
        button.classList.add('selected');
        button.setAttribute('aria-checked', 'true');
        gameMode = mode.id;
        updateModalSubtitle();
      });

      modeOptionsContainer.appendChild(button);
    });

    updateModalSubtitle();
  }

  function updateGoalDisplay() {
    if (goalValueEl) {
      goalValueEl.textContent = goalValue;
      goalValueEl.style.color = '#4a2208';
    }
    updateGoalSettingBar();
  }

  function updateGoalSettingBar() {
    if (goalProgressFillEl) {
      // Bar represents the goal setting itself
      // Minimum (5) = 20% filled (2 segments)
      // Maximum (25) = 100% filled (10 segments)
      const range = GOAL_MAX - GOAL_MIN;
      const currentOffset = goalValue - GOAL_MIN;
      const percent = 20 + (currentOffset / range) * 80;
      goalProgressFillEl.style.height = `${Math.min(100, Math.max(20, percent))}%`;
    }
  }

  function increaseGoal() {
    goalValue = Math.min(GOAL_MAX, goalValue + GOAL_STEP);
    updateGoalDisplay();
  }

  function decreaseGoal() {
    goalValue = Math.max(GOAL_MIN, goalValue - GOAL_STEP);
    updateGoalDisplay();
  }

  function showWinScreen() {
    gameActive = false;
    modal.classList.remove('hidden');
    setupView.classList.add('hidden');
    gameOverView.classList.add('hidden');
    winView.classList.remove('hidden');

    if (winGoalDisplay) winGoalDisplay.textContent = goalValue;
    if (totalWinsDisplay) totalWinsDisplay.textContent = totalWins;
    if (sessionCorrectDisplay) sessionCorrectDisplay.textContent = totalCatchStreak;
  }

  function continueAfterWin() {
    waveCorrectCount = 0;
    winView.classList.add('hidden');
    modal.classList.add('hidden');
    gameActive = true;
    // Clear current round and start a new wave
    if (currentRound && currentRound.timers) {
      currentRound.timers.forEach((handle) => clearTrackedTimeout(handle));
    }
    activeItems.forEach((item) => item.element.remove());
    activeItems.clear();
    spawnNextRound();
  }

  function exitFromWin() {
    resetToSetupScreen();
    onReturnToMenu?.();
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // ignore registration failures during development
      });
    });
  }

  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn?.classList.remove('hidden');
  });

  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    installBtn.disabled = true;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.add('hidden');
    installBtn.disabled = false;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installBtn?.classList.add('hidden');
  });

  let dropZones = [];
  let activeBucketCount = 0;
  const BUCKET_MIN_WIDTH_FALLBACK = 80;
  const LAYOUT_GAP_FALLBACK = 8;
  const BUCKET_BASE_HEIGHT = 50; // Base height when containers are full size
  const BUCKET_MIN_HEIGHT = 44; // Minimum height for touch accessibility
  let pendingBucketLayoutHandle = null;
  let pendingBucketLayoutIsAnimationFrame = false;
  let isApplyingBucketLayout = false;
  let rerunBucketLayout = false;
  let bucketResizeObserver = null;
  let bucketResizeHandler = null;
  let playAreaResizeObserver = null;
  let playAreaResizeHandler = null;
  let bucketMeasurementElement = null;
  let cachedBucketMinWidth = null;
  let activeDrag = null;
  let dragGhost = null;
  let hoverZone = null;
  let gameMode = practiceModes[0]?.id ?? 'letters';
  let isRestartMode = false;
  let visualViewportResizeHandler = null;

  function ensureDragGhost() {
    if (dragGhost) return dragGhost;
    dragGhost = document.createElement('div');
    dragGhost.id = 'drag-ghost';
    document.body.appendChild(dragGhost);
    return dragGhost;
  }

  function ensureBucketMeasurementElement() {
    if (bucketMeasurementElement && bucketMeasurementElement.isConnected) {
      return bucketMeasurementElement;
    }
    if (typeof document === 'undefined' || !document.body) return null;
    bucketMeasurementElement = document.createElement('div');
    bucketMeasurementElement.style.position = 'absolute';
    bucketMeasurementElement.style.visibility = 'hidden';
    bucketMeasurementElement.style.pointerEvents = 'none';
    bucketMeasurementElement.style.left = '-9999px';
    bucketMeasurementElement.style.top = '0';
    bucketMeasurementElement.style.boxSizing = 'border-box';
    document.body.appendChild(bucketMeasurementElement);
    return bucketMeasurementElement;
  }

  function updateRiverWidth() {
    if (!playArea) return;
    const width = playArea.offsetWidth;
    if (!Number.isFinite(width)) return;
    playArea.style.setProperty('--river-width', `${width}px`);
  }

  function measureBucketMinWidth() {
    if (!choicesContainer || typeof window === 'undefined') {
      return BUCKET_MIN_WIDTH_FALLBACK;
    }
    const buckets = choicesContainer.querySelectorAll('.catcher-box');
    if (!buckets.length) return BUCKET_MIN_WIDTH_FALLBACK;
    const measurementElement = ensureBucketMeasurementElement();
    if (!measurementElement) return BUCKET_MIN_WIDTH_FALLBACK;
    const containerWidth = choicesContainer.clientWidth;
    if (Number.isFinite(containerWidth) && containerWidth > 0) {
      measurementElement.style.width = `${containerWidth}px`;
      measurementElement.style.maxWidth = `${containerWidth}px`;
    } else {
      measurementElement.style.width = '';
      measurementElement.style.maxWidth = '';
    }
    measurementElement.style.whiteSpace = 'normal';
    let maxWidth = 0;
    buckets.forEach((bucket) => {
      measurementElement.className = bucket.className;
      const bucketStyle = window.getComputedStyle?.(bucket);
      measurementElement.style.padding = bucketStyle?.padding ?? '';
      measurementElement.style.border = bucketStyle?.border ?? '';
      measurementElement.style.boxSizing = bucketStyle?.boxSizing ?? 'border-box';
      measurementElement.innerHTML = bucket.innerHTML;
      const ariaLabel = bucket.getAttribute('aria-label');
      if (ariaLabel) measurementElement.setAttribute('aria-label', ariaLabel);
      else measurementElement.removeAttribute('aria-label');
      const rect = measurementElement.getBoundingClientRect();
      if (rect.width > maxWidth) maxWidth = rect.width;
    });
    if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
      return BUCKET_MIN_WIDTH_FALLBACK;
    }
    return Math.ceil(maxWidth);
  }

  function getBucketMinWidth() {
    if (cachedBucketMinWidth !== null) {
      return cachedBucketMinWidth;
    }
    cachedBucketMinWidth = measureBucketMinWidth();
    return cachedBucketMinWidth;
  }

  function invalidateBucketMinWidth() {
    cachedBucketMinWidth = null;
  }

  function refreshDropZones() {
    dropZones = Array.from(document.querySelectorAll('.catcher-box'));
    if (clickModeEnabled) {
      setupClickModeBuckets();
    }
  }

  function measureBucketTextWidth() {
    if (!choicesContainer || typeof window === 'undefined') {
      return 0;
    }
    const buckets = choicesContainer.querySelectorAll('.catcher-box');
    if (!buckets.length) return 0;
    const measurementElement = ensureBucketMeasurementElement();
    if (!measurementElement) return 0;

    measurementElement.style.width = 'max-content';
    measurementElement.style.maxWidth = '';
    measurementElement.style.whiteSpace = 'nowrap';
    let maxWidth = 0;
    buckets.forEach((bucket) => {
      measurementElement.className = bucket.className;
      measurementElement.textContent = bucket.textContent ?? '';
      measurementElement.style.padding = '0';
      measurementElement.style.border = '0';
      const rect = measurementElement.getBoundingClientRect();
      measurementElement.style.padding = '';
      measurementElement.style.border = '';
      if (rect.width > maxWidth) maxWidth = rect.width;
    });

    if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
      return 0;
    }

    return Math.ceil(maxWidth);
  }

  function clearPendingBucketLayout() {
    if (pendingBucketLayoutHandle === null) return;
    if (pendingBucketLayoutIsAnimationFrame) {
      if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(pendingBucketLayoutHandle);
      }
    } else if (typeof window !== 'undefined') {
      window.clearTimeout?.(pendingBucketLayoutHandle);
    }
    pendingBucketLayoutHandle = null;
  }

  function scheduleBucketLayoutUpdate() {
    if (!choicesContainer) return;
    if (isApplyingBucketLayout) {
      rerunBucketLayout = true;
      return;
    }
    clearPendingBucketLayout();
    const runUpdate = () => {
      pendingBucketLayoutHandle = null;
      isApplyingBucketLayout = true;
      try {
        invalidateBucketMinWidth();
        applyBucketLayout();
        if (activeBucketCount > 0) {
          refreshDropZones();
        }
      } finally {
        isApplyingBucketLayout = false;
        if (rerunBucketLayout) {
          rerunBucketLayout = false;
          scheduleBucketLayoutUpdate();
        }
      }
    };
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      pendingBucketLayoutIsAnimationFrame = true;
      pendingBucketLayoutHandle = window.requestAnimationFrame(runUpdate);
    } else if (typeof window !== 'undefined') {
      pendingBucketLayoutIsAnimationFrame = false;
      pendingBucketLayoutHandle = window.setTimeout(runUpdate, 50);
    }
  }

  function applyBucketLayout(count = activeBucketCount) {
    if (!choicesContainer) return;
    if (!count) {
      choicesContainer.style.removeProperty('grid-template-columns');
      return;
    }
    if (typeof window === 'undefined') return;
    const buckets = choicesContainer.querySelectorAll('.catcher-box');
    if (!buckets.length) return;
    const containerWidth = choicesContainer.clientWidth;
    if (containerWidth <= 0) return;
    const minBucketWidth = getBucketMinWidth();
    const minBucketTextWidth = measureBucketTextWidth();
    const bucketStyle = window.getComputedStyle?.(buckets[0]);
    const horizontalPadding =
      (parseFloat(bucketStyle?.paddingLeft) || 0) + (parseFloat(bucketStyle?.paddingRight) || 0);
    const measuredReadableWidth = minBucketTextWidth + horizontalPadding;
    const minReadableWidth = measuredReadableWidth > 0
      ? Math.ceil(measuredReadableWidth)
      : BUCKET_MIN_WIDTH_FALLBACK;
    const computed = window.getComputedStyle?.(choicesContainer);
    const gapValueRaw = computed?.columnGap || computed?.gap || `${LAYOUT_GAP_FALLBACK}px`;
    const gapValue = parseFloat(gapValueRaw) || LAYOUT_GAP_FALLBACK;
    const totalGap = gapValue * Math.max(count - 1, 0);
    const availableWidth = containerWidth - totalGap;
    const targetWidth = availableWidth / count;

    // Helper function to calculate and apply height based on width ratio
    const applyDynamicHeight = (currentWidth) => {
      const widthRatio = currentWidth / minBucketWidth;
      const dynamicHeight = BUCKET_BASE_HEIGHT * widthRatio;
      const finalHeight = Math.max(dynamicHeight, BUCKET_MIN_HEIGHT);
      buckets.forEach(bucket => {
        bucket.style.minHeight = `${finalHeight}px`;
      });
    };

    if (availableWidth / count >= minBucketWidth) {
      choicesContainer.style.gridTemplateColumns = `repeat(${count}, minmax(${minBucketWidth}px, 1fr))`;
      applyDynamicHeight(minBucketWidth);
      return;
    }
    if (targetWidth >= minReadableWidth) {
      const minWidth = Math.max(minReadableWidth, targetWidth);
      choicesContainer.style.gridTemplateColumns = `repeat(${count}, minmax(${minWidth}px, 1fr))`;
      applyDynamicHeight(minWidth);
      return;
    }
    const numerator = containerWidth + gapValue;
    const maxReadableColumns = Math.max(
      1,
      Math.min(count, Math.floor(numerator / (minReadableWidth + gapValue)))
    );
    const maxCompactColumns = Math.max(
      1,
      Math.min(count, Math.floor(numerator / (minBucketWidth + gapValue)))
    );

    if (count >= 4 && maxCompactColumns >= 4 && maxReadableColumns < 4) {
      const compactColumns = Math.min(count, Math.max(4, maxCompactColumns));
      const compactWidth = Math.max(
        minBucketWidth,
        Math.min(minReadableWidth, Math.floor(availableWidth / compactColumns))
      );
      choicesContainer.style.gridTemplateColumns = `repeat(${compactColumns}, minmax(${compactWidth}px, 1fr))`;
      applyDynamicHeight(compactWidth);
      return;
    }

    choicesContainer.style.gridTemplateColumns = `repeat(${maxReadableColumns}, minmax(${minReadableWidth}px, 1fr))`;
    applyDynamicHeight(minReadableWidth);
  }

  if (playArea) {
    updateRiverWidth();

    if (typeof ResizeObserver !== 'undefined') {
      playAreaResizeObserver?.disconnect();
      playAreaResizeObserver = new ResizeObserver(() => updateRiverWidth());
      playAreaResizeObserver.observe(playArea);
    }

    if (typeof window !== 'undefined') {
      if (playAreaResizeHandler) {
        window.removeEventListener('resize', playAreaResizeHandler);
      }
      playAreaResizeHandler = () => updateRiverWidth();
      window.addEventListener('resize', playAreaResizeHandler);
    }
  }

  if (choicesContainer) {
    if (typeof ResizeObserver !== 'undefined') {
      bucketResizeObserver?.disconnect();
      bucketResizeObserver = new ResizeObserver(() => scheduleBucketLayoutUpdate());
      bucketResizeObserver.observe(choicesContainer);
    }
    if (typeof window !== 'undefined') {
      if (bucketResizeHandler) {
        window.removeEventListener('resize', bucketResizeHandler);
      }
      bucketResizeHandler = () => scheduleBucketLayoutUpdate();
      window.addEventListener('resize', bucketResizeHandler);

      const viewport = window.visualViewport;
      if (viewport) {
        if (visualViewportResizeHandler) {
          viewport.removeEventListener('resize', visualViewportResizeHandler);
        }
        visualViewportResizeHandler = () => scheduleBucketLayoutUpdate();
        viewport.addEventListener('resize', visualViewportResizeHandler);
      }
    }
  }

  function getDisplaySymbol(item = {}) {
    return item.symbol ?? item.transliteration ?? item.name ?? item.sound ?? '';
  }

  function getDisplayLabel(item = {}) {
    return item.sound ?? item.pronunciation ?? item.name ?? item.transliteration ?? '';
  }

  function getDisplayPronunciation(item = {}) {
    return item.pronunciation ?? item.sound ?? '';
  }

  function getCharacterAriaLabel(item = {}) {
    const symbol = getDisplaySymbol(item);
    if (!symbol) return '';
    const pronunciation = getDisplayPronunciation(item);
    if (pronunciation) {
      return t('game.summary.characterLabelWithPronunciation', {
        symbol,
        pronunciation
      });
    }
    return t('game.summary.characterLabel', { symbol });
  }

  function zoneAt(x, y) {
    for (let i = 0; i < dropZones.length; i++) {
      const el = dropZones[i];
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return el;
    }
    return null;
  }

function startClickMode(itemEl, payload) {
  const glyphEl = itemEl.querySelector('.letter-symbol') || itemEl;

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    // If this letter is already selected, deselect it
    if (selectedLetter && selectedLetter.element === glyphEl) {
      selectedLetter.element.classList.remove('click-selected');
      selectedLetter.element.style.animationPlayState = 'running';
      selectedLetter = null;
      return;
    }

    // Deselect previous letter if any
    if (selectedLetter) {
      selectedLetter.element.classList.remove('click-selected');
      selectedLetter.element.style.animationPlayState = 'running';
    }

    // Select this letter (glyph only)
    selectedLetter = { element: glyphEl, payload };
    glyphEl.classList.add('click-selected');
    itemEl.style.animationPlayState = 'paused';
  }

  itemEl.addEventListener('click', onClick);
}

  function setupClickModeBuckets() {
    const buckets = dropZones.filter((el) => el && el.classList && el.classList.contains('catcher-box'));
    buckets.forEach((bucket) => {
      // Remove existing click handlers
      const oldHandler = bucket._clickHandler;
      if (oldHandler) {
        bucket.removeEventListener('click', oldHandler);
      }

      // Add new click handler
      const clickHandler = (e) => {
        if (!selectedLetter) return;
        e.preventDefault();
        e.stopPropagation();

        // Drop the selected letter into this bucket
        programmaticDrop(bucket, selectedLetter.payload);

        // Deselect the letter
        selectedLetter.element.classList.remove('click-selected');
        selectedLetter = null;
      };

      bucket._clickHandler = clickHandler;
      bucket.addEventListener('click', clickHandler);
    });
  }

  function startPointerDrag(itemEl, payload) {
    function onDown(e) {
      if (clickModeEnabled) {
        return;
      }

      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      itemEl.setPointerCapture?.(e.pointerId);

      itemEl.style.animationPlayState = 'paused';
      itemEl.classList.add('dragging');

      activeDrag = { el: itemEl, data: payload };

      const ghost = ensureDragGhost();
      ghost.textContent = itemEl.textContent;
      const fontStyleClass = selectedFont !== 'default' ? `game-font-${selectedFont}` : '';
      ghost.className = itemEl.classList.contains('falling-gem') ? 'text-5xl' : `${fontClass} ${fontStyleClass} text-6xl`;
      ghost.style.opacity = '0.95';

      itemEl.style.visibility = 'hidden';
      onMove(e);
    }

    function onMove(e) {
      if (!activeDrag) return;
      const x = e.clientX;
      const y = e.clientY;
      const ghost = ensureDragGhost();
      ghost.style.left = x + 'px';
      ghost.style.top = y + 'px';

      const z = zoneAt(x, y);
      if (z !== hoverZone) {
        hoverZone?.classList.remove('drag-over');
        z?.classList.add('drag-over');
        hoverZone = z;
      }
    }

    function onUp(e) {
      if (!activeDrag) return;
      itemEl.releasePointerCapture?.(e.pointerId);

      const x = e.clientX;
      const y = e.clientY;
      const target = zoneAt(x, y);
      hoverZone?.classList.remove('drag-over');
      hoverZone = null;

      itemEl.classList.remove('dragging');
      itemEl.style.visibility = '';
      itemEl.style.animationPlayState = 'running';
      if (dragGhost) {
        dragGhost.remove();
        dragGhost = null;
      }

      if (target) programmaticDrop(target, activeDrag.data);
      activeDrag = null;
    }

    itemEl.addEventListener('pointerdown', onDown);
    itemEl.addEventListener('pointermove', onMove);
    itemEl.addEventListener('pointerup', onUp);
    itemEl.addEventListener('pointercancel', onUp);
    itemEl.addEventListener('lostpointercapture', onUp);
  }

  function programmaticDrop(targetBox, payload) {
    handleProgrammaticDrop({ preventDefault: () => {}, currentTarget: targetBox }, payload);
  }

  function handleProgrammaticDrop(e, payload) {
    const targetBox = e.currentTarget;
    targetBox.classList.remove('drag-over');

    const { id: droppedId, roundId, itemId: droppedItemId, symbol: droppedSymbol } = payload;
    if (!gameActive || !activeItems.has(droppedId)) return;

    const targetItemId = targetBox.dataset.itemId;
    const item = activeItems.get(droppedId);

    item.element.isDropped = true;
    if (!isBonusRound && droppedItemId && !sessionStats[droppedItemId]) {
      sessionStats[droppedItemId] = { correct: 0, incorrect: 0 };
    }

    const isCorrect = isBonusRound || targetItemId === droppedItemId;
    if (isBonusRound) {
      bonusCaughtInSession += 1;
      emit('game:bonus-catch', { count: bonusCaughtInSession, score, languageId: activeLanguage.id });
    }

    if (isCorrect) {
      updateScore(isBonusRound ? 25 : 10);
      targetBox.classList.add('feedback-correct');
      if (!isBonusRound && droppedItemId) {
        sessionStats[droppedItemId].correct++;
        // Track wave progress for win condition
        waveCorrectCount++;
        currentCatchStreak++;
        if (waveCorrectCount > bestWaveCatch) {
          bestWaveCatch = waveCorrectCount;
          updateWaveStat(true);
        }
        const improvedStreak = currentCatchStreak > totalCatchStreak;
        totalCatchStreak = Math.max(totalCatchStreak, currentCatchStreak);
        if (improvedStreak) {
          updateStreakStat(true);
        }
        if (waveCorrectCount >= goalValue) {
          totalWins++;
          trackTimeout(() => {
            showWinScreen();
          }, 500);
        }
      }
      // Hide the letter immediately after correct drop
      item.element.style.display = 'none';
    } else {
      lives--;
      updateLives(true);
      targetBox.classList.add('feedback-incorrect');
      if (!isBonusRound && droppedItemId) {
        sessionStats[droppedItemId].incorrect++;
        // Reset wave progress on incorrect answer
        waveCorrectCount = 0;
        currentCatchStreak = 0;
      }

      // Find the correct bucket to show its sound/label
      const correctBucket = choicesContainer.querySelector(`[data-item-id="${droppedItemId}"]`);
      const correctLabel = correctBucket ? correctBucket.textContent : (getDisplayLabel(item.data) || getDisplaySymbol(item.data));
      const boxRect = targetBox.getBoundingClientRect();
      const gameRect = gameContainer.getBoundingClientRect();
      ghostEl.textContent = correctLabel;

      ghostEl.style.display = 'block';
      const ghostWidth = ghostEl.offsetWidth;
      ghostEl.style.display = '';
      ghostEl.style.left = `${boxRect.left - gameRect.left + boxRect.width / 2 - ghostWidth / 2}px`;
      ghostEl.style.top = `${boxRect.top - gameRect.top}px`;
      ghostEl.classList.add('ghost-rise');
      trackTimeout(() => ghostEl.classList.remove('ghost-rise'), 2000);
      // Hide the letter immediately after incorrect drop too
      item.element.style.display = 'none';
    }

    if (!isBonusRound) {
      emit('game:letter-result', {
        itemId: droppedItemId,
        symbol: droppedSymbol,
        sound: item.data.sound,
        correct: isCorrect,
        mode: gameMode,
        roundId,
        languageId: activeLanguage.id
      });
    }

    item.element.removeEventListener('animationend', item.missHandler);
    trackTimeout(() => {
      targetBox.classList.remove('feedback-correct', 'feedback-incorrect');
      onItemHandled(droppedId, roundId, false);
    }, 400);
  }

  let score;
  let lives;
  let level;
  let scoreForNextLevel;
  let gameActive;
  let fallDuration;
  let baseSpeedSetting;
  let isBonusRound;
  let introductionsEnabled;
  let activeItems = new Map();
  let seenItems;
  let learningOrder = [];
  let lastItemSound;
  let currentRound;
  let sessionStats;
  let forcedStartItem = null;
  let hasIntroducedForItemInLevel;
  let bonusCaughtInSession = 0;
  let randomLettersEnabled = randomLettersToggle?.checked ?? false;
  let slowRiverEnabled = false;
  let clickModeEnabled = false;
  let selectedFont = 'default';
  let selectedLetter = null; // For click mode
  let goalValue = 10;
  let waveCorrectCount = 0;
  let totalCatchStreak = 0;
  let currentCatchStreak = 0;
  let bestWaveCatch = 0;
  let totalWins = 0;
  const initialLives = 3;
  const learnPhaseDuration = 2500;
  const levelUpThreshold = 50;
  const GOAL_MIN = 5;
  const GOAL_MAX = 25;
  const GOAL_STEP = 1;

  function clonePool(items = []) {
    return items.map((item) => ({ ...item }));
  }

  function getModePool(modeId) {
    if (modeItems[modeId]?.length) return clonePool(modeItems[modeId]);
    if (modeItems.letters?.length) return clonePool(modeItems.letters);
    return clonePool(baseItems);
  }

  function resolveItemById(itemId) {
    return itemsById[itemId] ?? null;
  }

  function resolveItemBySymbol(symbol) {
    return itemsBySymbol[symbol] ?? null;
  }

  function resetToSetupScreen() {
    gameActive = false;
    if (currentRound && currentRound.timers) {
      currentRound.timers.forEach((handle) => clearTrackedTimeout(handle));
    }
    currentRound = null;
    clearAllTimers();

    activeItems.forEach((item) => item.element.remove());
    activeItems.clear();
    choicesContainer.innerHTML = '';
    activeBucketCount = 0;
    applyBucketLayout(0);
    invalidateBucketMinWidth();
    refreshDropZones();
    clearPendingBucketLayout();
    learnOverlay.classList.remove('visible');
    ghostEl.classList.remove('ghost-rise');
    summaryTooltip.classList.add('hidden');
    if (dragGhost) {
      dragGhost.remove();
      dragGhost = null;
    }
    hoverZone?.classList.remove('drag-over');
    hoverZone = null;
    activeDrag = null;

    score = 0;
    lives = initialLives;
    level = 1;
    scoreForNextLevel = levelUpThreshold;
    baseSpeedSetting = parseInt(gameSpeedSlider.value, 10);
    fallDuration = baseSpeedSetting;
    isBonusRound = false;
    seenItems = new Set();
    learningOrder = [];
    lastItemSound = null;
    sessionStats = {};
    hasIntroducedForItemInLevel = false;
    bonusCaughtInSession = 0;
    randomLettersEnabled = randomLettersToggle?.checked ?? false;
    waveCorrectCount = 0;
    totalCatchStreak = 0;
    currentCatchStreak = 0;
    bestWaveCatch = 0;

    updateScore(0, true);
    updateLives();
    updateLevelDisplay();
    updateGoalDisplay();
    updateWaveStat();
    updateStreakStat();

    startButton.textContent = t('game.controls.start');
    isRestartMode = false;
    renderPracticeModes();
    setupView.classList.remove('hidden');
    gameOverView.classList.add('hidden');
    winView?.classList.add('hidden');
    accessibilityView.classList.add('hidden');
    setupExitButton?.classList.remove('hidden');
    modal.classList.remove('hidden');

    // Hide modal internal backdrop so mode select appears directly over current page
    modal.style.background = 'transparent';

    // Hide game container background and children so only the mode select modal is visible
    gameContainer.style.background = 'transparent';
    const topBar = document.getElementById('top-bar');
    if (topBar) topBar.style.display = 'none';
    if (playArea) playArea.style.display = 'none';
    if (choicesContainer) choicesContainer.style.display = 'none';

    // Hide the GameContext wrapper's background (the beige container)
    const gameView = document.getElementById('game-view');
    if (gameView?.parentElement) {
      gameView.parentElement.style.background = 'transparent';
      gameView.parentElement.style.border = 'none';
      gameView.parentElement.style.boxShadow = 'none';

      // Hide the dark backdrop overlay so modal appears directly over current page
      const scrollContainer = gameView.parentElement.parentElement?.parentElement;
      const backdrop = scrollContainer?.previousElementSibling;
      if (backdrop?.classList.contains('backdrop-blur')) {
        backdrop.style.display = 'none';
      }
    }

    refreshDropZones();
  }

  function startGame() {
    score = 0;
    lives = initialLives;
    level = 1;
    waveCorrectCount = 0;
    totalCatchStreak = 0;
    currentCatchStreak = 0;
    bestWaveCatch = 0;
    scoreForNextLevel = levelUpThreshold;
    baseSpeedSetting = parseInt(document.getElementById('game-speed-slider').value, 10);
    fallDuration = baseSpeedSetting;
    gameActive = true;
    isBonusRound = false;
    seenItems = new Set();
    lastItemSound = null;
    currentRound = null;
    sessionStats = {};
    hasIntroducedForItemInLevel = false;
    bonusCaughtInSession = 0;
    randomLettersEnabled = randomLettersToggle?.checked ?? false;
    slowRiverEnabled = slowRiverToggle?.checked ?? false;
    clickModeEnabled = clickModeToggle?.checked ?? false;
    selectedFont = gameFontSelect?.value ?? 'default';
    selectedLetter = null;
    waveCorrectCount = 0;

    const selectedModeButton = document.querySelector('.mode-button.selected');
    gameMode = selectedModeButton?.dataset.mode ?? gameMode ?? practiceModes[0]?.id ?? 'letters';
    introductionsEnabled = document.getElementById('toggle-introductions').checked;

    const gameItemPool = getModePool(gameMode);

    learningOrder = gameItemPool.filter((item) => !seenItems.has(item.id));
    for (let i = learningOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [learningOrder[i], learningOrder[j]] = [learningOrder[j], learningOrder[i]];
    }

    updateScore(0, true);
    updateLives();
    updateLevelDisplay();
    updateWaveStat();
    updateStreakStat();

    // Show game container and play area elements now that the game is starting
    gameContainer.style.background = 'linear-gradient(180deg, #fff9eb 0%, #ffe5bd 100%)';
    const topBar = document.getElementById('top-bar');
    if (topBar) topBar.style.display = '';
    if (playArea) playArea.style.display = '';
    if (choicesContainer) choicesContainer.style.display = '';

    // Restore modal internal backdrop for game-over/win screens
    modal.style.background = 'rgba(74, 34, 8, 0.8)';

    // Restore the GameContext wrapper's background (the beige container)
    const gameView = document.getElementById('game-view');
    if (gameView?.parentElement) {
      gameView.parentElement.style.background = 'linear-gradient(180deg, #fffaf0 0%, #ffe9c9 45%, #ffe2b8 100%)';
      gameView.parentElement.style.border = '2px solid #e49b5a';
      gameView.parentElement.style.boxShadow = '';

      // Restore the dark backdrop overlay
      const scrollContainer = gameView.parentElement.parentElement?.parentElement;
      const backdrop = scrollContainer?.previousElementSibling;
      if (backdrop?.classList.contains('backdrop-blur')) {
        backdrop.style.display = '';
      }
    }

    setupExitButton?.classList.add('hidden');
    modal.classList.add('hidden');
    accessibilityView?.classList.add('hidden');
    learnOverlay.classList.remove('visible');

    activeItems.forEach((item) => item.element.remove());
    activeItems.clear();

    spawnNextRound();
    emit('game:session-start', {
      mode: gameMode,
      settings: {
        mode: gameMode,
        speed: baseSpeedSetting,
        introductions: introductionsEnabled,
        randomLetters: isRandomLettersModeActive()
      },
      languageId: activeLanguage.id
    });
  }

  function endGame() {
    gameActive = false;
    if (currentRound && currentRound.timers) currentRound.timers.forEach((handle) => clearTrackedTimeout(handle));
    currentRound = null;
    activeItems.forEach((item) => item.element.remove());
    activeItems.clear();
    clearAllTimers();

    emit('game:session-complete', {
      mode: gameMode,
      score,
      stats: sessionStats,
      bonusCaught: bonusCaughtInSession,
      settings: {
        mode: gameMode,
        speed: baseSpeedSetting,
        introductions: introductionsEnabled,
        randomLetters: isRandomLettersModeActive()
      },
      languageId: activeLanguage.id
    });

    displayLearningSummary();
    setupView.classList.add('hidden');
    gameOverView.classList.remove('hidden');
    startButton.textContent = t('game.controls.playAgain');
    isRestartMode = true;
    setupExitButton?.classList.add('hidden');
    modal.classList.remove('hidden');
  }

  function displayLearningSummary() {
    const headingEl = document.getElementById('game-over-heading');
    if (headingEl) {
      headingEl.textContent = t('game.summary.gameOver');
    }

    const finalScoreEl = document.getElementById('final-score');
    if (finalScoreEl) {
      finalScoreEl.textContent = t('game.summary.finalScore', { score });
    }

    const summaryContainer = gameOverView.querySelector('.learning-summary-container');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = '';

    const seenInSession = Object.keys(sessionStats);
    if (seenInSession.length === 0) {
      summaryContainer.innerHTML = `<p class="text-arcade-text-soft">${t('game.summary.empty')}</p>`;
      return;
    }

    const encounteredContainer = document.createElement('div');
    encounteredContainer.className = 'flex flex-wrap gap-2 justify-center mb-6';

    seenInSession.forEach((key) => {
      const itemData = resolveItemById(key);
      if (!itemData) return;
      const span = document.createElement('span');
      span.className = `${fontClass} text-3xl p-2 bg-gradient-to-b from-arcade-panel-light to-arcade-panel-medium border-2 border-arcade-panel-border rounded-md cursor-pointer shadow-arcade-sm`;
      span.textContent = itemData.symbol ?? '';

      span.addEventListener('mouseenter', (event) => {
        const transliteration = itemData.transliteration ?? itemData.name ?? '';
        const pronunciation = itemData.pronunciation ?? itemData.sound ?? '';
        summaryTooltip.innerHTML = `
          <div class="font-bold">${transliteration}</div>
          <div>${t('game.summary.soundLabel', { sound: pronunciation })}</div>
        `;
        const targetRect = event.target.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        summaryTooltip.style.left = `${targetRect.left - containerRect.left + targetRect.width / 2 - summaryTooltip.offsetWidth / 2}px`;
        summaryTooltip.style.top = `${targetRect.top - containerRect.top - summaryTooltip.offsetHeight - 8}px`;
        summaryTooltip.classList.remove('hidden');
      });
      span.addEventListener('mouseleave', () => summaryTooltip.classList.add('hidden'));
      encounteredContainer.appendChild(span);
    });

    const encounteredTitle = document.createElement('h3');
    encounteredTitle.className = 'text-xl font-bold text-arcade-accent-orange mb-2';
    encounteredTitle.textContent = t('game.summary.heading');
    summaryContainer.appendChild(encounteredTitle);
    summaryContainer.appendChild(encounteredContainer);

    let weakestLink = null;
    let maxIncorrect = 0;
    for (const key in sessionStats) {
      if (sessionStats[key].incorrect > maxIncorrect) {
        maxIncorrect = sessionStats[key].incorrect;
        weakestLink = key;
      }
    }

    if (weakestLink && maxIncorrect > 0) {
      const weakestLinkItem = resolveItemById(weakestLink);
      if (weakestLinkItem) {
        const weakestLinkContainer = document.createElement('div');
        weakestLinkContainer.innerHTML = `
            <h3 class="text-xl font-bold text-arcade-accent-orange mb-2">${t('game.summary.weakestLink')}</h3>
            <p class="mb-3 text-sm text-arcade-text-soft">${t('game.summary.weakestLinkDescription')}</p>
            <div class="flex items-center justify-center gap-4">
              <span class="${fontClass} text-5xl">${weakestLinkItem.symbol ?? ''}</span>
              <button id="practice-weakest-btn" class="bg-gradient-to-b from-arcade-accent-gold to-arcade-accent-orange hover:shadow-arcade-md text-arcade-text-main font-bold py-2 px-4 rounded-lg shadow-arcade-sm border-2 border-arcade-accent-orange">${t('game.summary.practice')}</button>
            </div>`;
        summaryContainer.appendChild(weakestLinkContainer);
        document.getElementById('practice-weakest-btn').addEventListener('click', () => {
          forcedStartItem = { ...weakestLinkItem };
          startGame();
        });
      }
    }
  }

  function updateScore(points = 0, reset = false) {
    if (reset) score = 0;
    else score += points;
    scoreEl.textContent = score;
    if (points > 0) {
      scoreEl.classList.add('score-pop');
      trackTimeout(() => scoreEl.classList.remove('score-pop'), 300);
    }
    if (score >= scoreForNextLevel && !isBonusRound) levelUp();
  }

  function levelUp() {
    level++;
    hasIntroducedForItemInLevel = false;
    scoreForNextLevel += levelUpThreshold;
    if (fallDuration > 7) fallDuration -= 1;
    isBonusRound = level % 5 === 0 && gameMode === 'letters';
    const levelUpText = isBonusRound ? t('game.status.bonusRound') : t('game.status.levelUp');

    const levelLabel = levelEl.previousElementSibling;
    levelLabel.classList.add('hidden');
    levelEl.textContent = levelUpText;
    levelEl.classList.add('flash-level-up', 'text-3xl');
    levelEl.classList.remove('text-2xl');
    trackTimeout(() => {
      levelLabel.classList.remove('hidden');
      levelEl.classList.remove('flash-level-up', 'text-3xl');
      levelEl.classList.add('text-2xl');
      updateLevelDisplay();
    }, 1800);
    emit('game:level-up', { level, mode: gameMode });
  }

  function updateLevelDisplay() {
    levelEl.textContent = level;
  }

  function updateLives(isLost = false) {
    livesContainer.innerHTML = '';
    for (let i = 0; i < initialLives; i++) {
      const heart = document.createElement('span');
      heart.textContent = '❤️';
      heart.className = `transition-opacity duration-300 ${i < lives ? 'opacity-100' : 'opacity-20'}`;
      livesContainer.appendChild(heart);
    }
    if (isLost) {
      gameContainer.classList.add('life-lost-shake');
      trackTimeout(() => gameContainer.classList.remove('life-lost-shake'), 500);
    }
  }

  function triggerStatGhost(ghostEl, icon) {
    if (!ghostEl) return;
    ghostEl.textContent = `+1 ${icon}`;
    ghostEl.classList.remove('stat-badge__ghost--visible');
    // Force reflow so the animation restarts
    void ghostEl.offsetWidth;
    ghostEl.classList.add('stat-badge__ghost--visible');
    trackTimeout(() => ghostEl.classList.remove('stat-badge__ghost--visible'), 900);
  }

  function updateWaveStat(triggerGhost = false) {
    if (!waveStatValue) return;
    waveStatValue.textContent = bestWaveCatch;
    if (triggerGhost) {
      triggerStatGhost(waveStatGhost, '🌊');
    }
  }

  function updateStreakStat(triggerGhost = false) {
    if (!streakStatValue) return;
    streakStatValue.textContent = totalCatchStreak;
    if (triggerGhost) {
      triggerStatGhost(streakStatGhost, '🔥');
    }
  }

  function spawnNextRound() {
    if (!gameActive) return;
    // Reset wave counter at the start of each new wave/round
    waveCorrectCount = 0;
    if (isBonusRound) {
      spawnBonusRound();
      return;
    }

    let roundItems = [];

    const itemPool = getModePool(gameMode);

    if (isRandomLettersModeActive()) {
      const totalItemsInRound = Math.max(1, level);
      const availablePool = [...itemPool];

      if (forcedStartItem && level === 1) {
        roundItems.push(forcedStartItem);
        forcedStartItem = null;
      }

      for (let i = roundItems.length; i < totalItemsInRound; i++) {
        if (!availablePool.length) {
          if (!itemPool.length) break;
          availablePool.push(...itemPool);
        }
        const randomIndex = Math.floor(Math.random() * availablePool.length);
        const [selectedItem] = availablePool.splice(randomIndex, 1);
        if (!selectedItem) break;
        roundItems.push(selectedItem);
      }

      hasIntroducedForItemInLevel = roundItems.some((item) => item && !seenItems.has(item.id));

      // Filter out any invalid items to prevent spawning without buckets
      roundItems = roundItems.filter((item) => item && item.id);

      currentRound = { id: Date.now(), items: roundItems, handledCount: 0, timers: [] };
      generateChoices(roundItems, itemPool);
      processItemsForRound(roundItems, currentRound.id);
      return;
    }

    let seenSoFar = itemPool.filter((item) => seenItems.has(item.id));
    const totalItemsInRound = level;
    const shouldIntroduceNew = !hasIntroducedForItemInLevel && learningOrder.length > 0;

    if (forcedStartItem && level === 1) {
      roundItems.push(forcedStartItem);
      forcedStartItem = null;
      hasIntroducedForItemInLevel = true;
    } else if (shouldIntroduceNew) {
      if (level === 1) {
        if (learningOrder.length > 0) roundItems.push(learningOrder.shift());
        if (learningOrder.length > 0) roundItems.push(learningOrder.shift());
      } else {
        roundItems.push(learningOrder.shift());
      }
      hasIntroducedForItemInLevel = true;
    }

    while (roundItems.length < totalItemsInRound && seenSoFar.length > 0) {
      const chosenIndex = Math.floor(Math.random() * seenSoFar.length);
      const reviewItem = seenSoFar.splice(chosenIndex, 1)[0];
      if (!roundItems.some((item) => item.id === reviewItem.id)) roundItems.push(reviewItem);
    }

    if (roundItems.length === 0 && seenSoFar.length > 0) {
      roundItems.push(seenSoFar[Math.floor(Math.random() * seenSoFar.length)]);
    } else if (roundItems.length === 0 && learningOrder.length > 0) {
      roundItems.push(learningOrder.shift());
    }

    // Filter out any invalid items to prevent spawning without buckets
    roundItems = roundItems.filter((item) => item && item.id);

    currentRound = { id: Date.now(), items: roundItems, handledCount: 0, timers: [] };
    generateChoices(roundItems, itemPool);
    processItemsForRound(roundItems, currentRound.id);
  }

  function isRandomLettersModeActive() {
    return randomLettersEnabled && gameMode === 'letters';
  }

  function processItemsForRound(items, roundId) {
    let totalDelay = 0;
    items.forEach((itemData) => {
      if (!itemData || !itemData.id) return;
      if (currentRound.id !== roundId) return;
      const isNewItem = !seenItems.has(itemData.id);
      let delayForNext = 500;

      if (isNewItem && introductionsEnabled) {
        const showTime = totalDelay;
        const t1 = trackTimeout(() => {
          if (!gameActive || currentRound.id !== roundId) return;
          learnLetterEl.textContent = itemData.symbol;
          const transliteration = itemData.transliteration ?? itemData.name ?? '';
          const pronunciation = getDisplayLabel(itemData);
          learnName.textContent = transliteration;
          learnSound.textContent = pronunciation ? t('game.summary.soundLabel', { sound: pronunciation }) : '';
          learnOverlay.classList.add('visible');
          startItemDrop(itemData, roundId);
        }, showTime);
        currentRound.timers.push(t1);

        const t2 = trackTimeout(() => {
          learnOverlay.classList.remove('visible');
        }, showTime + learnPhaseDuration);
        currentRound.timers.push(t2);
        delayForNext = learnPhaseDuration + 500;
      } else {
        const t3 = trackTimeout(() => {
          if (gameActive && currentRound.id === roundId) startItemDrop(itemData, roundId);
        }, totalDelay);
        currentRound.timers.push(t3);
      }
      totalDelay += delayForNext;
    });
  }

  function startItemDrop(itemData, roundId) {
    if (!gameActive) return;
    const elementId = `item-${Date.now()}-${Math.random()}`;
    const itemEl = document.createElement('div');
    itemEl.id = elementId;
    itemEl.isDropped = false;
    itemEl.textContent = itemData.symbol;

    // Determine animation based on settings
    let animationName;
    if (slowRiverEnabled) {
      animationName = 'slow-river-flow';
    } else {
      const reducedMotion = reducedMotionToggle.checked;
      animationName = reducedMotion ? 'simple-flow' : ['river-flow-1', 'river-flow-2'][Math.floor(Math.random() * 2)];
    }

    // Apply font class based on selected font
    const fontStyleClass = selectedFont !== 'default' ? `game-font-${selectedFont}` : '';
    itemEl.className = `falling-letter font-bold ${fontClass} ${fontStyleClass} text-arcade-text-main ${animationName}`;

    // In Slow River mode, use less top position variation
    if (slowRiverEnabled) {
      itemEl.style.top = `${30 + Math.random() * 40}%`; // 30-70% range centered
    } else {
      itemEl.style.top = `${Math.random() * 70}%`;
    }
    itemEl.style.left = '0'; // Explicit left positioning to prevent RTL dir from affecting spawn position

    // Invert slider value: 34 - value (so left=slow, right=fast)
    // In Slow River mode, letters move to center and stay, so use slower animation
    const sliderValue = parseInt(gameSpeedSlider.value, 10);
    const invertedSpeed = slowRiverEnabled ? Math.max(10, 34 - sliderValue) : 34 - sliderValue;
    itemEl.style.animationDuration = `${invertedSpeed}s`;
    itemEl.draggable = true;
    const pronunciation = itemData.pronunciation ?? itemData.sound ?? '';
    const transliteration = itemData.transliteration ?? itemData.name ?? '';
    const ariaLabel = letterDescriptionTemplate
      ? formatTemplate(letterDescriptionTemplate, {
          symbol: itemData.symbol ?? '',
          name: itemData.name ?? '',
          transliteration,
          pronunciation
        })
      : `${transliteration} ${pronunciation}`.trim();
    if (ariaLabel) itemEl.setAttribute('aria-label', ariaLabel);
    itemEl.addEventListener('dragstart', (e) => {
      const dragData = JSON.stringify({
        sound: itemData.sound,
        id: elementId,
        roundId,
        itemId: itemData.id,
        symbol: itemData.symbol
      });
      e.dataTransfer.setData('application/json', dragData);
      itemEl.style.animationPlayState = 'paused';
      itemEl.classList.add('dragging');
      trackTimeout(() => {
        itemEl.style.visibility = 'hidden';
      }, 0);
    });
    itemEl.addEventListener('dragend', () => {
      itemEl.classList.remove('dragging');
      if (!itemEl.isDropped) {
        itemEl.style.visibility = 'visible';
        itemEl.style.animationPlayState = 'running';
      }
    });

    // In Slow River mode, letters don't trigger miss on animationend since they stay on screen
    const missHandler = slowRiverEnabled ? null : () => onItemHandled(elementId, roundId, true);
    if (missHandler) {
      itemEl.addEventListener('animationend', missHandler);
    }

    activeItems.set(elementId, { data: itemData, element: itemEl, missHandler });
    playArea.appendChild(itemEl);

    const payload = {
      sound: itemData.sound,
      id: elementId,
      roundId,
      itemId: itemData.id,
      symbol: itemData.symbol
    };

    // Use click mode or drag mode based on settings
    if (clickModeEnabled) {
      startClickMode(itemEl, payload);
    } else {
      startPointerDrag(itemEl, payload);
    }
  }

  function onItemHandled(itemId, roundId, isMiss) {
    if (!activeItems.has(itemId)) return;
    if (roundId === 'bonus') {
      const item = activeItems.get(itemId);
      item.element.remove();
      activeItems.delete(itemId);
      return;
    }
    if (!currentRound || currentRound.id !== roundId) return;

    const item = activeItems.get(itemId);
    const itemData = item?.data ?? {};
    const key = itemData.id;
    if (!isBonusRound && key && !sessionStats[key]) sessionStats[key] = { correct: 0, incorrect: 0 };
    if (!isBonusRound && key && isMiss) sessionStats[key].incorrect++;
    if (key) seenItems.add(key);

    item.element.remove();
    activeItems.delete(itemId);
    currentRound.handledCount++;

    if (isMiss && !isBonusRound && key) {
      waveCorrectCount = 0;
      currentCatchStreak = 0;
      lives--;
      updateLives(true);
      emit('game:letter-result', {
        itemId: key,
        symbol: itemData.symbol,
        sound: itemData.sound,
        correct: false,
        mode: gameMode,
        roundId,
        reason: 'timeout',
        languageId: activeLanguage.id
      });
    }
    if (lives <= 0) {
      endGame();
      return;
    }
    if (currentRound.handledCount === currentRound.items.length) {
      if (isBonusRound) isBonusRound = false;
      spawnNextRound();
    }
  }

  function generateChoices(correctItems, itemPool) {
    choicesContainer.innerHTML = '';
    activeBucketCount = 0;
    applyBucketLayout(0);
    clearPendingBucketLayout();
    invalidateBucketMinWidth();
    refreshDropZones();
    if (correctItems.length === 0) return;

    const uniqueCorrect = new Map();
    correctItems.forEach((item) => {
      if (!item || uniqueCorrect.has(item.id)) return;
      uniqueCorrect.set(item.id, item);
    });
    const correctChoices = Array.from(uniqueCorrect.values());
    const correctIds = new Set(correctChoices.map((i) => i.id));
    let finalChoices = [...correctChoices];

    let distractorPool = itemPool.filter((i) => !correctIds.has(i.id));
    distractorPool.sort(() => 0.5 - Math.random());

    let i = 0;
    while (finalChoices.length < 4 && i < distractorPool.length) {
      finalChoices.push(distractorPool[i]);
      i++;
    }

    finalChoices.sort(() => 0.5 - Math.random());

    finalChoices.forEach((choice) => {
      const box = document.createElement('div');
      const displaySymbol = getDisplaySymbol(choice);
      const displayLabel = getDisplayLabel(choice);
      const labelText = displayLabel || displaySymbol;
      box.textContent = labelText;
      box.dataset.itemId = choice.id;
      box.className = 'catcher-box bg-gradient-to-b from-arcade-panel-light to-arcade-panel-medium text-arcade-text-main font-bold py-5 sm:py-6 px-2 rounded-lg text-2xl transition-all border-2 border-arcade-panel-border shadow-arcade-sm';
      const ariaLabel = getCharacterAriaLabel(choice);
      if (ariaLabel) box.setAttribute('aria-label', ariaLabel);
      box.addEventListener('dragover', (e) => {
        e.preventDefault();
        box.classList.add('drag-over');
      });
      box.addEventListener('dragleave', () => box.classList.remove('drag-over'));
      box.addEventListener('drop', handleDrop);
      choicesContainer.appendChild(box);
    });
    activeBucketCount = finalChoices.length;
    invalidateBucketMinWidth();
    applyBucketLayout();
    clearPendingBucketLayout();
    refreshDropZones();
  }

  function spawnBonusRound() {
    if (!gameActive) return;
    activeItems.forEach((item) => item.element.remove());
    activeItems.clear();
    choicesContainer.innerHTML = '';
    activeBucketCount = 0;
    applyBucketLayout(0);
    clearPendingBucketLayout();
    invalidateBucketMinWidth();

    learnLetterEl.textContent = '💎';
    learnName.textContent = t('game.bonus.title');
    learnSound.textContent = t('game.bonus.instruction');
    learnOverlay.classList.add('visible');
    refreshDropZones();

    const bonusCatcher = document.createElement('div');
    bonusCatcher.textContent = t('game.bonus.catchHere');
    bonusCatcher.dataset.itemId = 'bonus-gem';
    bonusCatcher.className = 'catcher-box bg-gradient-to-b from-arcade-accent-gold to-arcade-accent-orange text-arcade-text-main font-bold py-6 px-2 rounded-lg text-lg transition-all border-2 border-arcade-accent-orange shadow-arcade-md col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5';
    bonusCatcher.setAttribute('aria-label', t('game.bonus.catchHere'));
    bonusCatcher.addEventListener('dragover', (e) => {
      e.preventDefault();
      bonusCatcher.classList.add('drag-over');
    });
    bonusCatcher.addEventListener('dragleave', () => bonusCatcher.classList.remove('drag-over'));
    bonusCatcher.addEventListener('drop', handleDrop);
    choicesContainer.appendChild(bonusCatcher);
    activeBucketCount = 1;
    invalidateBucketMinWidth();
    applyBucketLayout();
    clearPendingBucketLayout();
    refreshDropZones();

    let timeLeft = 10;
    const bonusDuration = 10000;
    const bonusTimerInterval = trackInterval(() => {
      timeLeft--;
      learnSound.textContent = t('game.bonus.timeLeft', { seconds: Math.max(timeLeft, 0) });
      if (timeLeft <= 0) clearTrackedInterval(bonusTimerInterval);
    }, 1000);

    const gemSpawner = trackInterval(() => {
      if (!gameActive) {
        clearTrackedInterval(gemSpawner);
        return;
      }
      startGemDrop();
    }, 400);

    const bonusTimeout = trackTimeout(() => {
      clearTrackedInterval(gemSpawner);
      clearTrackedInterval(bonusTimerInterval);
      const cleanupTimeout = trackTimeout(() => {
        if (!gameActive) return;
        learnOverlay.classList.remove('visible');
        isBonusRound = false;
        document.querySelectorAll('.falling-gem').forEach((gem) => gem.remove());
        spawnNextRound();
      }, 2000);
      if (currentRound) currentRound.timers.push(cleanupTimeout);
    }, bonusDuration);
    if (currentRound) currentRound.timers.push(bonusTimeout);
  }

  function startGemDrop() {
    if (!gameActive) return;
    const elementId = `gem-${Date.now()}-${Math.random()}`;
    const itemEl = document.createElement('div');
    itemEl.id = elementId;
    itemEl.isDropped = false;
    itemEl.textContent = '💎';
    const reducedMotion = reducedMotionToggle.checked;
    const animationName = reducedMotion ? 'simple-flow' : ['river-flow-1', 'river-flow-2'][Math.floor(Math.random() * 2)];
    itemEl.className = `falling-gem text-4xl sm:text-5xl ${animationName}`;
    itemEl.style.top = `${Math.random() * 70}%`;
    itemEl.style.left = '0'; // Explicit left positioning to prevent RTL dir from affecting spawn position
    const bonusSpeed = Math.max(5, parseInt(gameSpeedSlider.value, 10) - 5);
    itemEl.style.animationDuration = `${bonusSpeed}s`;
    itemEl.draggable = true;
    itemEl.setAttribute('aria-label', t('game.bonus.gemAria'));
    itemEl.addEventListener('dragstart', (e) => {
      const dragData = JSON.stringify({
        sound: 'bonus-gem',
        id: elementId,
        roundId: 'bonus',
        itemId: 'bonus-gem',
        symbol: '💎'
      });
      e.dataTransfer.setData('application/json', dragData);
      itemEl.style.animationPlayState = 'paused';
      itemEl.classList.add('dragging');
      trackTimeout(() => {
        itemEl.style.visibility = 'hidden';
      }, 0);
    });

    itemEl.addEventListener('dragend', () => {
      itemEl.classList.remove('dragging');
      if (!itemEl.isDropped) {
        itemEl.style.visibility = 'visible';
        itemEl.style.animationPlayState = 'running';
      }
    });
    const missHandler = () => onItemHandled(elementId, 'bonus', true);
    itemEl.addEventListener('animationend', missHandler);
    activeItems.set(elementId, { data: { sound: 'bonus-gem', id: 'bonus-gem', symbol: '💎' }, element: itemEl, missHandler });
    playArea.appendChild(itemEl);
    startPointerDrag(itemEl, {
      sound: 'bonus-gem',
      id: elementId,
      roundId: 'bonus',
      itemId: 'bonus-gem',
      symbol: '💎'
    });
  }

  // Helper to sync settings to localStorage
  function syncSettingsToLocalStorage() {
    try {
      const settings = {
        showIntroductions: document.getElementById('toggle-introductions')?.checked ?? true,
        highContrast: highContrastToggle?.checked ?? false,
        randomLetters: randomLettersToggle?.checked ?? false,
        reducedMotion: reducedMotionToggle?.checked ?? false,
        gameSpeed: parseInt(gameSpeedSlider?.value ?? 17, 10),
        gameFont: gameFontSelect?.value ?? 'default',
        slowRiver: slowRiverToggle?.checked ?? false,
        clickMode: clickModeToggle?.checked ?? false
      };
      localStorage.setItem('gameSettings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save game settings', e);
    }
  }

  // Load settings from localStorage on game init
  function loadSettingsFromLocalStorage() {
    try {
      const saved = localStorage.getItem('gameSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        const introductionsToggle = document.getElementById('toggle-introductions');
        if (introductionsToggle) introductionsToggle.checked = settings.showIntroductions ?? true;
        if (highContrastToggle) highContrastToggle.checked = settings.highContrast ?? false;
        if (randomLettersToggle) randomLettersToggle.checked = settings.randomLetters ?? false;
        if (reducedMotionToggle) reducedMotionToggle.checked = settings.reducedMotion ?? false;
        if (gameSpeedSlider) gameSpeedSlider.value = settings.gameSpeed ?? 17;
        if (gameFontSelect) gameFontSelect.value = settings.gameFont ?? 'default';
        if (slowRiverToggle) slowRiverToggle.checked = settings.slowRiver ?? false;
        if (clickModeToggle) clickModeToggle.checked = settings.clickMode ?? false;
        if (settings.highContrast) {
          document.body.classList.add('high-contrast');
        }
      }
    } catch (e) {
      console.error('Failed to load game settings', e);
    }
  }

  loadSettingsFromLocalStorage();

  accessibilityBtn?.addEventListener('click', () => {
    const btnRect = accessibilityBtn.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    accessibilityView.style.top = `${btnRect.bottom - containerRect.top + 5}px`;
    accessibilityView.style.right = `${containerRect.right - btnRect.right}px`;
    accessibilityView.classList.toggle('hidden');
    // Reload settings when opening the menu to ensure checkboxes reflect current state
    if (!accessibilityView.classList.contains('hidden')) {
      loadSettingsFromLocalStorage();
    }
  });
  closeAccessibilityBtn?.addEventListener('click', () => accessibilityView.classList.add('hidden'));
  highContrastToggle?.addEventListener('change', (e) => {
    document.body.classList.toggle('high-contrast', e.target.checked);
    syncSettingsToLocalStorage();
  });
  randomLettersToggle?.addEventListener('change', (e) => {
    randomLettersEnabled = e.target.checked;
    syncSettingsToLocalStorage();
  });
  slowRiverToggle?.addEventListener('change', (e) => {
    slowRiverEnabled = e.target.checked;
    syncSettingsToLocalStorage();
  });
  clickModeToggle?.addEventListener('change', (e) => {
    clickModeEnabled = e.target.checked;
    // Refresh drop zones to update click handlers
    refreshDropZones();
    syncSettingsToLocalStorage();
  });
  gameFontSelect?.addEventListener('change', (e) => {
    selectedFont = e.target.value;
    syncSettingsToLocalStorage();
  });
  reducedMotionToggle?.addEventListener('change', () => {
    syncSettingsToLocalStorage();
  });

  const speedSlowLabel = t('game.accessibility.speedSlow');
  const speedFastLabel = t('game.accessibility.speedFast');
  const speedNormalLabel = t('game.accessibility.speedNormal');

  gameSpeedSlider?.addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    // Invert: left=slow (10→24s), right=fast (24→10s)
    if (v < 14) speedLabel.textContent = speedSlowLabel;
    else if (v > 20) speedLabel.textContent = speedFastLabel;
    else speedLabel.textContent = speedNormalLabel;
    syncSettingsToLocalStorage();
  });

  // Also sync the introductions toggle
  const introductionsToggle = document.getElementById('toggle-introductions');
  introductionsToggle?.addEventListener('change', () => {
    syncSettingsToLocalStorage();
  });

  function updateModalSubtitle() {
    const selectedInput = document.querySelector('input[name="gameMode"]:checked');
    const selectedMode = selectedInput?.value ?? 'letters';
    const noun = modeNounMap[selectedMode] ?? nounFallback;
    const text = formatTemplate(subtitleTemplate, { noun });
    if (modalSubtitle) modalSubtitle.textContent = text;
  }

  renderPracticeModes();

  startButton?.addEventListener('click', () => {
    if (isRestartMode) {
      gameOverView.classList.add('hidden');
      setupView.classList.remove('hidden');
      accessibilityView.classList.add('hidden');
      startButton.textContent = t('game.controls.start');
      isRestartMode = false;
      setupExitButton?.classList.remove('hidden');
      updateModalSubtitle();
    } else {
      startGame();
    }
  });

  function handleDrop(e) {
    e.preventDefault();
    const targetBox = e.currentTarget;
    targetBox.classList.remove('drag-over');
    const { id: droppedId, roundId, itemId: droppedItemId, symbol: droppedSymbol } = JSON.parse(
      e.dataTransfer.getData('application/json')
    );
    if (!gameActive || !activeItems.has(droppedId)) return;

    const targetItemId = targetBox.dataset.itemId;
    const item = activeItems.get(droppedId);

    item.element.isDropped = true;
    if (!isBonusRound && droppedItemId && !sessionStats[droppedItemId]) {
      sessionStats[droppedItemId] = { correct: 0, incorrect: 0 };
    }

    const isCorrect = isBonusRound || targetItemId === droppedItemId;
    if (isBonusRound) {
      bonusCaughtInSession += 1;
      emit('game:bonus-catch', { count: bonusCaughtInSession, score, languageId: activeLanguage.id });
    }

    if (isCorrect) {
      updateScore(isBonusRound ? 25 : 10);
      targetBox.classList.add('feedback-correct');
      if (!isBonusRound && droppedItemId) {
        sessionStats[droppedItemId].correct++;
        waveCorrectCount++;
        currentCatchStreak++;
        if (waveCorrectCount > bestWaveCatch) {
          bestWaveCatch = waveCorrectCount;
          updateWaveStat(true);
        }
        const improvedStreak = currentCatchStreak > totalCatchStreak;
        totalCatchStreak = Math.max(totalCatchStreak, currentCatchStreak);
        if (improvedStreak) {
          updateStreakStat(true);
        }
        if (waveCorrectCount >= goalValue) {
          totalWins++;
          trackTimeout(() => {
            showWinScreen();
          }, 500);
        }
      }
      // Hide the letter immediately after correct drop
      item.element.style.display = 'none';
    } else {
      lives--;
      updateLives(true);
      targetBox.classList.add('feedback-incorrect');
      if (!isBonusRound && droppedItemId) {
        sessionStats[droppedItemId].incorrect++;
        waveCorrectCount = 0;
        currentCatchStreak = 0;
      }

      // Find the correct bucket to show its sound/label
      const correctBucket = choicesContainer.querySelector(`[data-item-id="${droppedItemId}"]`);
      const correctLabel = correctBucket ? correctBucket.textContent : (getDisplayLabel(item.data) || getDisplaySymbol(item.data));
      const boxRect = targetBox.getBoundingClientRect();
      const gameRect = gameContainer.getBoundingClientRect();
      ghostEl.textContent = correctLabel;
      ghostEl.style.display = 'block';
      const ghostWidth = ghostEl.offsetWidth;
      ghostEl.style.display = '';
      ghostEl.style.left = `${boxRect.left - gameRect.left + boxRect.width / 2 - ghostWidth / 2}px`;
      ghostEl.style.top = `${boxRect.top - gameRect.top}px`;
      ghostEl.classList.add('ghost-rise');
      trackTimeout(() => {
        ghostEl.classList.remove('ghost-rise');
      }, 2000);
      // Hide the letter immediately after incorrect drop too
      item.element.style.display = 'none';
    }

    if (!isBonusRound) {
      emit('game:letter-result', {
        itemId: droppedItemId,
        symbol: droppedSymbol,
        sound: item.data.sound,
        correct: isCorrect,
        mode: gameMode,
        roundId,
        languageId: activeLanguage.id
      });
    }

    item.element.removeEventListener('animationend', item.missHandler);
    trackTimeout(() => {
      targetBox.classList.remove('feedback-correct', 'feedback-incorrect');
      onItemHandled(droppedId, roundId, false);
    }, 400);
  }

  document.addEventListener('dragstart', () => {
    // ensure drop zones refresh when dragging begins (for responsive layouts)
    refreshDropZones();
  });

  updateLives();
  updateModalSubtitle();
  refreshDropZones();

  const handleReturnToMenu = () => {
    resetToSetupScreen();
    onReturnToMenu?.();
  };

  backToMenuButton?.addEventListener('click', handleReturnToMenu);
  setupExitButton?.addEventListener('click', handleReturnToMenu);
  gameOverExitButton?.addEventListener('click', handleReturnToMenu);
  goalIncreaseBtn?.addEventListener('click', increaseGoal);
  goalDecreaseBtn?.addEventListener('click', decreaseGoal);
  continuePlayingButton?.addEventListener('click', continueAfterWin);
  winExitButton?.addEventListener('click', exitFromWin);

  const setGoalTooltipVisibility = (isVisible) => {
    goalTooltip?.classList.toggle('hidden', !isVisible);
    goalInfoIcon?.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
  };

  // Goal info icon tooltip handlers
  goalInfoIcon?.addEventListener('mouseenter', () => {
    setGoalTooltipVisibility(true);
  });
  goalInfoIcon?.addEventListener('mouseleave', () => {
        setGoalTooltipVisibility(false);
  });
  goalInfoIcon?.addEventListener('focus', () => {
    setGoalTooltipVisibility(true);
  });
  goalInfoIcon?.addEventListener('blur', () => {
    setGoalTooltipVisibility(false);
  });
  goalInfoIcon?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = goalTooltip ? goalTooltip.classList.contains('hidden') === false : false;
    setGoalTooltipVisibility(!isVisible);
  });
  // Close tooltip when clicking outside
  document.addEventListener('click', (e) => {
    if (goalTooltip && !goalTooltip.classList.contains('hidden') &&
        !goalInfoIcon?.contains(e.target) && !goalTooltip?.contains(e.target)) {
      setGoalTooltipVisibility(false);
    }
  });

  function setGameMode(value) {
    const button = document.querySelector(`.mode-button[data-mode="${value}"]`);
    if (button) {
      // Remove selected class from all buttons
      document.querySelectorAll('.mode-button').forEach((btn) => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-checked', 'false');
      });

      // Add selected class to target button
      button.classList.add('selected');
      button.setAttribute('aria-checked', 'true');
      gameMode = value;
      updateModalSubtitle();
    }
  }

  function forceStartByHebrew(symbol) {
    const match = resolveItemBySymbol(symbol) ?? allLanguageItems.find((entry) => entry.symbol === symbol);
    if (match) forcedStartItem = { ...match };
  }

  return { resetToSetupScreen, startGame, setGameMode, forceStartByHebrew };
}
