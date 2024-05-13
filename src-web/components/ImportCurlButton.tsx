import React, { useState } from 'react';
import { Button } from './core/Button';
import { useClipboardText } from '../hooks/useClipboardText';
import { useImportCurl } from '../hooks/useImportCurl';
import { Icon } from './core/Icon';
import { motion } from 'framer-motion';

export function ImportCurlButton() {
  const [clipboardText] = useClipboardText();
  const [lastImportedCmd, setLastImportedCmd] = useState<string>('');
  const importCurl = useImportCurl();

  if (!clipboardText?.trim().startsWith('curl ') || lastImportedCmd === clipboardText) {
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
        color="secondary"
        leftSlot={<Icon icon="paste" size="sm" />}
        onClick={() => {
          importCurl.mutate({
            requestId: null, // Create request
            command: clipboardText,
          });
          // setClipboardText('');
          setLastImportedCmd(clipboardText);
        }}
      >
        Import Curl
      </Button>
    </motion.div>
  );
}
