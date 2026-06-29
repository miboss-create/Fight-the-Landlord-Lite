import type { Card, PlayerId, Rank, Suit } from './types';

const RANKS: Rank[] = [
  '3', '4', '5', '6', '7', '8', '9', '10',
  'J', 'Q', 'K', 'A', '2',
];

const SUITS: Suit[] = ['SPADE', 'HEART', 'CLUB', 'DIAMOND'];

export function rankToValue(rank: Rank): number {
  switch (rank) {
    case '3': return 3;
    case '4': return 4;
    case '5': return 5;
    case '6': return 6;
    case '7': return 7;
    case '8': return 8;
    case '9': return 9;
    case '10': return 10;
    case 'J': return 11;
    case 'Q': return 12;
    case 'K': return 13;
    case 'A': return 14;
    case '2': return 15;
    case 'JOKER_SMALL': return 16;
    case 'JOKER_BIG': return 17;
    default:
      throw new Error(`Unknown rank: ${rank}`);
  }
}

export function suitSymbol(suit: Suit): string {
  switch (suit) {
    case 'SPADE': return '♠';
    case 'HEART': return '♥';
    case 'CLUB': return '♣';
    case 'DIAMOND': return '♦';
    case 'NONE': return '';
  }
}

export function rankDisplay(rank: Rank): string {
  switch (rank) {
    case 'JOKER_SMALL': return '小';
    case 'JOKER_BIG': return '大';
    default: return rank;
  }
}

export function isRedSuit(suit: Suit): boolean {
  return suit === 'HEART' || suit === 'DIAMOND';
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({
        id: `c${id++}`,
        rank,
        suit,
        value: rankToValue(rank),
      });
    }
  }
  deck.push({
    id: `c${id++}`,
    rank: 'JOKER_SMALL',
    suit: 'NONE',
    value: rankToValue('JOKER_SMALL'),
  });
  deck.push({
    id: `c${id++}`,
    rank: 'JOKER_BIG',
    suit: 'NONE',
    value: rankToValue('JOKER_BIG'),
  });
  return deck;
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    if (a.value !== b.value) return a.value - b.value;
    return a.suit.localeCompare(b.suit);
  });
}

export function createPlayers(): { id: PlayerId; name: string; isAI: boolean }[] {
  return [
    { id: 'player', name: '我', isAI: false },
    { id: 'ai1', name: '农民甲', isAI: true },
    { id: 'ai2', name: '农民乙', isAI: true },
  ];
}
