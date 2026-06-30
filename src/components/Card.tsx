import { cn } from '@/lib/utils';
import type { Card as CardType } from '@/engine/types';
import { isRedSuit, rankDisplay, suitSymbol } from '@/engine/cards';

interface CardProps {
  card?: CardType;
  faceUp?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function CardView({
  card,
  faceUp = true,
  selected = false,
  onClick,
  className,
  disabled = false,
}: CardProps) {
  const isJoker = card?.rank === 'JOKER_SMALL' || card?.rank === 'JOKER_BIG';
  const isRed = card && !isJoker && isRedSuit(card.suit);
  const isBlack = card && !isJoker && !isRedSuit(card.suit);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative rounded-lg border shadow-md transition-transform duration-150 ease-out',
        'flex flex-col items-center justify-center select-none',
        'w-14 h-20 sm:w-16 sm:h-24',
        selected && '-translate-y-3',
        disabled && 'cursor-default',
        faceUp
          ? 'bg-[#f7f3e8] border-[#d4a653]'
          : 'bg-[#5c2b18] border-[#3e1c10] cursor-pointer',
        className,
      )}
    >
      {faceUp && card ? (
        <>
          <span
            className={cn(
              'absolute top-1 left-1.5 text-xs sm:text-sm font-bold leading-none',
              isRed && 'text-red-700',
              isBlack && 'text-neutral-900',
              isJoker && 'text-yellow-600',
            )}
          >
            {rankDisplay(card.rank)}
          </span>
          <span
            className={cn(
              'text-2xl sm:text-3xl font-bold',
              isRed && 'text-red-700',
              isBlack && 'text-neutral-900',
              isJoker && 'text-yellow-600',
            )}
          >
            {isJoker ? '王' : suitSymbol(card.suit)}
          </span>
          <span
            className={cn(
              'absolute bottom-1 right-1.5 text-xs sm:text-sm font-bold leading-none rotate-180',
              isRed && 'text-red-700',
              isBlack && 'text-neutral-900',
              isJoker && 'text-yellow-600',
            )}
          >
            {rankDisplay(card.rank)}
          </span>
        </>
      ) : (
        <div
          className={cn(
            'w-full h-full rounded-md',
            'bg-[ repeating-linear-gradient(45deg,#5c2b18_0px,#5c2b18_6px,#6d321c_6px,#6d321c_12px)]',
            'border border-[#d4a653]/40',
          )}
        >
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#d4a653]/60 text-xs">斗地主</span>
          </div>
        </div>
      )}
    </button>
  );
}
