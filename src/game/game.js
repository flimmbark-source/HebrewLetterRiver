import { emit } from '../lib/eventBus.js';

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

export function setupGame({ onReturnToMenu } = {}) {
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

  if (!scoreEl || !levelEl) {
    throw new Error('Game elements failed to initialize.');
  }

  const hebrewAlphabet = [
    { hebrew: 'א', sound: 'Silent (A)', name: 'Aleph' },
    { hebrew: 'בּ', sound: 'B', name: 'Bet' },
    { hebrew: 'ב', sound: 'V', name: 'Vet' },
    { hebrew: 'ג', sound: 'G', name: 'Gimel' },
    { hebrew: 'ד', sound: 'D', name: 'Dalet' },
    { hebrew: 'ה', sound: 'H', name: 'Heh' },
    { hebrew: 'ו', sound: 'Vav', name: 'Vav' },
    { hebrew: 'ז', sound: 'Z', name: 'Zayin' },
    { hebrew: 'ח', sound: 'Ch', name: 'Chet' },
    { hebrew: 'ט', sound: 'T', name: 'Tet' },
    { hebrew: 'י', sound: 'Y', name: 'Yud' },
    { hebrew: 'כּ', sound: 'K', name: 'Kaf' },
    { hebrew: 'כ', sound: 'Ch (Khaf)', name: 'Chaf' },
    { hebrew: 'ך', sound: 'Ch (Final)', name: 'Final Chaf' },
    { hebrew: 'ל', sound: 'L', name: 'Lamed' },
    { hebrew: 'מ', sound: 'M', name: 'Mem' },
    { hebrew: 'ם', sound: 'M (Final)', name: 'Final Mem' },
    { hebrew: 'נ', sound: 'N', name: 'Nun' },
    { hebrew: 'ן', sound: 'N (Final)', name: 'Final Nun' },
    { hebrew: 'ס', sound: 'S', name: 'Samech' },
    { hebrew: 'ע', sound: 'Silent (Ayin)', name: 'Ayin' },
    { hebrew: 'פּ', sound: 'P', name: 'Pei' },
    { hebrew: 'פ', sound: 'F', name: 'Fei' },
    { hebrew: 'ף', sound: 'F (Final)', name: 'Final Fei' },
    { hebrew: 'צ', sound: 'Tz', name: 'Tzadi' },
    { hebrew: 'ץ', sound: 'Tz (Final)', name: 'Final Tzadi' },
    { hebrew: 'ק', sound: 'K (Qof)', name: 'Kuf' },
    { hebrew: 'ר', sound: 'R', name: 'Resh' },
    { hebrew: 'שׁ', sound: 'Sh', name: 'Shin' },
    { hebrew: 'שׂ', sound: 'S (Sin)', name: 'Sin' },
    { hebrew: 'ת', sound: 'T', name: 'Tav' }
  ];

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
  let activeDrag = null;
  let dragGhost = null;
  let hoverZone = null;

  function ensureDragGhost() {
    if (dragGhost) return dragGhost;
    dragGhost = document.createElement('div');
    dragGhost.id = 'drag-ghost';
    document.body.appendChild(dragGhost);
    return dragGhost;
  }

  function refreshDropZones() {
    dropZones = Array.from(document.querySelectorAll('.catcher-box')).map((el) => ({
      el,
      rect: el.getBoundingClientRect()
    }));
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
      ghost.className = itemEl.classList.contains('falling-gem') ? 'text-5xl' : 'hebrew-font text-6xl';
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

    const { sound: droppedSound, id: droppedId, roundId, hebrew: droppedHebrew } = payload;
    if (!gameActive || !activeItems.has(droppedId)) return;

    const targetSound = targetBox.dataset.sound;
    const item = activeItems.get(droppedId);

    item.element.isDropped = true;
    if (!isBonusRound && !sessionStats[droppedHebrew]) sessionStats[droppedHebrew] = { correct: 0, incorrect: 0 };

    const isCorrect = isBonusRound || droppedSound === targetSound;
    if (isBonusRound) {
      bonusCaughtInSession += 1;
      emit('game:bonus-catch', { count: bonusCaughtInSession, score });
    }

    if (isCorrect) {
      updateScore(isBonusRound ? 25 : 10);
      targetBox.classList.add('feedback-correct');
      if (!isBonusRound) sessionStats[droppedHebrew].correct++;
    } else {
      lives--;
      updateLives(true);
      targetBox.classList.add('feedback-incorrect');
      if (!isBonusRound) sessionStats[droppedHebrew].incorrect++;

      const correctSound = item.data.sound;
      const boxRect = targetBox.getBoundingClientRect();
      const gameRect = gameContainer.getBoundingClientRect();
      ghostEl.textContent = correctSound;

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
        hebrew: droppedHebrew,
        correct: isCorrect,
        mode: gameMode,
        roundId
      });
    }

    item.element.removeEventListener('animationend', item.missHandler);
    trackTimeout(() => {
      targetBox.classList.remove('feedback-correct', 'feedback-incorrect');
      onItemHandled(droppedId, roundId, false);
    }, 400);
  }

  const consonants = {
    א: { name: 'Aleph', sound: '' },
    ב: { name: 'Bet/Vet', sound: 'B/V' },
    ג: { name: 'Gimel', sound: 'G' },
    ד: { name: 'Dalet', sound: 'D' },
    ה: { name: 'Heh', sound: 'H' },
    ו: { name: 'Vav', sound: 'V' },
    ז: { name: 'Zayin', sound: 'Z' },
    ח: { name: 'Chet', sound: 'Ch' },
    ט: { name: 'Tet', sound: 'T' },
    י: { name: 'Yud', sound: 'Y' },
    כ: { name: 'Kaf/Chaf', sound: 'K/Ch' },
    ך: { name: 'Final Chaf', sound: 'Ch' },
    ל: { name: 'Lamed', sound: 'L' },
    מ: { name: 'Mem', sound: 'M' },
    ם: { name: 'Final Mem', sound: 'M' },
    נ: { name: 'Nun', sound: 'N' },
    ן: { name: 'Final Nun', sound: 'N' },
    ס: { name: 'Samech', sound: 'S' },
    ע: { name: 'Ayin', sound: '' },
    פ: { name: 'Pei/Fei', sound: 'P/F' },
    ף: { name: 'Final Fei', sound: 'F' },
    צ: { name: 'Tzadi', sound: 'Tz' },
    ץ: { name: 'Final Tzadi', sound: 'Tz' },
    ק: { name: 'Kuf', sound: 'K' },
    ר: { name: 'Resh', sound: 'R' },
    ש: { name: 'Shin/Sin', sound: 'Sh/S' },
    ת: { name: 'Tav', sound: 'T' }
  };

  const vowels = {
    a: { name: 'Patach', mark: '\u05B7' },
    o: { name: 'Holam', mark: '\u05B9' },
    e: { name: 'Segol', mark: '\u05B6' },
    i: { name: 'Hirik', mark: '\u05B4' }
  };

  const vowelSyllables = { vowels1: [], vowels2: [] };
  function generateSyllables() {
    const letterPool = ['ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
    letterPool.forEach((c) => {
      const baseSound = consonants[c].sound.split('/')[0];
      if (!baseSound) return;
      vowelSyllables.vowels1.push({ hebrew: c + vowels.a.mark, sound: baseSound + 'a', name: `${consonants[c].name} + ${vowels.a.name}` });
      vowelSyllables.vowels1.push({ hebrew: c + vowels.o.mark, sound: baseSound + 'o', name: `${consonants[c].name} + ${vowels.o.name}` });
      vowelSyllables.vowels2.push({ hebrew: c + vowels.e.mark, sound: baseSound + 'e', name: `${consonants[c].name} + ${vowels.e.name}` });
      vowelSyllables.vowels2.push({ hebrew: c + vowels.i.mark, sound: baseSound + 'i', name: `${consonants[c].name} + ${vowels.i.name}` });
    });
  }
  generateSyllables();

  let score;
  let lives;
  let level;
  let scoreForNextLevel;
  let gameActive;
  let fallDuration;
  let baseSpeedSetting;
  let isBonusRound;
  let gameMode;
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
    seenItems = new Set(['א', 'בּ', 'ל']);
    learningOrder = [];
    lastItemSound = null;
    sessionStats = {};
    hasIntroducedForItemInLevel = false;
    bonusCaughtInSession = 0;

    updateScore(0, true);
    updateLives();
    updateLevelDisplay();

    startButton.textContent = 'Start Game';
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
    seenItems = new Set(['א', 'בּ', 'ל']);
    lastItemSound = null;
    currentRound = null;
    sessionStats = {};
    hasIntroducedForItemInLevel = false;
    bonusCaughtInSession = 0;

    gameMode = document.querySelector('input[name="gameMode"]:checked').value;
    introductionsEnabled = document.getElementById('toggle-introductions').checked;

    let gameItemPool;
    if (gameMode === 'letters') gameItemPool = hebrewAlphabet;
    else if (gameMode === 'expert') gameItemPool = [...hebrewAlphabet, ...Object.values(vowelSyllables).flat()];
    else gameItemPool = vowelSyllables[gameMode];

    learningOrder = gameItemPool.filter((item) => !seenItems.has(item.hebrew));
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
      }
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
      }
    });

    displayLearningSummary();
    setupView.classList.add('hidden');
    gameOverView.classList.remove('hidden');
    startButton.textContent = 'Play Again';
    modal.classList.remove('hidden');
  }

  function displayLearningSummary() {
    gameOverView.innerHTML = `
        <h2 class="text-3xl sm:text-5xl font-bold text-cyan-400 mb-4 hebrew-font">Game Over</h2>
        <p id="final-score" class="text-2xl text-white mb-6">Final Score: ${score}</p>
        <div class="learning-summary-container my-6"></div>
      `;
    const summaryContainer = gameOverView.querySelector('.learning-summary-container');

    const seenInSession = Object.keys(sessionStats);
    if (seenInSession.length === 0) {
      summaryContainer.innerHTML = '<p class="text-slate-400">No stats to show for this round.</p>';
      return;
    }

    const encounteredContainer = document.createElement('div');
    encounteredContainer.className = 'flex flex-wrap gap-2 justify-center mb-6';
    const allItems = [...hebrewAlphabet, ...Object.values(vowelSyllables).flat()];

    seenInSession.forEach((key) => {
      const span = document.createElement('span');
      span.className = 'hebrew-font text-3xl p-2 bg-slate-700 rounded-md cursor-pointer';
      span.textContent = key;

      span.addEventListener('mouseenter', (event) => {
        const itemData = allItems.find((i) => i.hebrew === event.target.textContent);
        if (!itemData) return;
        summaryTooltip.innerHTML = `<div class="font-bold">${itemData.name}</div><div>"${itemData.sound}"</div>`;
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
    encounteredTitle.textContent = 'Items Encountered';
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
      const weakestLinkItem = allItems.find((l) => l.hebrew === weakestLink);
      if (weakestLinkItem) {
        const weakestLinkContainer = document.createElement('div');
        weakestLinkContainer.innerHTML = `
            <h3 class="text-xl font-bold text-cyan-400 mb-2">Weakest Link</h3>
            <div class="flex items-center justify-center gap-4">
              <span class="hebrew-font text-5xl">${weakestLink}</span>
              <button id="practice-weakest-btn" class="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded-lg">Practice This</button>
            </div>`;
        summaryContainer.appendChild(weakestLinkContainer);
        document.getElementById('practice-weakest-btn').addEventListener('click', () => {
          forcedStartItem = weakestLinkItem;
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
    const levelUpText = isBonusRound ? 'Bonus Round!' : 'Level Up!';

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
    const key = 'hebrew';

    let itemPool;
    if (gameMode === 'letters') itemPool = hebrewAlphabet;
    else if (gameMode === 'expert') itemPool = [...hebrewAlphabet, ...Object.values(vowelSyllables).flat()];
    else itemPool = vowelSyllables[gameMode];

    let seenSoFar = [...itemPool.filter((l) => seenItems.has(l[key]))];
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
      if (!roundItems.some((item) => item[key] === reviewItem[key])) roundItems.push(reviewItem);
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
    const key = 'hebrew';
    items.forEach((itemData) => {
      if (currentRound.id !== roundId) return;
      const isNewItem = !seenItems.has(itemData[key]);
      let delayForNext = 500;

      if (isNewItem && introductionsEnabled) {
        const showTime = totalDelay;
        const t1 = trackTimeout(() => {
          if (!gameActive || currentRound.id !== roundId) return;
          learnLetterEl.textContent = itemData.hebrew;
          learnName.textContent = itemData.name;
          learnSound.textContent = `Sound: "${itemData.sound}"`;
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
    const itemId = `item-${Date.now()}-${Math.random()}`;
    const itemEl = document.createElement('div');
    itemEl.id = itemId;
    itemEl.isDropped = false;
    itemEl.textContent = itemData.hebrew;
    const reducedMotion = reducedMotionToggle.checked;
    const animationName = reducedMotion ? 'simple-flow' : ['river-flow-1', 'river-flow-2'][Math.floor(Math.random() * 2)];
    itemEl.className = `falling-letter font-bold hebrew-font text-cyan-300 ${animationName}`;
    itemEl.style.top = `${Math.random() * 70}%`;
    itemEl.style.animationDuration = `${parseInt(gameSpeedSlider.value, 10)}s`;
    itemEl.draggable = true;
    itemEl.addEventListener('dragstart', (e) => {
      const dragData = JSON.stringify({ sound: itemData.sound, id: itemId, roundId, hebrew: itemData.hebrew });
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
    const missHandler = () => onItemHandled(itemId, roundId, true);
    itemEl.addEventListener('animationend', missHandler);
    activeItems.set(itemId, { data: itemData, element: itemEl, missHandler });
    playArea.appendChild(itemEl);
    startPointerDrag(itemEl, { sound: itemData.sound, id: itemId, roundId, hebrew: itemData.hebrew });
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
    const key = item.data.hebrew;
    if (!sessionStats[key]) sessionStats[key] = { correct: 0, incorrect: 0 };
    if (isMiss) sessionStats[key].incorrect++;
    seenItems.add(key);

    item.element.remove();
    activeItems.delete(itemId);
    currentRound.handledCount++;

    if (isMiss && !isBonusRound) {
      lives--;
      updateLives(true);
      emit('game:letter-result', {
        hebrew: key,
        correct: false,
        mode: gameMode,
        roundId,
        reason: 'timeout'
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
    if (correctItems.length === 0) return;

    const correctChoices = correctItems.filter((item, idx, self) => idx === self.findIndex((i) => i.sound === item.sound));
    const correctSounds = new Set(correctChoices.map((i) => i.sound));
    let finalChoices = [...correctChoices];

    let distractorPool = itemPool.filter((i) => !correctSounds.has(i.sound));
    distractorPool.sort(() => 0.5 - Math.random());

    let i = 0;
    while (finalChoices.length < 4 && i < distractorPool.length) {
      finalChoices.push(distractorPool[i]);
      i++;
    }

    finalChoices.sort(() => 0.5 - Math.random());

    finalChoices.forEach((choice) => {
      const box = document.createElement('div');
      box.textContent = choice.sound;
      box.dataset.sound = choice.sound;
      box.className = 'catcher-box bg-slate-700 text-white font-bold py-5 sm:py-6 px-2 rounded-lg text-2xl transition-all border-2 border-slate-600';
      box.addEventListener('dragover', (e) => {
        e.preventDefault();
        box.classList.add('drag-over');
      });
      box.addEventListener('dragleave', () => box.classList.remove('drag-over'));
      box.addEventListener('drop', handleDrop);
      choicesContainer.appendChild(box);
    });
    refreshDropZones();
  }

  function spawnBonusRound() {
    if (!gameActive) return;
    activeItems.forEach((item) => item.element.remove());
    activeItems.clear();
    choicesContainer.innerHTML = '';

    learnLetterEl.textContent = '💎';
    learnName.textContent = 'Bonus Round!';
    learnSound.textContent = 'Catch the gems!';
    learnOverlay.classList.add('visible');
    refreshDropZones();

    const bonusCatcher = document.createElement('div');
    bonusCatcher.textContent = 'Catch Here!';
    bonusCatcher.dataset.sound = 'bonus-gem';
    bonusCatcher.className = 'catcher-box bg-yellow-500 text-slate-900 font-bold py-6 px-2 rounded-lg text-lg transition-all border-2 border-yellow-400 col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5';
    bonusCatcher.addEventListener('dragover', (e) => {
      e.preventDefault();
      bonusCatcher.classList.add('drag-over');
    });
    bonusCatcher.addEventListener('dragleave', () => bonusCatcher.classList.remove('drag-over'));
    bonusCatcher.addEventListener('drop', handleDrop);
    choicesContainer.appendChild(bonusCatcher);
    refreshDropZones();

    let timeLeft = 10;
    const bonusDuration = 10000;
    const bonusTimerInterval = trackInterval(() => {
      timeLeft--;
      learnSound.textContent = `Time left: ${timeLeft}`;
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
    const itemId = `gem-${Date.now()}-${Math.random()}`;
    const itemEl = document.createElement('div');
    itemEl.id = itemId;
    itemEl.isDropped = false;
    itemEl.textContent = '💎';
    const reducedMotion = reducedMotionToggle.checked;
    const animationName = reducedMotion ? 'simple-flow' : ['river-flow-1', 'river-flow-2'][Math.floor(Math.random() * 2)];
    itemEl.className = `falling-gem text-4xl sm:text-5xl ${animationName}`;
    itemEl.style.top = `${Math.random() * 70}%`;
    const bonusSpeed = Math.max(5, parseInt(gameSpeedSlider.value, 10) - 5);
    itemEl.style.animationDuration = `${bonusSpeed}s`;
    itemEl.draggable = true;
    itemEl.addEventListener('dragstart', (e) => {
      const dragData = JSON.stringify({ sound: 'bonus-gem', id: itemId, roundId: 'bonus', hebrew: 'gem' });
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
    const missHandler = () => onItemHandled(itemId, 'bonus', true);
    itemEl.addEventListener('animationend', missHandler);
    activeItems.set(itemId, { data: { sound: 'bonus-gem' }, element: itemEl, missHandler });
    playArea.appendChild(itemEl);
    startPointerDrag(itemEl, { sound: 'bonus-gem', id: itemId, roundId: 'bonus', hebrew: 'gem' });
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

  gameSpeedSlider?.addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    if (v > 20) speedLabel.textContent = 'Slow';
    else if (v < 14) speedLabel.textContent = 'Fast';
    else speedLabel.textContent = 'Normal';
  });

  function updateModalSubtitle() {
    const selectedMode = document.querySelector('input[name="gameMode"]:checked').value;
    let text = 'Drag the moving ';
    text += selectedMode.startsWith('vowel') || selectedMode === 'expert' ? 'item to the correct box!' : 'letter to the correct box!';
    modalSubtitle.textContent = text;
  }
  document.querySelectorAll('input[name="gameMode"]').forEach((r) => r.addEventListener('change', updateModalSubtitle));

  startButton?.addEventListener('click', () => {
    if (startButton.textContent === 'Play Again') {
      gameOverView.classList.add('hidden');
      setupView.classList.remove('hidden');
      accessibilityView.classList.add('hidden');
      startButton.textContent = 'Start Game';
      updateModalSubtitle();
    } else {
      startGame();
    }
  });

  function handleDrop(e) {
    e.preventDefault();
    const targetBox = e.currentTarget;
    targetBox.classList.remove('drag-over');
    const { sound: droppedSound, id: droppedId, roundId, hebrew: droppedHebrew } = JSON.parse(e.dataTransfer.getData('application/json'));
    if (!gameActive || !activeItems.has(droppedId)) return;

    const targetSound = targetBox.dataset.sound;
    const item = activeItems.get(droppedId);

    item.element.isDropped = true;
    if (!isBonusRound && !sessionStats[droppedHebrew]) sessionStats[droppedHebrew] = { correct: 0, incorrect: 0 };

    const isCorrect = isBonusRound || droppedSound === targetSound;
    if (isBonusRound) {
      bonusCaughtInSession += 1;
      emit('game:bonus-catch', { count: bonusCaughtInSession, score });
    }

    if (isCorrect) {
      updateScore(isBonusRound ? 25 : 10);
      targetBox.classList.add('feedback-correct');
      if (!isBonusRound) sessionStats[droppedHebrew].correct++;
    } else {
      lives--;
      updateLives(true);
      targetBox.classList.add('feedback-incorrect');
      if (!isBonusRound) sessionStats[droppedHebrew].incorrect++;

      const correctSound = item.data.sound;
      const boxRect = targetBox.getBoundingClientRect();
      const gameRect = gameContainer.getBoundingClientRect();
      ghostEl.textContent = correctSound;
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
        hebrew: droppedHebrew,
        correct: isCorrect,
        mode: gameMode,
        roundId
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
    const allItems = [...hebrewAlphabet, ...Object.values(vowelSyllables).flat()];
    const match = allItems.find((entry) => entry.hebrew === symbol);
    if (match) forcedStartItem = match;
  }

  return { resetToSetupScreen, startGame, setGameMode, forceStartByHebrew };
}
