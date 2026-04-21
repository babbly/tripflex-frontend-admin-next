import { ReactNode } from 'react';
import { Sidebar } from '../components/partials/sidebar/Sidebar';
import Topbar from './Topbar';

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full min-w-0">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
