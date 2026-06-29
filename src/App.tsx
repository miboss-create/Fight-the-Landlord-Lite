import { useGameStore } from '@/store/gameStore';
import { GameScreen } from '@/components/GameScreen';
import { MenuScreen } from '@/components/MenuScreen';

export default function App() {
  const phase = useGameStore((state) => state.phase);
  const startGame = useGameStore((state) => state.startGame);

  if (phase === 'MENU') {
    return <MenuScreen onStart={startGame} />;
  }

  return <GameScreen />;
}
