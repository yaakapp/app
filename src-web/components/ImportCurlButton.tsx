import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useClipboardText } from '../hooks/useClipboardText';
import { useImportCurl } from '../hooks/useImportCurl';
import { Button } from './core/Button';
import { Icon } from './core/Icon';

export function ImportCurlButton() {
  const [clipboardText] = useClipboardText();
  const importCurl = useImportCurl({ clearClipboard: true });
  const [isLoading, setIsLoading] = useState(false);

  if (!clipboardText?.trim().startsWith('curl ')) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Button
        size="xs"
        variant="border"
        color="primary"
        leftSlot={<Icon icon="paste" size="sm" />}
        isLoading={isLoading}
        onClick={() => {
          setIsLoading(true);
          importCurl
            .mutateAsync({
              requestId: null, // Create request
              command: clipboardText,
            })
            .finally(() => setIsLoading(false));
        }}
      >
        Import Curl
      </Button>
    </motion.div>
  );
}
