import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../constants/routes.js';
import Icon from '../components/ui/Icon.jsx';

function PharmacistLayout() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-surface dark:bg-background-dark hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary rounded-lg p-2 text-white flex items-center justify-center shadow-md shadow-primary/20">
            <Icon name="health_and_safety" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">RxGuard AI</h1>
            <p className="text-xs text-muted">Pharmacist Portal</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavLink
            to={ROUTES.PHARMACIST.DASHBOARD}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all',
                isActive
                  ? 'bg-surface border border-border shadow-sm text-foreground'
                  : 'text-muted hover:bg-surface/50 hover:text-foreground border border-transparent',
              ].join(' ')
            }
          >
            <Icon name="dashboard" size={20} />
            Dashboard
          </NavLink>
          <NavLink
            to={ROUTES.PHARMACIST.SCAN}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all',
                isActive
                  ? 'bg-surface border border-border shadow-sm text-foreground'
                  : 'text-muted hover:bg-surface/50 hover:text-foreground border border-transparent',
              ].join(' ')
            }
          >
            <Icon name="qr_code_scanner" size={20} />
            Scan
          </NavLink>
          <NavLink
            to={ROUTES.PHARMACIST.AUDIT}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all',
                isActive
                  ? 'bg-surface border border-border shadow-sm text-foreground'
                  : 'text-muted hover:bg-surface/50 hover:text-foreground border border-transparent',
              ].join(' ')
            }
          >
            <Icon name="fact_check" size={20} />
            Audit Log
          </NavLink>
          <NavLink
            to={ROUTES.PHARMACIST.SETTINGS}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all',
                isActive
                  ? 'bg-surface border border-border shadow-sm text-foreground'
                  : 'text-muted hover:bg-surface/50 hover:text-foreground border border-transparent',
              ].join(' ')
            }
          >
            <Icon name="settings" size={20} />
            Settings
          </NavLink>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="bg-surface-muted rounded-xl p-4">
            <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">
              Storage Usage
            </p>
            <div className="w-full bg-surface-muted h-1.5 rounded-full mb-2">
              <div className="bg-primary h-1.5 rounded-full w-3/4" />
            </div>
            <p className="text-xs text-muted">75% of 10GB used</p>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="h-16 border-b border-border bg-surface dark:bg-background-dark flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center flex-1">
            <div className="relative w-full max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted flex items-center justify-center pointer-events-none">
                <Icon name="search" size={18} />
              </span>
              <input
                type="text"
                placeholder="Search prescriptions, patients, or logs..."
                className="w-full pl-10 pr-4 py-2 bg-surface-muted border-none rounded-xl focus:ring-2 focus:ring-primary/50 text-sm text-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-muted hover:bg-surface-muted rounded-lg"
              aria-label="Toggle theme"
            >
              <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={20} />
            </button>
            <button className="p-2 text-muted hover:bg-surface-muted rounded-lg relative">
              <Icon name="notifications" size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full border border-background-light dark:border-background-dark bg-danger" />
            </button>
            <div className="size-8 rounded-full bg-cover relative border-2 border-primary/20 bg-surface-muted" />
            <button
              type="button"
              onClick={logout}
              className="p-2 text-muted hover:text-danger rounded-lg transition-colors flex items-center justify-center"
            >
              <Icon name="logout" size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10 py-8 space-y-8">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-surface dark:bg-background-dark px-6 lg:px-10 py-3 text-xs text-muted flex items-center justify-between shrink-0">
          <span>© {new Date().getFullYear()} RxGuard AI • Pharmacist Portal</span>
          <span className="hidden sm:inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            System Status: Optimal
          </span>
        </footer>
      </div>
    </div>
  );
}

export default PharmacistLayout;
