import { create } from 'zustand';
import type { Card, GameState, LastPlay, Pattern, Player, PlayerId } from '@/engine/types';
import { createDeck, createPlayers, shuffle, sortHand } from '@/engine/cards';
import { getPattern, patternBeats } from '@/engine/patterns';
import { chooseBid, choosePlay, findBeatingPlay, findRocket, findBomb } from '@/engine/ai';
import { getPlayerById, nextPlayerId, removeCards } from '@/engine/rules';

interface GameStore extends GameState {
  startGame: () => void;
  bid: (score: number) => void;
  aiBid: () => void;
  finalizeBidding: () => void;
  toggleCardSelection: (id: string) => void;
  selectCards: (ids: string[]) => void;
  clearSelection: () => void;
  playSelected: () => void;
  playCards: (playerId: PlayerId, cards: Card[]) => void;
  pass: () => void;
  passById: (id: PlayerId) => void;
  aiPlay: () => void;
  hint: () => void;
  resetGame: () => void;
  effect: { type: 'BOMB' | 'ROCKET' | 'PLANE' | null; key: number };
  clearEffect: () => void;
}

function makeInitialState(): GameState {
  return {
    phase: 'MENU',
    players: createPlayers().map((p) => ({ ...p, hand: [], isLandlord: false })),
    deck: [],
    landlordCards: [],
    currentBid: 0,
    bidder: null,
    biddingIndex: 0,
    landlordId: null,
    currentTurn: 'player',
    lastPlay: null,
    selectedCardIds: [],
    winner: null,
    logs: [],
    effect: { type: null, key: 0 },
  };
}

function advanceAfterPlay(state: GameState, playerId: PlayerId): GameState {
  const next = nextPlayerId(playerId);
  const nextIsAI = getPlayerById(state.players, next).isAI;
  const newState = { ...state, currentTurn: next };
  if (nextIsAI) {
    setTimeout(() => useGameStore.getState().aiPlay(), 800);
  }
  return newState;
}

function advanceAfterPass(state: GameState, id: PlayerId): GameState {
  const last = state.lastPlay;
  if (!last) return state;

  const next = nextPlayerId(id);
  if (next === last.playerId) {
    // 其他两家都 pass，新一轮由上轮出牌者开始
    const newState = {
      ...state,
      currentTurn: last.playerId,
      lastPlay: null,
    };
    if (getPlayerById(newState.players, last.playerId).isAI) {
      setTimeout(() => useGameStore.getState().aiPlay(), 800);
    }
    return newState;
  }

  const newState = { ...state, currentTurn: next };
  if (getPlayerById(newState.players, next).isAI) {
    setTimeout(() => useGameStore.getState().aiPlay(), 800);
  }
  return newState;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...makeInitialState(),

  startGame: () => {
    const deck = shuffle(createDeck());
    const playerDefs = createPlayers();
    const players: Player[] = playerDefs.map((p, i) => ({
      ...p,
      hand: sortHand(deck.slice(i * 17, i * 17 + 17)),
      isLandlord: false,
    }));
    const landlordCards = deck.slice(51, 54);

    set({
      phase: 'BIDDING',
      players,
      deck,
      landlordCards,
      currentBid: 0,
      bidder: null,
      biddingIndex: 0,
      landlordId: null,
      currentTurn: 'player',
      lastPlay: null,
      selectedCardIds: [],
      winner: null,
      logs: ['游戏开始，请叫分'],
    });
  },

  bid: (score) => {
    const state = get();
    if (state.phase !== 'BIDDING') return;
    const currentId = state.players[state.biddingIndex].id;

    let nextBidder: PlayerId | null = null;
    if (score > state.currentBid) {
      nextBidder = currentId;
    }

    const newBid = Math.max(state.currentBid, score);
    const log = score > 0
      ? `${getPlayerById(state.players, currentId).name} 叫 ${score} 分`
      : `${getPlayerById(state.players, currentId).name} 不叫`;

    const nextIndex = state.biddingIndex + 1;
    set({
      currentBid: newBid,
      bidder: nextBidder ?? state.bidder,
      biddingIndex: nextIndex,
      logs: [...state.logs, log],
    });

    if (nextIndex < state.players.length) {
      const nextId = state.players[nextIndex].id;
      if (getPlayerById(state.players, nextId).isAI) {
        setTimeout(() => get().aiBid(), 700);
      }
    } else {
      setTimeout(() => get().finalizeBidding(), 700);
    }
  },

  aiBid: () => {
    const state = get();
    if (state.phase !== 'BIDDING') return;
    const hand = state.players[state.biddingIndex].hand;
    const score = chooseBid(hand, state.currentBid);
    get().bid(score);
  },

  finalizeBidding: () => {
    const state = get();
    if (state.phase !== 'BIDDING') return;
    if (!state.bidder) {
      set({ logs: [...state.logs, '无人叫分，重新发牌'] });
      setTimeout(() => get().startGame(), 1000);
      return;
    }

    const landlordId = state.bidder;
    const players = state.players.map((p) => {
      if (p.id === landlordId) {
        return {
          ...p,
          isLandlord: true,
          hand: sortHand([...p.hand, ...state.landlordCards]),
        };
      }
      return p;
    });

    set({
      phase: 'PLAYING',
      players,
      landlordId,
      currentTurn: landlordId,
      lastPlay: null,
      logs: [
        ...state.logs,
        `${getPlayerById(players, landlordId).name} 成为地主，获得底牌`,
      ],
    });

    if (getPlayerById(players, landlordId).isAI) {
      setTimeout(() => get().aiPlay(), 1000);
    }
  },

  toggleCardSelection: (id) => {
    const state = get();
    const selected = new Set(state.selectedCardIds);
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    set({ selectedCardIds: Array.from(selected) });
  },

  selectCards: (ids) => set({ selectedCardIds: ids }),
  clearSelection: () => set({ selectedCardIds: [] }),

  playSelected: () => {
    const state = get();
    if (state.phase !== 'PLAYING' || state.currentTurn !== 'player') return;
    const player = getPlayerById(state.players, 'player');
    const selected = player.hand.filter((c) => state.selectedCardIds.includes(c.id));
    if (selected.length === 0) return;

    const pattern = getPattern(selected);
    if (!pattern) {
      set({ logs: [...state.logs, '选中的牌不符合牌型'] });
      return;
    }

    if (state.lastPlay && !patternBeats(pattern, state.lastPlay.pattern)) {
      set({ logs: [...state.logs, '所选牌型无法大过上家'] });
      return;
    }

    get().playCards('player', selected);
  },

  playCards: (playerId, cards) => {
    const state = get();
    if (state.phase !== 'PLAYING') return;

    const pattern = getPattern(cards);
    if (!pattern) return;

    const players = state.players.map((p) =>
      p.id === playerId ? { ...p, hand: removeCards(p.hand, cards) } : p,
    );

    const player = getPlayerById(players, playerId);
    const lastPlay: LastPlay = { playerId, cards, pattern };
    const logs = [
      ...state.logs,
      `${player.name} 出了 ${patternDisplay(pattern)}`,
    ];

    const effectType =
      pattern.type === 'BOMB' || pattern.type === 'ROCKET' || pattern.type === 'PLANE'
        ? pattern.type
        : null;
    const effect = effectType
      ? { type: effectType, key: state.effect.key + 1 }
      : state.effect;

    set({
      players,
      lastPlay,
      selectedCardIds: playerId === 'player' ? [] : state.selectedCardIds,
      logs,
      effect,
    });

    if (player.hand.length === 0) {
      set({
        phase: 'SETTLEMENT',
        winner: playerId,
        logs: [...logs, `${player.name} 获胜！`],
      });
      return;
    }

    const newState = advanceAfterPlay({ ...get(), players, lastPlay, logs }, playerId);
    set(newState);
  },

  pass: () => {
    const state = get();
    if (state.phase !== 'PLAYING' || state.currentTurn !== 'player') return;
    if (!state.lastPlay) {
      set({ logs: [...state.logs, '新一轮必须由你出牌'] });
      return;
    }
    const name = getPlayerById(state.players, 'player').name;
    set({ logs: [...state.logs, `${name} 不要`] });
    set(advanceAfterPass(get(), 'player'));
  },

  passById: (id) => {
    const state = get();
    if (state.phase !== 'PLAYING') return;
    const name = getPlayerById(state.players, id).name;
    set({ logs: [...state.logs, `${name} 不要`] });
    set(advanceAfterPass(get(), id));
  },

  aiPlay: () => {
    const state = get();
    if (state.phase !== 'PLAYING') return;
    const id = state.currentTurn;
    const player = getPlayerById(state.players, id);
    if (!player.isAI) return;

    const handSizes = Object.fromEntries(
      state.players.map((p) => [p.id, p.hand.length]),
    ) as Record<PlayerId, number>;

    const last = state.lastPlay
      ? { pattern: state.lastPlay.pattern, playerId: state.lastPlay.playerId }
      : null;

    const cards = choosePlay(player.hand, last, state.landlordId ?? 'player', id, handSizes);
    if (cards && cards.length > 0) {
      get().playCards(id, cards);
    } else {
      get().passById(id);
    }
  },

  hint: () => {
    const state = get();
    if (state.phase !== 'PLAYING' || state.currentTurn !== 'player') return;
    const player = getPlayerById(state.players, 'player');
    if (state.lastPlay) {
      const cards = findBeatingPlay(player.hand, state.lastPlay.pattern);
      if (cards) {
        set({ selectedCardIds: cards.map((c) => c.id) });
        return;
      }
      const bomb = findBomb(player.hand);
      if (bomb) {
        set({ selectedCardIds: bomb.map((c) => c.id) });
        return;
      }
      const rocket = findRocket(player.hand);
      if (rocket) {
        set({ selectedCardIds: rocket.map((c) => c.id) });
        return;
      }
    } else {
      // 提示一张最小单牌
      const sorted = [...player.hand].sort((a, b) => a.value - b.value);
      if (sorted.length > 0) {
        set({ selectedCardIds: [sorted[0].id] });
      }
    }
  },

  resetGame: () => set(makeInitialState()),

  clearEffect: () => set((state) => ({ effect: { ...state.effect, type: null } })),
}));

function patternDisplay(pattern: Pattern): string {
  const map: Record<string, string> = {
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
  return map[pattern.type] ?? pattern.type;
}
