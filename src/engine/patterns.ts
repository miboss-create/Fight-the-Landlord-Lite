import type { Card, Pattern, PatternType } from './types';

export function countByValue(cards: Card[]): Map<number, Card[]> {
  const map = new Map<number, Card[]>();
  for (const card of cards) {
    const group = map.get(card.value) ?? [];
    group.push(card);
    map.set(card.value, group);
  }
  return map;
}

function isConsecutive(values: number[]): boolean {
  if (values.length === 0) return false;
  for (let i = 1; i < values.length; i++) {
    if (values[i] - values[i - 1] !== 1) return false;
  }
  return true;
}

function straightMaxValue(): number {
  return 14; // A
}

export function getPattern(cards: Card[]): Pattern | null {
  if (cards.length === 0) return null;

  const counts = countByValue(cards);
  const values = Array.from(counts.keys()).sort((a, b) => a - b);

  // 火箭
  if (counts.has(16) && counts.has(17) && cards.length === 2) {
    return { type: 'ROCKET', mainValue: 17 };
  }

  // 炸弹
  for (const [value, group] of counts) {
    if (group.length === 4) {
      return { type: 'BOMB', mainValue: value };
    }
  }

  // 单张
  if (cards.length === 1) {
    return { type: 'SINGLE', mainValue: values[0] };
  }

  // 对子
  if (cards.length === 2 && values.length === 1) {
    return { type: 'PAIR', mainValue: values[0] };
  }

  // 三张
  if (cards.length === 3 && values.length === 1) {
    return { type: 'TRIPLE', mainValue: values[0] };
  }

  // 三带一 / 三带二
  if (cards.length === 4 && values.length === 2) {
    for (const [value, group] of counts) {
      if (group.length === 3) {
        return { type: 'TRIPLE_WITH_SINGLE', mainValue: value };
      }
    }
  }
  if (cards.length === 5 && values.length === 2) {
    let tripleValue = -1;
    let pairValue = -1;
    for (const [value, group] of counts) {
      if (group.length === 3) tripleValue = value;
      if (group.length === 2) pairValue = value;
    }
    if (tripleValue !== -1 && pairValue !== -1) {
      return { type: 'TRIPLE_WITH_PAIR', mainValue: tripleValue };
    }
  }

  // 顺子
  if (cards.length >= 5 && values.length === cards.length) {
    if (Math.max(...values) <= straightMaxValue() && isConsecutive(values)) {
      return { type: 'STRAIGHT', mainValue: values[0], length: cards.length };
    }
  }

  // 连对
  if (cards.length >= 6 && cards.length % 2 === 0) {
    const distinct = values;
    const pairCount = cards.length / 2;
    if (
      distinct.length === pairCount &&
      Math.max(...distinct) <= straightMaxValue() &&
      isConsecutive(distinct) &&
      distinct.every((v) => counts.get(v)!.length === 2)
    ) {
      return { type: 'DOUBLE_STRAIGHT', mainValue: distinct[0], length: pairCount };
    }
  }

  // 飞机（纯）
  if (cards.length >= 6 && cards.length % 3 === 0) {
    const distinct = values;
    const tripleCount = cards.length / 3;
    if (
      distinct.length === tripleCount &&
      Math.max(...distinct) <= straightMaxValue() &&
      isConsecutive(distinct) &&
      distinct.every((v) => counts.get(v)!.length === 3)
    ) {
      return { type: 'PLANE', mainValue: distinct[0], length: tripleCount };
    }
  }

  // 飞机带翅膀
  const tripleValues: number[] = [];
  for (const [value, group] of counts) {
    if (group.length >= 3 && value <= straightMaxValue()) {
      tripleValues.push(value);
    }
  }
  tripleValues.sort((a, b) => a - b);

  if (tripleValues.length >= 2 && isConsecutive(tripleValues)) {
    const n = tripleValues.length;
    const mainCards = tripleValues.flatMap((v) => counts.get(v)!.slice(0, 3));
    const remaining = cards.filter((c) => !mainCards.includes(c));

    if (remaining.length === n) {
      const allSingles = remaining.every((c) => counts.get(c.value)!.length === 1);
      if (allSingles) {
        return { type: 'PLANE_WITH_SINGLE', mainValue: tripleValues[0], length: n, kickerCount: n };
      }
    }
    if (remaining.length === n * 2) {
      const allPairs = remaining.every((c) => counts.get(c.value)!.length === 2);
      if (allPairs) {
        return { type: 'PLANE_WITH_PAIR', mainValue: tripleValues[0], length: n, kickerCount: n };
      }
    }
  }

  return null;
}

export function patternBeats(play: Pattern, last: Pattern): boolean {
  if (play.type === 'ROCKET') return true;
  if (last.type === 'ROCKET') return false;

  if (play.type === 'BOMB') {
    if (last.type !== 'BOMB') return true;
    return play.mainValue > last.mainValue;
  }
  if (last.type === 'BOMB') return false;

  if (play.type !== last.type) return false;

  if (
    play.type === 'STRAIGHT' ||
    play.type === 'DOUBLE_STRAIGHT' ||
    play.type === 'PLANE' ||
    play.type === 'PLANE_WITH_SINGLE' ||
    play.type === 'PLANE_WITH_PAIR'
  ) {
    if (play.length !== last.length) return false;
  }

  return play.mainValue > last.mainValue;
}

export function patternDisplay(pattern: Pattern): string {
  const map: Record<PatternType, string> = {
    SINGLE: '单张',
    PAIR: '对子',
    TRIPLE: '三张',
    TRIPLE_WITH_SINGLE: '三带一',
    TRIPLE_WITH_PAIR: '三带二',
    STRAIGHT: '顺子',
    DOUBLE_STRAIGHT: '连对',
    PLANE: '飞机',
    PLANE_WITH_SINGLE: '飞机带单',
    PLANE_WITH_PAIR: '飞机带对',
    BOMB: '炸弹',
    ROCKET: '火箭',
  };
  return map[pattern.type];
}
