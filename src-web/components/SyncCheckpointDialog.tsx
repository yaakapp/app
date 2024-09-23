import type { SyncObject } from '@yaakapp-internal/sync';
import { Fragment, useMemo, useState } from 'react';
import { useSyncStage } from '../hooks/useSyncStage';
import { resolvedModelName } from '../lib/resolvedModelName';
import type { CheckboxProps } from './core/Checkbox';
import { Checkbox } from './core/Checkbox';

interface TreeNode extends SyncObject {
  children: TreeNode[];
}

export function SyncCheckpointDialog() {
  const stage = useSyncStage();

  const tree: TreeNode | null = useMemo(() => {
    const objects = stage.data?.objects ?? [];
    const root = objects.find((o) => o.object.metadata.model === 'workspace');
    if (root == null) {
      return null;
    }

    const buildNode = (parentObject: SyncObject): TreeNode => {
      const children = objects
        .filter(({ object: { metadata } }) =>
          metadata.folder_id != null
            ? metadata.folder_id === parentObject.metadata.id
            : metadata.workspace_id === parentObject.metadata.id,
        )
        .map((object) => {
          return buildNode(object.object);
        });
      return { ...parentObject, children };
    };

    return buildNode(root.object);
  }, [stage.data]);

  if (tree == null) {
    return null;
  }

  return <SyncCheckpoint tree={tree} />;
}

function SyncCheckpoint({ tree }: { tree: TreeNode }) {
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const toggle = (node: TreeNode) => {
    setAddedIds((currentAddedIds) => {
      const currentChecked = nodeCheckedStatus(node, addedIds);
      const checked = currentChecked !== true;
      const newAddedIds = structuredClone(currentAddedIds);
      setCheckedOnChildren(node, currentAddedIds, checked);
      return newAddedIds;
    });
  };

  return (
    <div className="w-full mb-auto min-w-full max-w-full">
      <TreeNodeChildren node={tree} depth={0} onToggle={toggle} state={addedIds} />
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
  if (node === null || node.children.length === 0) return null;

  const indent = new Array(depth + 1).join(' ');
  return (
    <>
      {node.children.map((childNode) => {
        const checked = nodeCheckedStatus(childNode, state);

        return (
          <Fragment key={childNode.metadata.id}>
            <div className="flex">
              <pre aria-hidden className="whitespace-pre inline">
                {indent}
              </pre>
              <div className="flex gap-3 w-full">
                <Checkbox
                  className="w-full hover:bg-surface-highlight"
                  checked={checked}
                  title={resolvedModelName(JSON.parse(atob(node.data)))}
                  onChange={() => onToggle(childNode)}
                />
              </div>
            </div>
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
    return state[node.metadata.id] ?? false;
  }

  const visitChildren = (n: TreeNode) => {
    if (n.children.length === 0) {
      leavesVisited += 1;
      const checked = state[n.metadata.id] ?? false;
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
    state[node.metadata.id] = checked;
  }

  for (const child of node.children) {
    setCheckedOnChildren(child, state, checked);
  }
}
