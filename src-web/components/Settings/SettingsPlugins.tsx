import React from 'react';
import { useCreatePlugin } from '../../hooks/useCreatePlugin';
import { usePlugins } from '../../hooks/usePlugins';
import { Button } from '../core/Button';
import { InlineCode } from '../core/InlineCode';
import { HStack, VStack } from '../core/Stacks';
import { SelectFile } from '../SelectFile';

export function SettingsPlugins() {
  const [pluginFilePath, setPluginFilePath] = React.useState<string | null>(null);
  const plugins = usePlugins();
  const createPlugin = useCreatePlugin();
  return (
    <VStack space={2} className="mb-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPlugin.mutate({ uri: `file://${pluginFilePath}` });
        }}
      >
        <HStack alignItems="end" space={1.5}>
          <SelectFile
            onChange={({ filePath }) => setPluginFilePath(filePath)}
            filePath={pluginFilePath}
          />
          <Button variant="border">Search</Button>
        </HStack>
      </form>
      <ul>
        {plugins.map((p) => (
          <li key={p.id}>
            <InlineCode>{p.id}</InlineCode> {p.name}
          </li>
        ))}
      </ul>
    </VStack>
  );
}
