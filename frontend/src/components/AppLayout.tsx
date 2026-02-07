import { NavLink, Outlet } from 'react-router-dom';
import { Package, Layers, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoProjedata from '@/assets/logo-projedata.png';

const links = [
  { to: '/products', label: 'Produtos', icon: Package },
  { to: '/raw-materials', label: 'Matérias-primas', icon: Layers },
  { to: '/production-plan', label: 'Simulação', icon: BarChart3 },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-primary-800 bg-primary-700 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <img src={logoProjedata} alt="Projedata" className="h-8" />

          <nav className="flex items-center gap-1" aria-label="Navegação principal">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
