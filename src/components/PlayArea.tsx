import { CardView } from './Card';
import { patternDisplay } from '@/engine/patterns';
import type { LastPlay, PlayerId } from '@/engine/types';

interface PlayAreaProps {
  lastPlay: LastPlay | null;
  currentTurn: PlayerId;
  landlordId: PlayerId | null;
}

export function PlayArea({ lastPlay, currentTurn, landlordId }: PlayAreaProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[8rem]">
      {lastPlay ? (
        <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-200">
          <div className="text-[#f7f3e8] text-sm">
            <span className="font-medium text-[#d4a653]">
              {lastPlay.playerId === 'player'
                ? '我'
                : lastPlay.playerId === 'ai1'
                  ? '农民甲'
                  : '农民乙'}
            </span>
            <span className="opacity-80 ml-1">{patternDisplay(lastPlay.pattern)}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-0.5 max-w-[20rem]">
            {lastPlay.cards.map((card) => (
              <CardView
                key={card.id}
                card={card}
                className="w-9 h-13 sm:w-11 sm:h-15"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-[#f7f3e8]/70">
          <p className="text-lg font-medium">
            {currentTurn === 'player' ? '轮到你出牌' : '等待其他玩家出牌'}
          </p>
          {landlordId && (
            <p className="text-xs mt-1 opacity-70">
              {currentTurn === landlordId ? '地主出牌' : '农民出牌'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
