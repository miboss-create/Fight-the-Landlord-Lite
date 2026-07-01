import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

interface EffectOverlayProps {
  type: 'BOMB' | 'ROCKET' | 'PLANE';
  effectKey: number;
}

export function EffectOverlay({ type, effectKey }: EffectOverlayProps) {
  const clearEffect = useGameStore((state) => state.clearEffect);

  useEffect(() => {
    const timer = setTimeout(() => clearEffect(), 1200);
    return () => clearTimeout(timer);
  }, [effectKey, clearEffect]);

  if (type === 'BOMB') {
    return (
      <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-yellow-100/30 animate-bomb-flash" />
        <div className="text-6xl font-black text-[#d4a653] animate-bomb-flash drop-shadow-[0_0_20px_rgba(212,166,83,0.9)]">
          炸弹！
        </div>
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="particle absolute w-2 h-2 rounded-full bg-[#d4a653]"
            style={{
              left: '50%',
              top: '50%',
              '--tw-translate-x': `${Math.cos((i / 24) * Math.PI * 2) * (120 + Math.random() * 80)}px`,
              '--tw-translate-y': `${Math.sin((i / 24) * Math.PI * 2) * (120 + Math.random() * 80)}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    );
  }

  if (type === 'ROCKET') {
    return (
      <div className="absolute inset-0 pointer-events-none z-50 flex items-end justify-center overflow-hidden">
        <div className="absolute inset-0 bg-white animate-rocket-flash" />
        <div className="absolute bottom-0 w-24 h-[80vh] bg-gradient-to-t from-[#d4a653] via-yellow-200/60 to-transparent animate-rocket-beam blur-md" />
        <div className="absolute bottom-10 text-5xl font-black text-[#d4a653] animate-rocket-beam drop-shadow-[0_0_20px_rgba(212,166,83,0.9)]">
          火箭！
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-plane-fly text-4xl"
          style={{
            animationDelay: `${i * 0.1}s`,
            top: `${30 + i * 10}%`,
          }}
        >
          ✈️
        </div>
      ))}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-[#d4a653] animate-plane-fly drop-shadow-[0_0_15px_rgba(212,166,83,0.8)]">
        飞机！
      </div>
    </div>
  );
}
