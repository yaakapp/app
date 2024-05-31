import { Outlet } from 'react-router-dom';
import { DialogProvider } from './DialogContext';
import { GlobalHooks } from './GlobalHooks';
import { ToastProvider } from './ToastContext';
import classNames from 'classnames';
import { useOsInfo } from '../hooks/useOsInfo';

export function DefaultLayout() {
  const osInfo = useOsInfo();
  return (
    <DialogProvider>
      <ToastProvider>
        <div
          className={classNames(
            'w-full h-full',
            osInfo?.osType === 'linux' && 'border border-background-highlight-secondary',
          )}
        >
          <Outlet />
        </div>
        <GlobalHooks />
      </ToastProvider>
    </DialogProvider>
  );
}
