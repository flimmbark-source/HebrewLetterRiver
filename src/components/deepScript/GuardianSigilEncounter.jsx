import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';

const ACTIVE_COUNT = 3;
const BELT_SIZE = 4;
const START_TIME = 5;
const TIMER_STEP = 0.1;
const TIMER_INTERVAL_MS = 100;

const ATTACK_PROFILES = [
  { y: '58vh', durationMs: 1500, impactMs: 820 },
  { y: '62vh', durationMs: 1650, impactMs: 900 },
  { y: '56vh', durationMs: 1450, impactMs: 780 },
  { y: '66vh', durationMs: 1740, impactMs: 940 },
];

function tokenId(token) {
  return `${token.wordId}:${token.kind}`;
}

function buildWordById(words) {
  return Object.fromEntries(words.map((word) => [word.id, word]));
}

function makeAttacker(word, timer = START_TIME) {
  return {
    ...word,
    solved: { meaning: false, transliteration: false },
    timer,
    timerMax: timer,
    isAttacking: false,
    attackTick: 0,
  };
}

function unsolvedKinds(attacker) {
  return ['meaning', 'transliteration'].filter((kind) => !attacker.solved[kind]);
}

function chooseKind(attacker, cooldowns, allowBlockedFallback = false) {
  const available = unsolvedKinds(attacker);
  if (!available.length) return null;
  const notBlocked = available.filter(
    (kind) => !cooldowns.some((item) => item.wordId === attacker.id && item.kind === kind)
  );
  return notBlocked[0] || (allowBlockedFallback ? available[0] : null);
}

function canShowToken(token, attackers, cooldowns) {
  const attacker = attackers.find((item) => item.id === token.wordId);
  if (attacker && attacker.solved[token.kind]) return false;
  return !cooldowns.some((item) => item.wordId === token.wordId && item.kind === token.kind);
}

function buildBelt(attackers, reserve, cooldowns, currentBelt = []) {
  const next = [];
  const visibleWords = new Set();

  for (const token of currentBelt) {
    if (next.length >= BELT_SIZE) break;
    if (visibleWords.has(token.wordId)) continue;
    if (!canShowToken(token, attackers, cooldowns)) continue;
    next.push(token);
    visibleWords.add(token.wordId);
  }

  const pool = [...attackers, ...reserve];
  for (const word of pool) {
    if (next.length >= BELT_SIZE) break;
    if (visibleWords.has(word.id)) continue;

    const attacker = attackers.find((item) => item.id === word.id) || {
      ...word,
      solved: { meaning: false, transliteration: false },
    };

    const kind = chooseKind(attacker, cooldowns, false);
    if (!kind) continue;
    next.push({ wordId: word.id, kind });
    visibleWords.add(word.id);
  }

  if (next.length < BELT_SIZE) {
    for (const word of pool) {
      if (next.length >= BELT_SIZE) break;
      if (visibleWords.has(word.id)) continue;

      const attacker = attackers.find((item) => item.id === word.id) || {
        ...word,
        solved: { meaning: false, transliteration: false },
      };

      const kind = chooseKind(attacker, cooldowns, true);
      if (!kind) continue;
      next.push({ wordId: word.id, kind });
      visibleWords.add(word.id);
    }
  }

  return next.slice(0, BELT_SIZE);
}

function decayCooldowns(cooldowns) {
  return cooldowns.map((item) => ({ ...item, steps: item.steps - 1 })).filter((item) => item.steps > 0);
}

function getAttackProfile(value, tick = 0) {
  let sum = 0;
  for (const ch of value) sum += ch.charCodeAt(0);
  return ATTACK_PROFILES[(sum + tick) % ATTACK_PROFILES.length];
}

function tokenLabel(token, wordById) {
  const word = wordById[token.wordId];
  return token.kind === 'meaning' ? word.meaning : word.transliteration;
}

export default function GuardianSigilEncounter({ words, onDamage, onVictory, getGameFontClass, paused = false }) {
  const initial = useMemo(() => {
    const seed = words.slice(0, ACTIVE_COUNT).map((word, idx) => makeAttacker(word, START_TIME + (idx * 1.2)));
    const reserve = words.slice(ACTIVE_COUNT);
    const cooldowns = [];
    return {
      attackers: seed,
      reserve,
      cooldowns,
      belt: buildBelt(seed, reserve, cooldowns, []),
    };
  }, [words]);

  const [attackers, setAttackers] = useState(initial.attackers);
  const [reserve, setReserve] = useState(initial.reserve);
  const [cooldowns, setCooldowns] = useState(initial.cooldowns);
  const [belt, setBelt] = useState(initial.belt);
  const [selected, setSelected] = useState(null);
  const [wrongPulseId, setWrongPulseId] = useState(null);
  const [impacts, setImpacts] = useState([]);

  const wordById = useMemo(() => buildWordById(words), [words]);
  const attackTimersRef = useRef(new Map());
  const impactIdRef = useRef(0);

  const isWon = attackers.length === 0 && reserve.length === 0;

  const refill = useCallback((nextAttackers, nextReserve, nextCooldowns, seedBelt = belt) => {
    const cooled = decayCooldowns(nextCooldowns);
    setCooldowns(cooled);
    setBelt(buildBelt(nextAttackers, nextReserve, cooled, seedBelt));
  }, [belt]);

  useEffect(() => {
    return () => {
      attackTimersRef.current.forEach(({ impactTimeout, recoverTimeout }) => {
        window.clearTimeout(impactTimeout);
        window.clearTimeout(recoverTimeout);
      });
      attackTimersRef.current.clear();
    };
  }, []);

  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      setAttackers((prev) => prev.map((attacker) => {
        if (attacker.isAttacking) return attacker;
        const nextTimer = +(attacker.timer - TIMER_STEP).toFixed(1);
        if (nextTimer > 0) return { ...attacker, timer: nextTimer };
        return { ...attacker, timer: 0, isAttacking: true, attackTick: attacker.attackTick + 1 };
      }));
    }, TIMER_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (paused) return;
    attackers.forEach((attacker) => {
      if (!attacker.isAttacking) return;
      const key = `${attacker.id}:${attacker.attackTick}`;
      if (attackTimersRef.current.has(key)) return;

      const profile = getAttackProfile(attacker.id, attacker.attackTick);

      const impactTimeout = window.setTimeout(() => {
        onDamage(1);
        const impactId = impactIdRef.current++;
        setImpacts((prev) => [...prev, { id: impactId, wordId: attacker.id }]);
        window.setTimeout(() => {
          setImpacts((prev) => prev.filter((item) => item.id !== impactId));
        }, 500);
      }, profile.impactMs);

      const recoverTimeout = window.setTimeout(() => {
        setAttackers((prev) => prev.map((item) => (
          item.id === attacker.id && item.attackTick === attacker.attackTick
            ? { ...item, isAttacking: false, timer: item.timerMax }
            : item
        )));
        attackTimersRef.current.delete(key);
      }, profile.durationMs);

      attackTimersRef.current.set(key, { impactTimeout, recoverTimeout });
    });
  }, [attackers, onDamage, paused]);

  const applyToken = useCallback((token, attackerId) => {
    const attacker = attackers.find((item) => item.id === attackerId);
    if (!attacker || attacker.isAttacking) return;

    if (token.wordId !== attackerId || attacker.solved[token.kind]) {
      setSelected(null);
      setWrongPulseId(attackerId);
      window.setTimeout(() => setWrongPulseId(null), 220);
      return;
    }

    const counterpart = token.kind === 'meaning' ? 'transliteration' : 'meaning';
    const nextCooldowns = [...cooldowns, { wordId: attacker.id, kind: counterpart, steps: 2 }];

    let nextAttackers = attackers.map((item) => (
      item.id === attacker.id
        ? { ...item, solved: { ...item.solved, [token.kind]: true }, timer: item.timerMax }
        : item
    ));

    const solvedAttacker = nextAttackers.find((item) => item.id === attacker.id);
    const fullySolved = Boolean(solvedAttacker?.solved.meaning && solvedAttacker?.solved.transliteration);

    let nextReserve = reserve;
    if (fullySolved) {
      nextAttackers = nextAttackers.filter((item) => item.id !== attacker.id);
      if (nextAttackers.length < ACTIVE_COUNT && reserve.length) {
        nextAttackers = [...nextAttackers, makeAttacker(reserve[0], START_TIME + 1.2)];
        nextReserve = reserve.slice(1);
      }
    }

    const remainingBelt = belt.filter((item) => tokenId(item) !== tokenId(token));

    setAttackers(nextAttackers);
    setReserve(nextReserve);
    setSelected(null);
    refill(nextAttackers, nextReserve, nextCooldowns, remainingBelt);
  }, [attackers, belt, cooldowns, reserve, refill]);

  useEffect(() => {
    if (!isWon) return;
    onVictory();
  }, [isWon, onVictory]);

  const totalEnemies = words.length;
  const defeated = totalEnemies - attackers.length - reserve.length;

  return (
    <>
      {/* ═══ BATTLE ARENA — enemy formation ═══ */}
      <div className="ds-battle-arena">
        <div className="ds-battle-status">
          <span className="ds-battle-label">Guardian Sigil</span>
          <span className="ds-battle-count">{defeated}/{totalEnemies}</span>
        </div>

        <div className="ds-battle-formation">
          {attackers.map((attacker, idx) => {
            const progress = attacker.timer / attacker.timerMax;
            const impactActive = impacts.some((impact) => impact.wordId === attacker.id);
            const isUrgent = progress < 0.3 && !attacker.isAttacking;

            return (
              <button
                type="button"
                key={attacker.id}
                className={[
                  'ds-battle-enemy',
                  selected ? 'ds-battle-enemy--targetable' : '',
                  wrongPulseId === attacker.id ? 'ds-battle-enemy--wrong' : '',
                  isUrgent ? 'ds-battle-enemy--urgent' : '',
                  attacker.isAttacking ? 'ds-battle-enemy--striking' : '',
                ].filter(Boolean).join(' ')}
                style={{ '--enemy-index': idx }}
                onClick={() => {
                  if (selected) applyToken(selected, attacker.id);
                }}
              >
                <div className="ds-battle-enemy-frame">
                  <div className="ds-battle-timer-track">
                    <div
                      className={`ds-battle-timer-fill ${isUrgent ? 'ds-battle-timer-fill--urgent' : ''}`}
                      style={{ width: `${Math.max(0, progress * 100)}%` }}
                    />
                  </div>

                  <div className={`ds-battle-hebrew ${attacker.isAttacking ? 'is-attacking' : ''}`}>
                    <span className={getGameFontClass(`guardian-${attacker.id}`)}>{attacker.hebrew}</span>
                  </div>

                  <div className="ds-battle-seals">
                    <span className={`ds-battle-seal ${attacker.solved.meaning ? 'is-done' : ''}`} title="Meaning" />
                    <span className={`ds-battle-seal ${attacker.solved.transliteration ? 'is-done' : ''}`} title="Transliteration" />
                  </div>

                  {impactActive && <span className="ds-battle-impact" />}
                </div>
              </button>
            );
          })}
        </div>

        {reserve.length > 0 && (
          <div className="ds-battle-reserve">
            {reserve.map((_, i) => (
              <span key={i} className="ds-battle-reserve-pip" />
            ))}
          </div>
        )}
      </div>

      {/* ═══ DIVIDER — battle line ═══ */}
      <div className="ds-battle-divider">
        <div className="ds-battle-divider-line" />
        <span className="ds-battle-divider-rune">⟡</span>
        <div className="ds-battle-divider-line" />
      </div>

      {/* ═══ ACTION BAR — token selection ═══ */}
      <div className="ds-battle-actionbar" role="group" aria-label="Guardian answer pool">
        {belt.map((token) => {
          const active = selected && tokenId(selected) === tokenId(token);
          return (
            <button
              type="button"
              key={tokenId(token)}
              className={`ds-battle-token ds-battle-token--${token.kind} ${active ? 'is-active' : ''}`}
              onClick={() => setSelected(active ? null : token)}
            >
              {tokenLabel(token, wordById)}
            </button>
          );
        })}
      </div>
    </>
  );
}
