import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
import { Heading } from './Heading';
import { VStack } from './Stacks';

export function RouterError() {
  const error = useRouteError();
  console.log('Router Error', error);
  return (
    <div className="flex items-center justify-center h-full">
      <VStack space={5} className="w-auto h-auto">
        <Heading>Route Error 🔥</Heading>
        <pre className="text-sm select-auto cursor-text bg-gray-50 p-3 rounded">
          {JSON.stringify(error, null, 2)}
        </pre>
        <ButtonLink to="/" color="primary">
          Go Home
        </ButtonLink>
      </VStack>
    </div>
  );
}
