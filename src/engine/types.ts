export type PlayerId = 'player' | 'ai1' | 'ai2';

export type Suit = 'SPADE' | 'HEART' | 'CLUB' | 'DIAMOND' | 'NONE';

export type Rank =
  | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  | 'J' | 'Q' | 'K' | 'A' | '2'
  | 'JOKER_SMALL' | 'JOKER_BIG';

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
  value: number;
}

export interface Player {
  id: PlayerId;
  name: string;
  hand: Card[];
  isLandlord: boolean;
  isAI: boolean;
}

export type Phase = 'MENU' | 'DEALING' | 'BIDDING' | 'PLAYING' | 'SETTLEMENT';

export type PatternType =
  | 'SINGLE'
  | 'PAIR'
  | 'TRIPLE'
  | 'TRIPLE_WITH_SINGLE'
  | 'TRIPLE_WITH_PAIR'
  | 'STRAIGHT'
  | 'DOUBLE_STRAIGHT'
  | 'PLANE'
  | 'PLANE_WITH_SINGLE'
  | 'PLANE_WITH_PAIR'
  | 'BOMB'
  | 'ROCKET';

export interface Pattern {
  type: PatternType;
  mainValue: number;
  length?: number;
  kickerCount?: number;
}

export interface LastPlay {
  playerId: PlayerId;
  cards: Card[];
  pattern: Pattern;
}

export interface GameState {
  phase: Phase;
  players: Player[];
  deck: Card[];
  landlordCards: Card[];
  currentBid: number;
  bidder: PlayerId | null;
  biddingIndex: number;
  landlordId: PlayerId | null;
  currentTurn: PlayerId;
  lastPlay: LastPlay | null;
  selectedCardIds: string[];
  winner: PlayerId | null;
  logs: string[];
}
