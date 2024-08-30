import React from 'react';
import { useCreatePlugin } from '../../hooks/useCreatePlugin';
import { usePlugins } from '../../hooks/usePlugins';
import { Button } from '../core/Button';
import { InlineCode } from '../core/InlineCode';
import { PlainInput } from '../core/PlainInput';
import { HStack, VStack } from '../core/Stacks';

export function SettingsPlugins() {
  const [pluginName, setPluginName] = React.useState<string>('');
  const plugins = usePlugins();
  const createPlugin = useCreatePlugin();
  return (
    <VStack space={2} className="mb-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPlugin.mutate({ name: pluginName });
        }}
      >
        <HStack alignItems="end" space={1.5}>
          <PlainInput
            name="Plugin"
            label="Search for Plugin"
            placeholder="My Plugin"
            onChange={setPluginName}
            defaultValue={pluginName}
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
