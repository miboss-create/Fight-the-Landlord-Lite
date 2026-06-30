import { CardView } from './Card';
import type { Card } from '@/engine/types';

interface PlayerHandProps {
  cards: Card[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export function PlayerHand({ cards, selectedIds, onToggle, disabled = false }: PlayerHandProps) {
  return (
    <div className="flex items-end justify-center overflow-x-auto pb-2 px-4">
      <div className="flex" style={{ paddingLeft: `${Math.max(0, (cards.length - 1) * 10)}px` }}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="shrink-0"
            style={{ marginLeft: index === 0 ? 0 : '-2.25rem' }}
          >
            <CardView
              card={card}
              selected={selectedIds.includes(card.id)}
              onClick={() => !disabled && onToggle(card.id)}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
