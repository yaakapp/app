import classnames from 'classnames';
import { HStack, VStack } from './Stacks';

export function Colors() {
  return (
    <HStack>
      <VStack>
        <Color className="bg-gray-50" />
        <Color className="bg-gray-100" />
        <Color className="bg-gray-200" />
        <Color className="bg-gray-300" />
        <Color className="bg-gray-400" />
        <Color className="bg-gray-500" />
        <Color className="bg-gray-600" />
        <Color className="bg-gray-700" />
        <Color className="bg-gray-800" />
        <Color className="bg-gray-900" />
        <Color className="bg-gray-950" />
      </VStack>
      <VStack>
        <Color className="bg-red-50" />
        <Color className="bg-red-100" />
        <Color className="bg-red-200" />
        <Color className="bg-red-300" />
        <Color className="bg-red-400" />
        <Color className="bg-red-500" />
        <Color className="bg-red-600" />
        <Color className="bg-red-700" />
        <Color className="bg-red-800" />
        <Color className="bg-red-900" />
        <Color className="bg-red-950" />
      </VStack>
      <VStack>
        <Color className="bg-orange-50" />
        <Color className="bg-orange-100" />
        <Color className="bg-orange-200" />
        <Color className="bg-orange-300" />
        <Color className="bg-orange-400" />
        <Color className="bg-orange-500" />
        <Color className="bg-orange-600" />
        <Color className="bg-orange-700" />
        <Color className="bg-orange-800" />
        <Color className="bg-orange-900" />
        <Color className="bg-orange-950" />
      </VStack>
      <VStack>
        <Color className="bg-yellow-50" />
        <Color className="bg-yellow-100" />
        <Color className="bg-yellow-200" />
        <Color className="bg-yellow-300" />
        <Color className="bg-yellow-400" />
        <Color className="bg-yellow-500" />
        <Color className="bg-yellow-600" />
        <Color className="bg-yellow-700" />
        <Color className="bg-yellow-800" />
        <Color className="bg-yellow-900" />
        <Color className="bg-yellow-950" />
      </VStack>
      <VStack>
        <Color className="bg-green-50" />
        <Color className="bg-green-100" />
        <Color className="bg-green-200" />
        <Color className="bg-green-300" />
        <Color className="bg-green-400" />
        <Color className="bg-green-500" />
        <Color className="bg-green-600" />
        <Color className="bg-green-700" />
        <Color className="bg-green-800" />
        <Color className="bg-green-900" />
        <Color className="bg-green-950" />
      </VStack>
      <VStack>
        <Color className="bg-blue-50" />
        <Color className="bg-blue-100" />
        <Color className="bg-blue-200" />
        <Color className="bg-blue-300" />
        <Color className="bg-blue-400" />
        <Color className="bg-blue-500" />
        <Color className="bg-blue-600" />
        <Color className="bg-blue-700" />
        <Color className="bg-blue-800" />
        <Color className="bg-blue-900" />
        <Color className="bg-blue-950" />
      </VStack>
      <VStack>
        <Color className="bg-violet-50" />
        <Color className="bg-violet-100" />
        <Color className="bg-violet-200" />
        <Color className="bg-violet-300" />
        <Color className="bg-violet-400" />
        <Color className="bg-violet-500" />
        <Color className="bg-violet-600" />
        <Color className="bg-violet-700" />
        <Color className="bg-violet-800" />
        <Color className="bg-violet-900" />
        <Color className="bg-violet-950" />
      </VStack>
    </HStack>
  );
}

function Color({ className }: { className: string }) {
  return <div className={classnames(className, 'w-full h-5')} />;
}
