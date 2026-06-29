import { Crown } from 'lucide-react';
import { CardView } from './Card';

interface AIHandProps {
  name: string;
  count: number;
  position: 'left' | 'right';
  isLandlord: boolean;
  isActive: boolean;
}

export function AIHand({ name, count, position, isLandlord, isActive }: AIHandProps) {
  const cardsToShow = Math.min(count, 12);
  const isLeft = position === 'left';

  return (
    <div
      className={`flex flex-col items-center gap-1 ${isLeft ? 'items-start' : 'items-end'}`}
    >
      <div className="flex items-center gap-1.5 text-[#f7f3e8]">
        {isLandlord && <Crown className="w-4 h-4 text-[#d4a653]" />}
        <span className={`text-sm font-medium ${isActive ? 'text-[#d4a653]' : ''}`}>
          {name}
        </span>
        <span className="text-xs opacity-80">({count})</span>
      </div>
      <div className="flex">
        {Array.from({ length: cardsToShow }).map((_, i) => (
          <div
            key={i}
            className="shrink-0"
            style={{
              marginLeft: i === 0 ? 0 : isLeft ? '-2.5rem' : '-2.5rem',
              zIndex: isLeft ? cardsToShow - i : i,
            }}
          >
            <CardView faceUp={false} className="w-10 h-14 sm:w-12 sm:h-17" />
          </div>
        ))}
        {count > cardsToShow && (
          <span className="text-[#f7f3e8] text-xs ml-1 self-center">+{count - cardsToShow}</span>
        )}
      </div>
    </div>
  );
}
