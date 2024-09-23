import type { StageObject, SyncObject, SyncStatus } from '@yaakapp-internal/sync';
import { Fragment, useMemo, useState } from 'react';
import { useSyncStage } from '../hooks/useSyncStage';
import { resolvedModelName } from '../lib/resolvedModelName';
import { Button } from './core/Button';
import type { CheckboxProps } from './core/Checkbox';
import { Checkbox } from './core/Checkbox';
import { Editor } from './core/Editor';
import { SplitLayout } from './core/SplitLayout';
import { HStack } from './core/Stacks';

interface TreeNode {
  children: TreeNode[];
  object: SyncObject;
  status: SyncStatus;
}

export function SyncCheckpointDialog() {
  const stage = useSyncStage();

  const [addedIds, setAddedIds] = useState<Record<string, boolean>>(() => {
    const s: Record<string, boolean> = {};
    // By default, add all files that are already tracked
    for (const o of stage.data?.objects ?? []) {
      if (o.status !== 'untracked') {
        s[o.object.metadata.id] = true;
      }
    }
    return s;
  });

  const tree: TreeNode | null = useMemo(() => {
    const objects = stage.data?.objects ?? [];
    const root = objects.find((o) => o.object.metadata.model === 'workspace');
    if (root == null) {
      return null;
    }

    const buildNode = (parent: StageObject): TreeNode => {
      const children = objects
        .filter(({ object: { metadata } }) =>
          metadata.folder_id != null
            ? metadata.folder_id === parent.object.metadata.id
            : metadata.workspace_id === parent.object.metadata.id,
        )
        .map((object) => {
          return buildNode(object);
        });
      return { ...parent, children };
    };

    return buildNode(root);
  }, [stage.data]);

  const toggle = (node: TreeNode) => {
    setAddedIds((currentAddedIds) => {
      const currentChecked = nodeCheckedStatus(node, addedIds);
      const checked = currentChecked !== true;
      const newAddedIds = structuredClone(currentAddedIds);
      setCheckedOnChildren(node, currentAddedIds, checked);
      return newAddedIds;
    });
  };

  if (tree == null) {
    return null;
  }

  return (
    <div className="h-[80vh] w-[40rem] max-w-[100vw] flex flex-col gap-3 mb-auto pb-2">
      <SplitLayout
        name="commit"
        layout="vertical"
        defaultRatio={0.25}
        firstSlot={({ style }) => (
          <div style={style} className="h-full overflow-y-auto">
            <TreeNodeChildren node={tree} depth={0} onToggle={toggle} state={addedIds} />
          </div>
        )}
        secondSlot={({ style }) => (
          <div style={style} className="grid grid-rows-[minmax(0,1fr)_auto] gap-3 h-full">
            <div className="bg-surface-highlight border border-border rounded-md overflow-hidden">
              <Editor
                className="!text-base font-sans h-full rounded-md"
                placeholder="Commit message..."
              />
            </div>
            <HStack justifyContent="end" space={2}>
              <Button color="secondary" size="sm">
                Commit
              </Button>
              <Button color="secondary" size="sm">
                Commit and Push
              </Button>
            </HStack>
          </div>
        )}
      />
    </div>
  );
}

function TreeNodeChildren({
  node,
  depth,
  state,
  onToggle,
}: {
  node: TreeNode | null;
  depth: number;
  state: Record<string, boolean>;
  onToggle: (node: TreeNode) => void;
}) {
  if (node === null) return null;

  const indent = new Array(depth + 1).join(' ');
  const checked = nodeCheckedStatus(node, state);
  return (
    <>
      <div className="flex">
        <pre aria-hidden className="whitespace-pre inline">
          {indent}
        </pre>
        <div className="flex gap-3 w-full">
          <Checkbox
            className="w-full hover:bg-surface-highlight"
            checked={checked}
            title={resolvedModelName(JSON.parse(atob(node.object.data)))}
            onChange={() => onToggle(node)}
          />
        </div>
      </div>

      {node.children.map((childNode) => {
        return (
          <Fragment key={childNode.object.metadata.id}>
            <TreeNodeChildren
              node={childNode}
              depth={depth + 1}
              onToggle={onToggle}
              state={state}
            />
          </Fragment>
        );
      })}
    </>
  );
}

function nodeCheckedStatus(
  node: TreeNode,
  state: Record<string, boolean>,
): CheckboxProps['checked'] {
  let leavesVisited = 0;
  let leavesChecked = 0;

  if (node.children.length === 0) {
    return state[node.object.metadata.id] ?? false;
  }

  const visitChildren = (n: TreeNode) => {
    if (n.children.length === 0) {
      leavesVisited += 1;
      const checked = state[n.object.metadata.id] ?? false;
      if (checked) leavesChecked += 1;
    }
    for (const child of n.children) {
      visitChildren(child);
    }
  };

  visitChildren(node);

  if (leavesVisited === leavesChecked) {
    return true;
  } else if (leavesChecked === 0) {
    return false;
  } else {
    return 'indeterminate';
  }
}

function setCheckedOnChildren(node: TreeNode, state: Record<string, boolean>, checked: boolean) {
  if (node.children.length === 0) {
    state[node.object.metadata.id] = checked;
  }

  for (const child of node.children) {
    setCheckedOnChildren(child, state, checked);
  }
}
