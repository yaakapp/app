import { VStack } from './core/Stacks';
import { Button } from './core/Button';
import { useState } from 'react';

interface Props {
  importData: () => Promise<void>;
}

export function ImportDataDialog({ importData }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <VStack space={5} className="pb-4">
      <VStack space={1}>
        <p>Supported Formats:</p>
        <ul className="list-disc pl-5">
          <li>Postman Collection v2/v2.1</li>
          <li>Insomnia</li>
          <li>Curl command(s)</li>
        </ul>
      </VStack>
      <Button
        size="sm"
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
