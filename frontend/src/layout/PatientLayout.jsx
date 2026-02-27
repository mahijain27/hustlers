import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../constants/routes.js';
import Icon from '../components/ui/Icon.jsx';

function PatientLayout() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-10 py-4">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
              <Icon name="pill" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              RxGuard AI
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to={ROUTES.PATIENT.DASHBOARD}
              className={({ isActive }) =>
                [
                  'text-sm transition-all px-3 py-1.5 rounded-lg',
                  isActive
                    ? 'text-foreground font-bold bg-surface border border-border shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-surface-muted/50 font-semibold border border-transparent',
                ].join(' ')
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to={ROUTES.PATIENT.SCHEDULE}
              className={({ isActive }) =>
                [
                  'text-sm transition-all px-3 py-1.5 rounded-lg',
                  isActive
                    ? 'text-foreground font-bold bg-surface border border-border shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-surface-muted/50 font-semibold border border-transparent',
                ].join(' ')
              }
            >
              Medications
            </NavLink>
            <NavLink
              to={ROUTES.PATIENT.PRESCRIPTIONS}
              className={({ isActive }) =>
                [
                  'text-sm transition-all px-3 py-1.5 rounded-lg',
                  isActive
                    ? 'text-foreground font-bold bg-surface border border-border shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-surface-muted/50 font-semibold border border-transparent',
                ].join(' ')
              }
            >
              History
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-muted"
              aria-label="Toggle theme"
            >
              <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={20} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-muted">
              <Icon name="notifications" size={20} />
            </button>
            <div className="h-10 w-10 rounded-full border-2 border-primary bg-cover bg-center" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10 py-8 space-y-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-4 px-6 lg:px-10 text-xs text-muted flex items-center justify-between shrink-0">
        <span>© {new Date().getFullYear()} RxGuard AI • Patient Portal</span>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1 text-xs font-semibold hover:text-primary"
        >
          <Icon name="logout" size={16} />
          Sign out
        </button>
      </footer>
    </div>
  );
}

export default PatientLayout;

