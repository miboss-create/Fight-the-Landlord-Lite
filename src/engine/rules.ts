import type { Card, LastPlay, Pattern, Player, PlayerId } from './types';

export const PLAYER_ORDER: PlayerId[] = ['player', 'ai1', 'ai2'];

export function playerIndex(id: PlayerId): number {
  return PLAYER_ORDER.indexOf(id);
}

export function nextPlayerId(id: PlayerId): PlayerId {
  return PLAYER_ORDER[(playerIndex(id) + 1) % PLAYER_ORDER.length];
}

export function previousPlayerId(id: PlayerId): PlayerId {
  return PLAYER_ORDER[(playerIndex(id) + PLAYER_ORDER.length - 1) % PLAYER_ORDER.length];
}

export function isOpponent(landlordId: PlayerId, selfId: PlayerId, otherId: PlayerId): boolean {
  // 地主 vs 农民，或农民 vs 地主
  return (
    (selfId === landlordId) !== (otherId === landlordId)
  );
}

export function getPlayerById(players: Player[], id: PlayerId): Player {
  const player = players.find((p) => p.id === id);
  if (!player) throw new Error(`Player ${id} not found`);
  return player;
}

export function removeCards(hand: Card[], cardsToRemove: Card[]): Card[] {
  const ids = new Set(cardsToRemove.map((c) => c.id));
  return hand.filter((c) => !ids.has(c.id));
}

export function shouldClearLastPlay(lastPlay: LastPlay, currentId: PlayerId): boolean {
  // 当前玩家 pass 后，轮回到上一轮出牌者，则清空上一手
  return nextPlayerId(currentId) === lastPlay.playerId;
}
