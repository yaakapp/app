import type { SyncDiff } from '@yaakapp-internal/sync';
import type { SyncModel } from '@yaakapp-internal/sync/bindings/SyncModel';
import classNames from 'classnames';
import { Fragment, useMemo, useState } from 'react';
import { useSyncDiff } from '../hooks/useSyncDiff';
import { resolvedModelName } from '../lib/resolvedModelName';
import { Button } from './core/Button';
import type { CheckboxProps } from './core/Checkbox';
import { Checkbox } from './core/Checkbox';
import { Editor } from './core/Editor';
import { InlineCode } from './core/InlineCode';
import { SplitLayout } from './core/SplitLayout';
import { HStack } from './core/Stacks';

interface TreeNode {
  children: TreeNode[];
  model: SyncModel;
  change: SyncDiff['type'];
}

export function SyncCheckpointDialog() {
  const diffs = useSyncDiff();

  const [addedIds, setAddedIds] = useState<Record<string, boolean>>(() => {
    const s: Record<string, boolean> = {};
    // By default, add all files that are already tracked
    for (const o of diffs.data ?? []) {
      if (o.type === 'modified' || o.type === 'removed') {
        s[o.model.id] = true;
      }
    }
    return s;
  });

  const tree: TreeNode | null = useMemo(() => {
    const root = diffs.data?.find((d) => d.model.model === 'workspace');
    if (root == null) {
      return null;
    }

    const buildNode = (parent: SyncDiff): TreeNode => {
      const children = (diffs.data ?? [])
        .filter((d) => {
          if (d.model.model === 'workspace') {
            return false;
          }

          if ('folderId' in d.model && d.model.folderId != null) {
            return d.model.folderId === parent.model.id;
          }

          return d.model.workspaceId === parent.model.id;
        })
        .map((object) => {
          return buildNode(object);
        });
      return { ...parent, change: parent.type, children };
    };

    return buildNode(root);
  }, [diffs]);

  const checkNode = (node: TreeNode, checked: boolean) => {
    setAddedIds((currentAddedIds) => {
      const newAddedIds = structuredClone(currentAddedIds);
      setCheckedOnChildren(node, newAddedIds, checked);
      return newAddedIds;
    });
  };

  if (tree == null) {
    return null;
  }

  return (
    <div className="grid grid-rows-1 h-full">
      <SplitLayout
        name="commit"
        layout="vertical"
        defaultRatio={0.3}
        firstSlot={({ style }) => (
          <div style={style} className="h-full overflow-y-auto -ml-1">
            <TreeNodeChildren node={tree} depth={0} onCheck={checkNode} state={addedIds} />
          </div>
        )}
        secondSlot={({ style }) => (
          <div style={style} className="grid grid-rows-[minmax(0,1fr)_auto] gap-3 pb-2">
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
  onCheck,
}: {
  node: TreeNode | null;
  depth: number;
  state: Record<string, boolean>;
  onCheck: (node: TreeNode, checked: boolean) => void;
}) {
  if (node === null) return null;

  const checked = nodeCheckedStatus(node, state);
  return (
    <div
      className={classNames(
        depth > 0 && 'pl-1 ml-[10px] border-l border-dashed border-border-subtle',
      )}
    >
      <div className="flex gap-3 w-full h-xs">
        <Checkbox
          className="w-full hover:bg-surface-highlight rounded px-1 group"
          checked={checked}
          title={
            <div className="flex items-center gap-1 w-full">
              <div>{resolvedModelName(node.model)}</div>
              <InlineCode
                className={classNames(
                  'py-0 ml-auto !bg-surface',
                  node.change === 'added' && 'text-success',
                  node.change === 'modified' && 'text-info',
                  node.change === 'removed' && 'text-danger',
                )}
              >
                {node.change}
              </InlineCode>
            </div>
          }
          onChange={(checked) => onCheck(node, checked)}
        />
      </div>

      {node.children.map((childNode) => {
        return (
          <Fragment key={childNode.model.id}>
            <TreeNodeChildren node={childNode} depth={depth + 1} onCheck={onCheck} state={state} />
          </Fragment>
        );
      })}
    </div>
  );
}

function nodeCheckedStatus(
  node: TreeNode,
  state: Record<string, boolean>,
): CheckboxProps['checked'] {
  let leavesVisited = 0;
  let leavesChecked = 0;

  if (node.children.length === 0) {
    return state[node.model.id] ?? false;
  }

  const visitChildren = (n: TreeNode) => {
    if (n.children.length === 0) {
      leavesVisited += 1;
      const checked = state[n.model.id] ?? false;
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

function setCheckedOnChildren(node: TreeNode, addedIds: Record<string, boolean>, checked: boolean) {
  if (node.children.length === 0) {
    addedIds[node.model.id] = checked;
  }

  for (const child of node.children) {
    setCheckedOnChildren(child, addedIds, checked);
  }
}
