import classNames from 'classnames';
import { Outlet } from 'react-router-dom';
import { useGlobalThings } from '../hooks/useGlobalThings';
import { useOsInfo } from '../hooks/useOsInfo';
import { DialogProvider, Dialogs } from './DialogContext';
import { ToastProvider, Toasts } from './ToastContext';

export function DefaultLayout() {
  const osInfo = useOsInfo();
  useGlobalThings();
  return (
    <DialogProvider>
      <ToastProvider>
        <>
          {/* Must be inside all the providers, so they have access to them */}
          <Toasts />
          <Dialogs />
        </>
        <div
          className={classNames(
            'w-full h-full',
            osInfo?.osType === 'linux' && 'border border-border-subtle',
          )}
        >
          <Outlet />
        </div>
      </ToastProvider>
    </DialogProvider>
  );
}
