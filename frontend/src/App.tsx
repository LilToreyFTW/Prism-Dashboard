import { Activity, Blocks, Box, Code2, KeyRound, LayoutDashboard, LockKeyhole, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import AuthPanel from './components/AuthPanel';
import Dashboard from './components/Dashboard';
import AppBuilderPanel from './components/AppBuilderPanel';
import LicenseKeysPanel from './components/LicenseKeysPanel';

type View = 'dashboard' | 'builder' | 'licenses';

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem('prism-token') !== null);
  const [view, setView] = useState<View>('dashboard');

  const navigation = useMemo(
    () => [
      { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'builder' as const, label: 'App Builder', icon: Code2 },
      { id: 'licenses' as const, label: 'License Keys', icon: KeyRound }
    ],
    []
  );

  if (!authenticated) {
    return <AuthPanel onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <main className="min-h-screen p-4 text-slate-100 lg:p-6 2xl:p-8">
      <div className="mx-auto grid max-w-[2400px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] 2xl:gap-6">
        <aside className="glass neon-border rounded-3xl p-4 lg:min-h-[calc(100vh-3rem)]">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-cyan-400/12 text-cyan-200 shadow-neon">
              <Sparkles className="size-6" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-wide">PrismDashboard</p>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Web Core</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                    active ? 'bg-cyan-400/15 text-cyan-100 shadow-neon' : 'text-slate-300 hover:bg-white/6 hover:text-white'
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-sm text-cyan-100">
              <LockKeyhole className="size-4" />
              KeyAuth session active
            </div>
            <p className="mt-2 text-sm text-slate-400">Backend validates auth and keeps secrets off the browser.</p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-200/70">Prism Command Surface</p>
              <h1 className="mt-1 text-3xl font-bold text-white 2xl:text-5xl">
                {view === 'dashboard' ? '4K Live Operations Dashboard' : view === 'builder' ? 'Full-Stack App Builder' : 'License Key Console'}
              </h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Activity className="size-5 text-emerald-300" />
              Backend connection active
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {view === 'dashboard' && <Dashboard />}
              {view === 'builder' && <AppBuilderPanel />}
              {view === 'licenses' && <LicenseKeysPanel />}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
      <div className="pointer-events-none fixed bottom-6 right-6 hidden gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-slate-400 backdrop-blur-xl lg:flex">
        <Box className="size-4 text-violet-300" />
        R3F viewport
        <Blocks className="ml-2 size-4 text-cyan-300" />
        Dockable panels
      </div>
    </main>
  );
}
