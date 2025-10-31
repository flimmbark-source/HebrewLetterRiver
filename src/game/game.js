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
  const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
  const gameSpeedSlider = document.getElementById('game-speed-slider');
  const speedLabel = document.getElementById('speed-label');
  const installBtn = document.getElementById('install-btn');
  const backToMenuButton = document.getElementById('back-to-menu-button');
  const modeOptionsContainer = document.getElementById('mode-options');

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
    introductionsConfig.subtitleTemplate ?? 'Drag the moving item to the correct box!'
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
      const label = document.createElement('label');
      label.className = 'setup-label cursor-pointer';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'gameMode';
      input.value = mode.id;
      input.className = 'hidden';
      input.checked = index === 0;
      input.defaultChecked = index === 0;

      const card = document.createElement('div');
      card.className =
        'flex h-full flex-col rounded-2xl border-2 border-slate-600 bg-slate-800/70 p-4 transition hover:border-cyan-400/80';

      const title = document.createElement('span');
      title.className = `text-base font-semibold text-white sm:text-lg ${fontClass}`;
      title.textContent = mode.label;
      card.appendChild(title);

      if (mode.description) {
        const description = document.createElement('p');
        description.className = 'mt-1 text-sm text-slate-400';
        description.textContent = mode.description;
        card.appendChild(description);
      }

      label.appendChild(input);
      label.appendChild(card);
      modeOptionsContainer.appendChild(label);

      input.addEventListener('change', () => {
        gameMode = input.value;
        updateModalSubtitle();
      });
    });

    const selectedInput = modeOptionsContainer.querySelector('input[name="gameMode"]:checked');
    if (selectedInput) {
      gameMode = selectedInput.value;
    } else {
      const firstRadio = modeOptionsContainer.querySelector('input[name="gameMode"]');
      if (firstRadio) {
        firstRadio.checked = true;
        gameMode = firstRadio.value;
      }
    }
    updateModalSubtitle();
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
  const BUCKET_MIN_WIDTH_FALLBACK = 96;
  const LAYOUT_GAP_FALLBACK = 12;
  let pendingBucketLayoutHandle = null;
  let pendingBucketLayoutIsAnimationFrame = false;
  let bucketResizeObserver = null;
  let bucketResizeHandler = null;
  let bucketMeasurementElement = null;
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
    bucketMeasurementElement.style.width = 'max-content';
    bucketMeasurementElement.style.maxWidth = 'max-content';
    bucketMeasurementElement.style.whiteSpace = 'nowrap';
    bucketMeasurementElement.style.boxSizing = 'border-box';
    document.body.appendChild(bucketMeasurementElement);
    return bucketMeasurementElement;
  }

  function getBucketMinWidth() {
    if (!choicesContainer || typeof window === 'undefined') {
      return BUCKET_MIN_WIDTH_FALLBACK;
    }
    const buckets = choicesContainer.querySelectorAll('.catcher-box');
    if (!buckets.length) return BUCKET_MIN_WIDTH_FALLBACK;
    const measurementElement = ensureBucketMeasurementElement();
    if (!measurementElement) return BUCKET_MIN_WIDTH_FALLBACK;
    let maxWidth = 0;
    buckets.forEach((bucket) => {
      measurementElement.className = bucket.className;
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

  function refreshDropZones() {
    dropZones = Array.from(document.querySelectorAll('.catcher-box')).map((el) => ({
      el,
      rect: el.getBoundingClientRect()
    }));
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
    clearPendingBucketLayout();
    const runUpdate = () => {
      pendingBucketLayoutHandle = null;
      applyBucketLayout();
      if (activeBucketCount > 0) {
        refreshDropZones();
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
    const containerWidth = choicesContainer.clientWidth;
    if (containerWidth <= 0) return;
    const minBucketWidth = getBucketMinWidth();
    const computed = window.getComputedStyle?.(choicesContainer);
    const gapValueRaw = computed?.columnGap || computed?.gap || `${LAYOUT_GAP_FALLBACK}px`;
    const gapValue = parseFloat(gapValueRaw) || LAYOUT_GAP_FALLBACK;
    const totalGap = gapValue * Math.max(count - 1, 0);
    const availableWidth = containerWidth - totalGap;
    if (availableWidth / count >= minBucketWidth) {
      choicesContainer.style.gridTemplateColumns = `repeat(${count}, minmax(${minBucketWidth}px, 1fr))`;
      return;
    }
    const numerator = containerWidth + gapValue;
    const maxColumns = Math.max(
      1,
      Math.min(count, Math.floor(numerator / (minBucketWidth + gapValue)))
    );
    choicesContainer.style.gridTemplateColumns = `repeat(${maxColumns}, minmax(${minBucketWidth}px, 1fr))`;
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
      const { el, rect } = dropZones[i];
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return el;
    }
    return null;
  }

  function startPointerDrag(itemEl, payload) {
    function onDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      itemEl.setPointerCapture?.(e.pointerId);

      itemEl.style.animationPlayState = 'paused';
      itemEl.classList.add('dragging');

      activeDrag = { el: itemEl, data: payload };

      const ghost = ensureDragGhost();
      ghost.textContent = itemEl.textContent;
      ghost.className = itemEl.classList.contains('falling-gem') ? 'text-5xl' : `${fontClass} text-6xl`;
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
      if (!isBonusRound && droppedItemId) sessionStats[droppedItemId].correct++;
    } else {
      lives--;
      updateLives(true);
      targetBox.classList.add('feedback-incorrect');
      if (!isBonusRound && droppedItemId) sessionStats[droppedItemId].incorrect++;

      const correctSymbol = getDisplaySymbol(item.data);
      const boxRect = targetBox.getBoundingClientRect();
      const gameRect = gameContainer.getBoundingClientRect();
      ghostEl.textContent = correctSymbol ? getCharacterAriaLabel(item.data) : '';

      ghostEl.style.display = 'block';
      const ghostWidth = ghostEl.offsetWidth;
      ghostEl.style.display = '';
      ghostEl.style.left = `${boxRect.left - gameRect.left + boxRect.width / 2 - ghostWidth / 2}px`;
      ghostEl.style.top = `${boxRect.top - gameRect.top}px`;
      ghostEl.classList.add('ghost-rise');
      trackTimeout(() => ghostEl.classList.remove('ghost-rise'), 2000);
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
  const initialLives = 3;
  const learnPhaseDuration = 2500;
  const levelUpThreshold = 50;

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

    updateScore(0, true);
    updateLives();
    updateLevelDisplay();

    startButton.textContent = t('game.controls.start');
    isRestartMode = false;
    setupView.classList.remove('hidden');
    gameOverView.classList.add('hidden');
    accessibilityView.classList.add('hidden');
    modal.classList.remove('hidden');
    refreshDropZones();
  }

  function startGame() {
    score = 0;
    lives = initialLives;
    level = 1;
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

    const selectedModeInput = document.querySelector('input[name="gameMode"]:checked');
    gameMode = selectedModeInput?.value ?? gameMode ?? practiceModes[0]?.id ?? 'letters';
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
    modal.classList.add('hidden');
    learnOverlay.classList.remove('visible');

    activeItems.forEach((item) => item.element.remove());
    activeItems.clear();

    spawnNextRound();
    emit('game:session-start', {
      mode: gameMode,
      settings: {
        mode: gameMode,
        speed: baseSpeedSetting,
        introductions: introductionsEnabled
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
        introductions: introductionsEnabled
      },
      languageId: activeLanguage.id
    });

    displayLearningSummary();
    setupView.classList.add('hidden');
    gameOverView.classList.remove('hidden');
    startButton.textContent = t('game.controls.playAgain');
    isRestartMode = true;
    modal.classList.remove('hidden');
  }

  function displayLearningSummary() {
    gameOverView.innerHTML = `
        <h2 class="text-3xl sm:text-5xl font-bold text-cyan-400 mb-4 ${fontClass}">${t('game.summary.gameOver')}</h2>
        <p id="final-score" class="text-2xl text-white mb-6">${t('game.summary.finalScore', { score })}</p>
        <div class="learning-summary-container my-6"></div>
      `;
    const summaryContainer = gameOverView.querySelector('.learning-summary-container');

    const seenInSession = Object.keys(sessionStats);
    if (seenInSession.length === 0) {
      summaryContainer.innerHTML = `<p class="text-slate-400">${t('game.summary.empty')}</p>`;
      return;
    }

    const encounteredContainer = document.createElement('div');
    encounteredContainer.className = 'flex flex-wrap gap-2 justify-center mb-6';

    seenInSession.forEach((key) => {
      const itemData = resolveItemById(key);
      if (!itemData) return;
      const span = document.createElement('span');
      span.className = `${fontClass} text-3xl p-2 bg-slate-700 rounded-md cursor-pointer`;
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
    encounteredTitle.className = 'text-xl font-bold text-cyan-400 mb-2';
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
            <h3 class="text-xl font-bold text-cyan-400 mb-2">${t('game.summary.weakestLink')}</h3>
            <p class="mb-3 text-sm text-slate-400">${t('game.summary.weakestLinkDescription')}</p>
            <div class="flex items-center justify-center gap-4">
              <span class="${fontClass} text-5xl">${weakestLinkItem.symbol ?? ''}</span>
              <button id="practice-weakest-btn" class="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded-lg">${t('game.summary.practice')}</button>
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

  function spawnNextRound() {
    if (!gameActive) return;
    if (isBonusRound) {
      spawnBonusRound();
      return;
    }

    let roundItems = [];

    const itemPool = getModePool(gameMode);

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

    currentRound = { id: Date.now(), items: roundItems, handledCount: 0, timers: [] };
    generateChoices(roundItems, itemPool);
    processItemsForRound(roundItems, currentRound.id);
  }

  function processItemsForRound(items, roundId) {
    let totalDelay = 0;
    items.forEach((itemData) => {
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
    const reducedMotion = reducedMotionToggle.checked;
    const animationName = reducedMotion ? 'simple-flow' : ['river-flow-1', 'river-flow-2'][Math.floor(Math.random() * 2)];
    itemEl.className = `falling-letter font-bold ${fontClass} text-cyan-300 ${animationName}`;
    itemEl.style.top = `${Math.random() * 70}%`;
    itemEl.style.animationDuration = `${parseInt(gameSpeedSlider.value, 10)}s`;
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
    const missHandler = () => onItemHandled(elementId, roundId, true);
    itemEl.addEventListener('animationend', missHandler);
    activeItems.set(elementId, { data: itemData, element: itemEl, missHandler });
    playArea.appendChild(itemEl);
    startPointerDrag(itemEl, {
      sound: itemData.sound,
      id: elementId,
      roundId,
      itemId: itemData.id,
      symbol: itemData.symbol
    });
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
      box.className = 'catcher-box bg-slate-700 text-white font-bold py-5 sm:py-6 px-2 rounded-lg text-2xl transition-all border-2 border-slate-600';
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

    learnLetterEl.textContent = '💎';
    learnName.textContent = t('game.bonus.title');
    learnSound.textContent = t('game.bonus.instruction');
    learnOverlay.classList.add('visible');
    refreshDropZones();

    const bonusCatcher = document.createElement('div');
    bonusCatcher.textContent = t('game.bonus.catchHere');
    bonusCatcher.dataset.itemId = 'bonus-gem';
    bonusCatcher.className = 'catcher-box bg-yellow-500 text-slate-900 font-bold py-6 px-2 rounded-lg text-lg transition-all border-2 border-yellow-400 col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5';
    bonusCatcher.setAttribute('aria-label', t('game.bonus.catchHere'));
    bonusCatcher.addEventListener('dragover', (e) => {
      e.preventDefault();
      bonusCatcher.classList.add('drag-over');
    });
    bonusCatcher.addEventListener('dragleave', () => bonusCatcher.classList.remove('drag-over'));
    bonusCatcher.addEventListener('drop', handleDrop);
    choicesContainer.appendChild(bonusCatcher);
    activeBucketCount = 1;
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

  accessibilityBtn?.addEventListener('click', () => {
    const btnRect = accessibilityBtn.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    accessibilityView.style.top = `${btnRect.bottom - containerRect.top + 5}px`;
    accessibilityView.style.right = `${containerRect.right - btnRect.right}px`;
    accessibilityView.classList.toggle('hidden');
  });
  closeAccessibilityBtn?.addEventListener('click', () => accessibilityView.classList.add('hidden'));
  highContrastToggle?.addEventListener('change', (e) => document.body.classList.toggle('high-contrast', e.target.checked));

  const speedSlowLabel = t('game.accessibility.speedSlow');
  const speedFastLabel = t('game.accessibility.speedFast');
  const speedNormalLabel = t('game.accessibility.speedNormal');

  gameSpeedSlider?.addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    if (v > 20) speedLabel.textContent = speedSlowLabel;
    else if (v < 14) speedLabel.textContent = speedFastLabel;
    else speedLabel.textContent = speedNormalLabel;
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
      if (!isBonusRound && droppedItemId) sessionStats[droppedItemId].correct++;
    } else {
      lives--;
      updateLives(true);
      targetBox.classList.add('feedback-incorrect');
      if (!isBonusRound && droppedItemId) sessionStats[droppedItemId].incorrect++;

      const correctSymbol = getDisplaySymbol(item.data);
      const characterLabel = getCharacterAriaLabel(item.data);
      const boxRect = targetBox.getBoundingClientRect();
      const gameRect = gameContainer.getBoundingClientRect();
      ghostEl.textContent = characterLabel || correctSymbol;
      ghostEl.style.display = 'block';
      const ghostWidth = ghostEl.offsetWidth;
      ghostEl.style.display = '';
      ghostEl.style.left = `${boxRect.left - gameRect.left + boxRect.width / 2 - ghostWidth / 2}px`;
      ghostEl.style.top = `${boxRect.top - gameRect.top}px`;
      ghostEl.classList.add('ghost-rise');
      trackTimeout(() => {
        ghostEl.classList.remove('ghost-rise');
      }, 2000);
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

  backToMenuButton?.addEventListener('click', () => {
    resetToSetupScreen();
    onReturnToMenu?.();
  });

  function setGameMode(value) {
    const radio = document.querySelector(`input[name="gameMode"][value="${value}"]`);
    if (radio) {
      radio.checked = true;
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
