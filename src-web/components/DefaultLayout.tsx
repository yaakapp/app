import { Outlet } from 'react-router-dom';
import { DialogProvider } from './DialogContext';
import { GlobalHooks } from './GlobalHooks';
import { ToastProvider } from './ToastContext';

export function DefaultLayout() {
  return (
    <DialogProvider>
      <ToastProvider>
        <Outlet />
        <GlobalHooks />
      </ToastProvider>
    </DialogProvider>
  );
}
