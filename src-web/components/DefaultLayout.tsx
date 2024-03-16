import { Outlet } from 'react-router-dom';
import { DialogProvider } from './DialogContext';
import { GlobalHooks } from './GlobalHooks';

export function DefaultLayout() {
  return (
    <DialogProvider>
      <Outlet />
      <GlobalHooks />
    </DialogProvider>
  );
}
