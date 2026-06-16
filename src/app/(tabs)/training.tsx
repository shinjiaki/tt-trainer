import { SessionScreen } from '@/features/training/SessionScreen';
import { TrainingLobbyScreen } from '@/features/training/TrainingLobbyScreen';
import { getActiveSession } from '@/store/selectors';
import { useStore } from '@/store/useStore';

/**
 * The Treino tab shows the live session while one is active (so the tab bar
 * stays visible during training), otherwise the lobby (start + history).
 */
export default function TrainingTab() {
  const active = useStore(getActiveSession);
  return active ? <SessionScreen /> : <TrainingLobbyScreen />;
}
