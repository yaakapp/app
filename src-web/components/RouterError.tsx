import React from 'react';
import { useRouteError } from 'react-router-dom';
import { ButtonLink } from './ButtonLink';
import { Heading } from './Heading';
import { VStack } from './Stacks';

export function RouterError() {
  const error = useRouteError();
  const stringified = JSON.stringify(error);
  const message = (error as any).message ?? stringified;
  return (
    <div className="flex items-center justify-center h-full">
      <VStack space={5} className="max-w-[30rem] !h-auto">
        <Heading>Route Error 🔥</Heading>
        <pre className="text-sm select-auto cursor-text bg-gray-100 p-3 rounded whitespace-normal">
          {message}
        </pre>
        <ButtonLink to="/" color="primary">
          Go Home
        </ButtonLink>
      </VStack>
    </div>
  );
}
