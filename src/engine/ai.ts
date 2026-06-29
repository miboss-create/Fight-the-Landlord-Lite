import type { Card, Pattern, PlayerId } from './types';
import { countByValue, getPattern } from './patterns';
import { isOpponent } from './rules';

function groupHand(hand: Card[]): { value: number; cards: Card[] }[] {
  const map = countByValue(hand);
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([value, cards]) => ({ value, cards }));
}

function findSingle(hand: Card[], minValue: number): Card[] | null {
  const card = hand.find((c) => c.value > minValue);
  return card ? [card] : null;
}

function findPair(hand: Card[], minValue: number): Card[] | null {
  const groups = groupHand(hand);
  for (const g of groups) {
    if (g.value > minValue && g.cards.length >= 2) {
      return g.cards.slice(0, 2);
    }
  }
  return null;
}

function findTriple(hand: Card[], minValue: number): Card[] | null {
  const groups = groupHand(hand);
  for (const g of groups) {
    if (g.value > minValue && g.cards.length >= 3) {
      return g.cards.slice(0, 3);
    }
  }
  return null;
}

function findKicker(hand: Card[], excludeValues: number[], type: 'single' | 'pair'): Card[] | null {
  const groups = groupHand(hand).filter((g) => !excludeValues.includes(g.value));
  const needed = type === 'single' ? 1 : 2;
  for (const g of groups) {
    if (g.cards.length >= needed) {
      return g.cards.slice(0, needed);
    }
  }
  return null;
}

function findTripleWithKicker(hand: Card[], minValue: number, kickerType: 'single' | 'pair'): Card[] | null {
  const groups = groupHand(hand);
  for (const g of groups) {
    if (g.value > minValue && g.cards.length >= 3) {
      const triple = g.cards.slice(0, 3);
      const remaining = hand.filter((c) => !triple.includes(c));
      const kicker = findKicker(remaining, [g.value], kickerType);
      if (kicker) return [...triple, ...kicker];
    }
  }
  return null;
}

function findStraight(hand: Card[], length: number, minValue: number): Card[] | null {
  const groups = groupHand(hand);
  const maxStart = 14 - length + 1;
  for (let start = minValue + 1; start <= maxStart; start++) {
    const result: Card[] = [];
    let ok = true;
    for (let offset = 0; offset < length; offset++) {
      const target = start + offset;
      const g = groups.find((x) => x.value === target);
      if (!g || g.cards.length === 0) {
        ok = false;
        break;
      }
      result.push(g.cards[0]);
    }
    if (ok) return result;
  }
  return null;
}

function findDoubleStraight(hand: Card[], pairCount: number, minValue: number): Card[] | null {
  const groups = groupHand(hand);
  const maxStart = 14 - pairCount + 1;
  for (let start = minValue + 1; start <= maxStart; start++) {
    const result: Card[] = [];
    let ok = true;
    for (let offset = 0; offset < pairCount; offset++) {
      const target = start + offset;
      const g = groups.find((x) => x.value === target);
      if (!g || g.cards.length < 2) {
        ok = false;
        break;
      }
      result.push(...g.cards.slice(0, 2));
    }
    if (ok) return result;
  }
  return null;
}

function findPlane(
  hand: Card[],
  n: number,
  minValue: number,
  wingType: 'none' | 'single' | 'pair',
): Card[] | null {
  const groups = groupHand(hand);
  const maxStart = 14 - n + 1;
  for (let start = minValue + 1; start <= maxStart; start++) {
    const mainCards: Card[] = [];
    let ok = true;
    for (let offset = 0; offset < n; offset++) {
      const target = start + offset;
      const g = groups.find((x) => x.value === target);
      if (!g || g.cards.length < 3) {
        ok = false;
        break;
      }
      mainCards.push(...g.cards.slice(0, 3));
    }
    if (!ok) continue;

    if (wingType === 'none') return mainCards;

    const remaining = hand.filter((c) => !mainCards.includes(c));
    const exclude = Array.from({ length: n }, (_, i) => start + i);
    const wings: Card[] = [];
    const neededPer = wingType === 'single' ? 1 : 2;
    const wingGroups = groupHand(remaining).filter((g) => !exclude.includes(g.value));
    if (wingGroups.length < n) continue;
    for (let i = 0; i < n; i++) {
      const wg = wingGroups[i];
      if (wg.cards.length < neededPer) {
        ok = false;
        break;
      }
      wings.push(...wg.cards.slice(0, neededPer));
    }
    if (ok) return [...mainCards, ...wings];
  }
  return null;
}

function findBomb(hand: Card[], minValue = 2): Card[] | null {
  const groups = groupHand(hand);
  for (const g of groups) {
    if (g.value > minValue && g.cards.length === 4) {
      return g.cards;
    }
  }
  return null;
}

function findRocket(hand: Card[]): Card[] | null {
  const small = hand.find((c) => c.value === 16);
  const big = hand.find((c) => c.value === 17);
  if (small && big) return [small, big];
  return null;
}

export function chooseBid(hand: Card[], currentBid: number): number {
  const counts = countByValue(hand);
  let power = 0;
  let hasBomb = false;
  for (const [value, group] of counts) {
    if (group.length === 4) hasBomb = true;
    if (value >= 15) power += 2;
    if (value === 14) power += 1;
  }

  let desired = 0;
  if (hasBomb || power >= 5) desired = 3;
  else if (power >= 3) desired = 2;
  else if (power >= 1) desired = 1;

  while (desired > 0 && desired <= currentBid) desired--;
  return desired;
}

export function findBeatingPlay(hand: Card[], last: Pattern): Card[] | null {
  switch (last.type) {
    case 'SINGLE':
      return findSingle(hand, last.mainValue);
    case 'PAIR':
      return findPair(hand, last.mainValue);
    case 'TRIPLE':
      return findTriple(hand, last.mainValue);
    case 'TRIPLE_WITH_SINGLE':
      return findTripleWithKicker(hand, last.mainValue, 'single');
    case 'TRIPLE_WITH_PAIR':
      return findTripleWithKicker(hand, last.mainValue, 'pair');
    case 'STRAIGHT':
      return findStraight(hand, last.length ?? 5, last.mainValue);
    case 'DOUBLE_STRAIGHT':
      return findDoubleStraight(hand, last.length ?? 3, last.mainValue);
    case 'PLANE':
      return findPlane(hand, last.length ?? 2, last.mainValue, 'none');
    case 'PLANE_WITH_SINGLE':
      return findPlane(hand, last.length ?? 2, last.mainValue, 'single');
    case 'PLANE_WITH_PAIR':
      return findPlane(hand, last.length ?? 2, last.mainValue, 'pair');
    case 'BOMB':
      return findBomb(hand, last.mainValue);
    case 'ROCKET':
      return null;
    default:
      return null;
  }
}

function findLowestLead(hand: Card[]): Card[] | null {
  if (hand.length === 0) return null;

  // 尝试较低的多张组合
  for (const wingType of ['single', 'pair'] as const) {
    for (let n = 5; n >= 2; n--) {
      const p = findPlane(hand, n, 2, wingType);
      if (p) return p;
    }
  }

  const doubleStraight = findDoubleStraight(hand, 3, 2);
  if (doubleStraight) return doubleStraight;

  const straight = findStraight(hand, 5, 2);
  if (straight) return straight;

  const tripleSingle = findTripleWithKicker(hand, 2, 'single');
  if (tripleSingle) return tripleSingle;

  const triplePair = findTripleWithKicker(hand, 2, 'pair');
  if (triplePair) return triplePair;

  const pair = findPair(hand, 2);
  if (pair) return pair;

  return [hand[0]];
}

function canFinishInOnePlay(hand: Card[]): boolean {
  const p = getPattern(hand);
  return p !== null;
}

export function choosePlay(
  hand: Card[],
  lastPlay: { pattern: Pattern; playerId: PlayerId } | null,
  landlordId: PlayerId,
  selfId: PlayerId,
  handSizes: Record<PlayerId, number>,
): Card[] | null {
  const opponentPlayed = lastPlay
    ? isOpponent(landlordId, selfId, lastPlay.playerId)
    : false;
  const isNewRound = lastPlay === null;

  if (isNewRound) {
    // 若只剩一手牌，直接出完
    if (canFinishInOnePlay(hand)) return hand;
    return findLowestLead(hand);
  }

  const lastPattern = lastPlay!.pattern;
  const lastPlayerId = lastPlay!.playerId;

  // 队友出牌且不是危急情况，选择 pass
  if (!opponentPlayed) {
    const canWin = handSizes[selfId] <= 2;
    if (!canWin) return null;
  }

  // 尝试用普通牌型接牌
  const normal = findBeatingPlay(hand, lastPattern);
  if (normal) {
    // 若接完后能一次出完，优先出
    const remaining = hand.filter((c) => !normal.includes(c));
    if (remaining.length === 0 || canFinishInOnePlay(remaining)) {
      return normal;
    }
    // 对手手牌很少或自己快出完时，再接
    const urgent = handSizes[lastPlayerId] <= 3 || handSizes[selfId] <= 4;
    if (urgent || opponentPlayed) {
      return normal;
    }
    return null;
  }

  // 普通牌无法接时，考虑炸弹/火箭
  const urgent = handSizes[lastPlayerId] <= 3 || handSizes[selfId] <= 4;
  if (!urgent) return null;

  const rocket = findRocket(hand);
  if (rocket) return rocket;

  const bomb = findBomb(hand);
  if (bomb) return bomb;

  return null;
}
