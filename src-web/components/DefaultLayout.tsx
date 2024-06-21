import { Outlet } from 'react-router-dom';
import { DialogProvider } from './DialogContext';
import { GlobalHooks } from './GlobalHooks';
import { ToastProvider } from './ToastContext';
import classNames from 'classnames';
import { useOsInfo } from '../hooks/useOsInfo';
import { motion } from 'framer-motion';

export function DefaultLayout() {
  const osInfo = useOsInfo();
  return (
    // On outside so that dialogs/etc can use toasts
    <ToastProvider>
      <DialogProvider>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, delay: 0.1 }}
          className={classNames(
            'w-full h-full',
            osInfo?.osType === 'linux' && 'border border-background-highlight-secondary',
          )}
        >
          <Outlet />
        </motion.div>
        <GlobalHooks />
      </DialogProvider>
    </ToastProvider>
  );
}
