import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../constants/routes.js';
import Icon from '../components/ui/Icon.jsx';

function DoctorLayout() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-surface dark:bg-background-dark border-r border-border">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-white shadow-md shadow-primary/20">
            <Icon name="prescriptions" size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-primary">RxGuard AI</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavLink
            to={ROUTES.DOCTOR.DASHBOARD}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'bg-surface border border-border shadow-sm text-foreground font-bold'
                  : 'text-muted hover:bg-surface/50 font-semibold hover:text-foreground border border-transparent',
              ].join(' ')
            }
          >
            <Icon name="dashboard" size={18} />
            <p>Dashboard</p>
          </NavLink>
          <NavLink
            to={ROUTES.DOCTOR.PATIENTS}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'bg-surface border border-border shadow-sm text-foreground font-bold'
                  : 'text-muted hover:bg-surface/50 font-semibold hover:text-foreground border border-transparent',
              ].join(' ')
            }
          >
            <Icon name="group" size={18} />
            <p>Patients</p>
          </NavLink>
          <NavLink
            to={ROUTES.DOCTOR.CHECKER}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'bg-surface border border-border shadow-sm text-foreground font-bold'
                  : 'text-muted hover:bg-surface/50 font-semibold hover:text-foreground border border-transparent',
              ].join(' ')
            }
          >
            <Icon name="pill" size={18} />
            <p>Interaction Checker</p>
          </NavLink>
          <NavLink
            to={ROUTES.DOCTOR.SETTINGS}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'bg-surface border border-border shadow-sm text-foreground font-bold'
                  : 'text-muted hover:bg-surface/50 font-semibold hover:text-foreground border border-transparent',
              ].join(' ')
            }
          >
            <Icon name="settings" size={18} />
            <p>Settings</p>
          </NavLink>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="bg-surface-muted p-4 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Icon name="notifications_active" size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Review Required</span>
            </div>
            <p className="text-xs text-muted leading-relaxed mb-3">
              3 Pharmacist alerts need your immediate clinical review.
            </p>
            <button className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg hover:opacity-90 transition-opacity">
              View Alerts
            </button>
          </div>
        </div>
        <div className="p-4 flex items-center gap-3 border-t border-border">
          <div className="size-10 rounded-full bg-surface-muted overflow-hidden border-2 border-primary/20 flex items-center justify-center">
            <Icon name="person" size={24} className="text-muted" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold">Dr. Smith</h1>
            <p className="text-xs text-muted">Clinical Director</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-muted hover:text-danger ml-auto p-1 cursor-pointer transition-colors"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 lg:px-10 bg-surface dark:bg-background-dark border-b border-border shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center justify-center">
                <Icon name="search" size={18} />
              </span>
              <input
                type="text"
                placeholder="Search patients, drugs, or clinical notes..."
                className="w-full bg-surface-muted border-none rounded-xl pl-10 text-sm text-foreground focus:ring-2 focus:ring-primary/50"
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
            <button className="relative p-2 text-muted hover:bg-surface-muted rounded-lg flex items-center justify-center">
              <Icon name="notifications" size={20} />
              <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-white dark:border-background-dark" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10 py-8 space-y-8">
            <Outlet />
          </div>
        </div>

        <footer className="border-t border-border bg-surface dark:bg-background-dark px-6 lg:px-10 py-3 text-xs text-muted flex items-center justify-between shrink-0">
          <span>© {new Date().getFullYear()} RxGuard AI • Doctor Portal</span>
          <span className="hidden sm:inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            Clinical Engine: Online
          </span>
        </footer>
      </main>
    </div>
  );
}

export default DoctorLayout;

