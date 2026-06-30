import { Button } from '@/components/ui/button';

interface MenuScreenProps {
  onStart: () => void;
}

export function MenuScreen({ onStart }: MenuScreenProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a1f18] px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-6xl sm:text-7xl font-bold text-[#d4a653] tracking-widest" style={{ fontFamily: '"STKaiti", "KaiTi", "SimSun", serif' }}>
            斗地主
          </h1>
          <p className="text-[#f7f3e8]/80 text-lg tracking-wider">三人斗智斗勇，抢做地主</p>
        </div>

        <div className="bg-[#0d3b2e]/60 border border-[#d4a653]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          <h2 className="text-[#f7f3e8] text-lg font-medium mb-3">游戏规则</h2>
          <ul className="text-left text-[#f7f3e8]/70 text-sm space-y-2 list-disc list-inside">
            <li>每人 17 张牌，留 3 张底牌</li>
            <li>叫分最高者成为地主，获得底牌</li>
            <li>地主先出牌，轮流出牌或 pass</li>
            <li>支持单张、对子、顺子、炸弹、火箭等牌型</li>
            <li>任意一方出完牌即获胜</li>
          </ul>
        </div>

        <Button
          onClick={onStart}
          className="w-full py-4 text-xl bg-[#5c2b18] hover:bg-[#6d321c] text-[#f7f3e8] border-2 border-[#d4a653] shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          开始游戏
        </Button>
      </div>
    </div>
  );
}
