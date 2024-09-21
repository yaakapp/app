import { useSyncStage } from '../hooks/useSyncStage';

export function SyncCheckpointDialog() {
  useSyncStage();
  return <div>Hello World</div>;
}
