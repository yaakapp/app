import { VStack } from './core/Stacks';
import { Button } from './core/Button';
import React, { useState } from 'react';
import { Banner } from './core/Banner';
import { Icon } from './core/Icon';

interface Props {
  importData: () => Promise<void>;
}

export function ImportDataDialog({ importData }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <VStack space={5} className="pb-4">
      <VStack space={1}>
        <ul className="list-disc pl-5">
          <li>OpenAPI 3.0, 3.1</li>
          <li>Postman Collection v2, v2.1</li>
          <li>Insomnia v4+</li>
          <li>Swagger 2.0</li>
          <li>Curl commands</li>
        </ul>
        <Banner className="mt-3 flex items-center gap-2">
          <Icon icon="magicWand" />
          Paste any Curl command into URL bar
        </Banner>
      </VStack>
      <Button
        color="primary"
        isLoading={isLoading}
        onClick={async () => {
          setIsLoading(true);
          try {
            await importData();
          } finally {
            setIsLoading(false);
          }
        }}
      >
        {isLoading ? 'Importing' : 'Select File'}
      </Button>
    </VStack>
  );
}
