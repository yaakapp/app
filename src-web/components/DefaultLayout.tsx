import classNames from 'classnames';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { useOsInfo } from '../hooks/useOsInfo';
import { DialogProvider, Dialogs } from './DialogContext';
import { GlobalHooks } from './GlobalHooks';
import { ToastProvider, Toasts } from './ToastContext';

export function DefaultLayout() {
  const osInfo = useOsInfo();
  return (
    <DialogProvider>
      <ToastProvider>
        <>
          {/* Must be inside all the providers, so they have access to them */}
          <Toasts />
          <Dialogs />
        </>
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
      </ToastProvider>
    </DialogProvider>
  );
}
