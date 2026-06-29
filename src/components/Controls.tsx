import { Button } from '@/components/ui/button';
import type { LastPlay, PlayerId } from '@/engine/types';

interface ControlsProps {
  phase: 'BIDDING' | 'PLAYING';
  currentTurn: PlayerId;
  currentBid: number;
  lastPlay: LastPlay | null;
  canPlay: boolean;
  onBid: (score: number) => void;
  onPlay: () => void;
  onPass: () => void;
  onHint: () => void;
}

export function Controls({
  phase,
  currentTurn,
  currentBid,
  lastPlay,
  canPlay,
  onBid,
  onPlay,
  onPass,
  onHint,
}: ControlsProps) {
  const isPlayerTurn = currentTurn === 'player';

  if (phase === 'BIDDING') {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-[#f7f3e8] text-sm">
          {isPlayerTurn ? '请叫分' : '等待其他玩家叫分'}
          <span className="ml-2 text-[#d4a653]">当前最高分：{currentBid} 分</span>
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[1, 2, 3].map((score) => (
            <Button
              key={score}
              onClick={() => onBid(score)}
              disabled={!isPlayerTurn || score <= currentBid}
              className="bg-[#5c2b18] hover:bg-[#6d321c] text-[#f7f3e8] border border-[#d4a653] disabled:opacity-40"
            >
              {score} 分
            </Button>
          ))}
          <Button
            onClick={() => onBid(0)}
            disabled={!isPlayerTurn}
            className="bg-[#2d2d2d] hover:bg-[#3d3d3d] text-[#f7f3e8] border border-[#d4a653]/50 disabled:opacity-40"
          >
            不叫
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          onClick={onPlay}
          disabled={!isPlayerTurn || !canPlay}
          className="bg-emerald-700 hover:bg-emerald-600 text-white disabled:opacity-40"
        >
          出牌
        </Button>
        <Button
          onClick={onPass}
          disabled={!isPlayerTurn || !lastPlay}
          className="bg-neutral-600 hover:bg-neutral-500 text-white disabled:opacity-40"
        >
          不要
        </Button>
        <Button
          onClick={onHint}
          disabled={!isPlayerTurn}
          className="bg-sky-700 hover:bg-sky-600 text-white disabled:opacity-40"
        >
          提示
        </Button>
      </div>
    </div>
  );
}
