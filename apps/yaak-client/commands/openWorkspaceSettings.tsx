import type {
  WorkspaceSettingsHighlight,
  WorkspaceSettingsTab,
} from "../components/WorkspaceSettingsDialog";
import { WorkspaceSettingsDialog } from "../components/WorkspaceSettingsDialog";
import { activeWorkspaceIdAtom } from "../hooks/useActiveWorkspace";
import { jotaiStore } from "../lib/jotai";

export function openWorkspaceSettings(
  tab?: WorkspaceSettingsTab,
  highlight?: WorkspaceSettingsHighlight,
) {
  const workspaceId = jotaiStore.get(activeWorkspaceIdAtom);
  if (workspaceId == null) return;
  WorkspaceSettingsDialog.show(workspaceId, tab, highlight);
}
