import { Button } from '@/components/ui/button';
import type { PlayerId } from '@/engine/types';

interface SettlementModalProps {
  winner: PlayerId;
  landlordId: PlayerId | null;
  onRestart: () => void;
}

export function SettlementModal({ winner, landlordId, onRestart }: SettlementModalProps) {
  const playerWon = winner === 'player';
  const playerIsLandlord = landlordId === 'player';
  const landlordWon = winner === landlordId;

  let title = '';
  if (playerWon) {
    title = playerIsLandlord ? '地主获胜！' : '农民阵营获胜！';
  } else {
    title = landlordWon ? '地主获胜' : '农民阵营获胜';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="max-w-sm w-full bg-[#0d3b2e] border-2 border-[#d4a653] rounded-2xl p-8 text-center shadow-2xl">
        <h2 className={`text-4xl font-bold mb-2 ${playerWon ? 'text-[#d4a653]' : 'text-[#f7f3e8]'}`} style={{ fontFamily: '"STKaiti", "KaiTi", "SimSun", serif' }}>
          {title}
        </h2>
        <p className="text-[#f7f3e8]/80 mb-6">
          {winner === 'player' ? '恭喜你赢得本局！' : '再接再厉，下局见！'}
        </p>
        <Button
          onClick={onRestart}
          className="w-full py-3 text-lg bg-[#5c2b18] hover:bg-[#6d321c] text-[#f7f3e8] border border-[#d4a653]"
        >
          重新开始
        </Button>
      </div>
    </div>
  );
}
