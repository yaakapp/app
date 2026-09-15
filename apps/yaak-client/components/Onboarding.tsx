import { platform } from "@yaakapp-internal/platform";
import { settingsAtom } from "@yaakapp-internal/models";
import { HeaderSize, Heading, Icon, type IconProps } from "@yaakapp-internal/ui";
import classNames from "classnames";
import { useAtomValue } from "jotai";
import { type ReactNode, useState } from "react";
import { openWorkspaceFromSyncDir } from "../commands/openWorkspaceFromSyncDir";
import { showDialog } from "../lib/dialog";
import { importData } from "../lib/importData";
import {
  createExampleWorkspace,
  createFreshWorkspace,
  type OnboardingChoice,
  recordOnboardingChoice,
} from "../lib/onboarding";
import { showErrorToast } from "../lib/toast";
import { CloneGitRepositoryDialog } from "./CloneGitRepositoryDialog";
import { Button } from "./core/Button";

/** Shown instead of a workspace when there are none. */
export function Onboarding() {
  const settings = useAtomValue(settingsAtom);
  const [busy, setBusy] = useState<OnboardingChoice | null>(null);

  const choose = (choice: OnboardingChoice, run: () => Promise<void> | void) => async () => {
    recordOnboardingChoice(choice);
    setBusy(choice);
    try {
      await run();
    } catch (err) {
      showErrorToast({
        id: "onboarding-failed",
        title: "Something went wrong",
        message: String(err),
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid grid-rows-[auto_minmax(0,1fr)] h-full w-full">
      <HeaderSize
        data-tauri-drag-region
        size="md"
        className="x-theme-appHeader bg-surface"
        osType={platform.osType()}
        hideWindowControls={settings.hideWindowControls}
        useNativeTitlebar={settings.useNativeTitlebar}
        interfaceScale={settings.interfaceScale}
      />
      <div className="overflow-auto px-6 py-10">
        <div className="mx-auto max-w-2xl flex flex-col gap-8">
          <div className="text-center flex flex-col gap-2">
            <Heading>Welcome to Yaak</Heading>
            <p className="text-text-subtle">
              Requests live in workspaces. How do you want to start your first one?
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Choice
              icon="folder_input"
              title="Import"
              description="Bring in a Postman, Insomnia, OpenAPI, Swagger, or curl export"
              busy={busy === "import"}
              disabled={busy != null}
              onClick={choose("import", () => importData.mutateAsync())}
            />
            <Choice
              icon="flask"
              title="Try an example"
              description="A small workspace that shows requests, variables, and chaining"
              busy={busy === "example"}
              disabled={busy != null}
              onClick={choose("example", createExampleWorkspace)}
            />
            <Choice
              icon="plus_circle"
              title="Start fresh"
              description="An empty workspace ready for your first request"
              busy={busy === "fresh"}
              disabled={busy != null}
              onClick={choose("fresh", createFreshWorkspace)}
            />
          </div>

          <div className="text-center text-sm text-text-subtle flex flex-wrap items-center justify-center gap-x-1">
            <span>Already have a Yaak workspace?</span>
            <Button
              variant="border"
              size="2xs"
              disabled={busy != null}
              onClick={choose("open_folder", async () => {
                const dir = await platform.dialog.open({
                  title: "Select Workspace Directory",
                  directory: true,
                  multiple: false,
                });
                if (dir == null) return;
                await openWorkspaceFromSyncDir.mutateAsync(dir);
              })}
            >
              Open a folder
            </Button>
            <span>or</span>
            <Button
              variant="border"
              size="2xs"
              disabled={busy != null}
              onClick={choose("clone_git", () => {
                showDialog({
                  id: "clone-git-repository",
                  size: "md",
                  title: "Clone Git Repository",
                  render: ({ hide }) => <CloneGitRepositoryDialog hide={hide} />,
                });
              })}
            >
              Clone a Git repository
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Choice({
  icon,
  title,
  description,
  onClick,
  busy,
  disabled,
}: {
  icon: IconProps["icon"];
  title: string;
  description: ReactNode;
  onClick: () => void;
  busy: boolean;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        "text-left rounded-lg border border-border-subtle bg-surface p-4",
        "flex flex-col gap-2 transition-colors",
        "hocus:border-border hocus:bg-surface-highlight focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-info",
        disabled && !busy && "opacity-60",
      )}
    >
      <Icon icon={busy ? "refresh" : icon} spin={busy} size="lg" className="text-text-subtle" />
      <div className="font-semibold text-text">{title}</div>
      <div className="text-sm text-text-subtle">{description}</div>
    </button>
  );
}
