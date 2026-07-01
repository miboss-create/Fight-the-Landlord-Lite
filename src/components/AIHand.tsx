import { Crown } from 'lucide-react';
import { CardView } from './Card';

interface AIHandProps {
  name: string;
  count: number;
  position: 'left' | 'right';
  isLandlord: boolean;
  isActive: boolean;
}

const avatarMap: Record<string, string> = {
  '农民甲': '/assets/avatars/farmer-male.svg',
  '农民乙': '/assets/avatars/farmer-female.svg',
  '我': '/assets/avatars/landlord.svg',
};

export function AIHand({ name, count, position, isLandlord, isActive }: AIHandProps) {
  const cardsToShow = Math.min(count, 12);
  const isLeft = position === 'left';

  return (
    <div
      className={`flex flex-col items-center gap-2 ${isLeft ? 'items-start' : 'items-end'}`}
    >
      <div className="relative">
        <img
          src={avatarMap[name] || '/assets/avatars/farmer-male.svg'}
          alt={name}
          className={`w-12 h-12 sm:w-14 sm:h-14 avatar ${isLandlord ? 'avatar-landlord' : ''} ${isActive ? 'avatar-active' : ''}`}
        />
        {isLandlord && (
          <Crown className="absolute -top-1 -right-1 w-4 h-4 text-[#d4a653] bg-[#0a1f18] rounded-full p-0.5" />
        )}
      </div>
      <div className="flex items-center gap-1.5 text-[#f7f3e8]">
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
