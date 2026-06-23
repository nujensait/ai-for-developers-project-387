import { CalendarDays } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

const links = [
  { to: '/', label: 'Запись', end: true },
  { to: '/admin', label: 'Админка', end: false },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <CalendarDays className="h-6 w-6 text-primary" />
          <span className="text-lg">Календарь</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
