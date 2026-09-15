import { VStack } from "@yaakapp-internal/ui";
import { openWorkspaceSettings } from "../../commands/openWorkspaceSettings";
import { useKeyValue } from "../../hooks/useKeyValue";
import { showToast } from "../../lib/toast";
import { FeatureHint } from "../core/FeatureHint";

const DOCS_URL = "https://yaak.app/docs/collaboration/local-directory-git-sync";

/** What the sidebar's Git slot shows while the workspace only lives in the app's database. */
export function SyncWorkspaceHint({ workspaceId }: { workspaceId: string }) {
  // Hidden from the menu this replaced, so honor it
  const { value: legacyHidden } = useKeyValue<Record<string, boolean>>({
    key: "setup_sync",
    fallback: {},
  });

  if (legacyHidden == null || legacyHidden[workspaceId]) return null;

  return (
    <FeatureHint
      id={`sync-workspace:${workspaceId}`}
      className="mx-2 mb-2!"
      docsUrl={DOCS_URL}
      action={{ label: "Configure", onClick: () => openWorkspaceSettings("settings", "sync_dir") }}
      onDismiss={showSyncLocationToast}
    >
      Sync this workspace to a folder of plain files to back it up or track it with Git.
    </FeatureHint>
  );
}

function showSyncLocationToast() {
  showToast({
    id: "sync-hint-dismissed",
    color: "info",
    timeout: 8000,
    message: (
      <VStack>
        <h2 className="font-semibold">Sync whenever you're ready</h2>
        <p className="text-text-subtle text-sm">Directory sync and Git are in Workspace Settings</p>
      </VStack>
    ),
  });
}
