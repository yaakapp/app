import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="w-full h-full">
      <Outlet />
    </div>
  );
}
