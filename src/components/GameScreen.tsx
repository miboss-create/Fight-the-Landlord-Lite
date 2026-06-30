import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { AIHand } from './AIHand';
import { Controls } from './Controls';
import { PlayArea } from './PlayArea';
import { PlayerHand } from './PlayerHand';
import { SettlementModal } from './SettlementModal';
import { getPattern, patternBeats } from '@/engine/patterns';
import { getPlayerById } from '@/engine/rules';
import { Crown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GameScreen() {
  const {
    players,
    phase,
    currentBid,
    landlordId,
    currentTurn,
    lastPlay,
    selectedCardIds,
    winner,
    logs,
    startGame,
    bid,
    playSelected,
    pass,
    hint,
    resetGame,
    toggleCardSelection,
  } = useGameStore();

  const player = getPlayerById(players, 'player');
  const ai1 = getPlayerById(players, 'ai1');
  const ai2 = getPlayerById(players, 'ai2');

  const canPlay = useMemo(() => {
    if (phase !== 'PLAYING' || currentTurn !== 'player') return false;
    const selected = player.hand.filter((c) => selectedCardIds.includes(c.id));
    if (selected.length === 0) return false;
    const pattern = getPattern(selected);
    if (!pattern) return false;
    if (!lastPlay) return true;
    return patternBeats(pattern, lastPlay.pattern);
  }, [phase, currentTurn, player.hand, selectedCardIds, lastPlay]);

  const visibleLogs = logs.slice(-4);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[radial-gradient(ellipse_at_center,_#145a45_0%,_#0a1f18_100%)] text-[#f7f3e8]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#d4a653]/20 bg-[#0d3b2e]/40">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#d4a653]" style={{ fontFamily: '"STKaiti", "KaiTi", "SimSun", serif' }}>
            斗地主
          </h1>
          {landlordId === 'player' && <Crown className="w-4 h-4 text-[#d4a653]" />}
        </div>
        <Button
          onClick={resetGame}
          className="px-3 py-1.5 text-sm bg-transparent hover:bg-[#d4a653]/10 text-[#f7f3e8] border border-[#d4a653]/50"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          返回主菜单
        </Button>
      </header>

      {/* AI hands + table */}
      <div className="flex-1 flex flex-col px-2 sm:px-6 py-4 gap-4 overflow-hidden">
        <div className="flex justify-between items-start">
          <AIHand
            name={ai1.name}
            count={ai1.hand.length}
            position="left"
            isLandlord={ai1.isLandlord}
            isActive={currentTurn === 'ai1'}
          />
          <AIHand
            name={ai2.name}
            count={ai2.hand.length}
            position="right"
            isLandlord={ai2.isLandlord}
            isActive={currentTurn === 'ai2'}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <PlayArea lastPlay={lastPlay} currentTurn={currentTurn} landlordId={landlordId} />
        </div>

        {/* Logs */}
        <div className="h-16 overflow-hidden text-center">
          <div className="inline-flex flex-col-reverse items-center text-xs text-[#f7f3e8]/70 bg-black/20 rounded-lg px-3 py-1.5">
            {visibleLogs.map((log, i) => (
              <span key={i}>{log}</span>
            ))}
          </div>
        </div>

        {/* Player area */}
        <div className="flex flex-col items-center gap-3 pb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className={currentTurn === 'player' ? 'text-[#d4a653] font-medium' : 'text-[#f7f3e8]/70'}>
              {currentTurn === 'player' ? '→ 你的回合' : '等待中'}
            </span>
            <span className="text-[#f7f3e8]/50">|</span>
            <span className="text-[#f7f3e8]/70">手牌 {player.hand.length}</span>
          </div>

          <PlayerHand
            cards={player.hand}
            selectedIds={selectedCardIds}
            onToggle={toggleCardSelection}
            disabled={phase !== 'PLAYING' || currentTurn !== 'player'}
          />

          {phase === 'BIDDING' || phase === 'PLAYING' ? (
            <Controls
              phase={phase === 'BIDDING' ? 'BIDDING' : 'PLAYING'}
              currentTurn={currentTurn}
              currentBid={currentBid}
              lastPlay={lastPlay}
              canPlay={canPlay}
              onBid={bid}
              onPlay={playSelected}
              onPass={pass}
              onHint={hint}
            />
          ) : null}
        </div>
      </div>

      {phase === 'SETTLEMENT' && winner && (
        <SettlementModal winner={winner} landlordId={landlordId} onRestart={startGame} />
      )}
    </div>
  );
}
