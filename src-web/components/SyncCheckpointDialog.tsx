import { useSyncStage } from '../hooks/useSyncStage';

export function SyncCheckpointDialog() {
  const stage = useSyncStage();
  return (
    <div>
      <table className="w-full mb-auto min-w-full max-w-full divide-y divide-surface-highlight">
        <thead>
          <tr>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-highlight">
          {(stage.data as unknown[])?.map((s) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const s2 = s as any;
            return (
              <tr key={s2.hash}>
                <td className="py-2 whitespace-nowrap">{s2.name}</td>
                <td>{JSON.stringify(s2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
