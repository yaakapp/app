import { useEffect, useState } from 'react';

/**
 * Like useState, except it will update the value when the default value changes
 */
export function useStateSyncDefault<T>(defaultValue: T) {
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);
  return [value, setValue] as const;
}
