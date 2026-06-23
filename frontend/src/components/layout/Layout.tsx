import type { ReactNode } from 'react';

import { Header } from '@/components/layout/Header';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <main className="container flex-1 py-8">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Календарь — сервис бронирования времени · Hexlet AI
      </footer>
    </div>
  );
}
