import { Eye, EyeOff, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { authenticate } from '../lib/api';
import type { AuthMode } from '../types/api';

type Props = {
  onAuthenticated: () => void;
};

export default function AuthPanel({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await authenticate(mode, {
        username: String(form.get('username') ?? ''),
        password: String(form.get('password') ?? ''),
        license_key: String(form.get('license_key') ?? ''),
        remember
      });
      if (!response.success) {
        throw new Error(response.message);
      }
      if (remember && response.token) {
        localStorage.setItem('prism-token', response.token);
      }
      onAuthenticated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="glass neon-border grid w-full max-w-6xl overflow-hidden rounded-[2rem] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[560px] overflow-hidden bg-slate-950 p-8 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(55,213,255,0.22),transparent_28rem),radial-gradient(circle_at_70%_40%,rgba(168,85,247,0.24),transparent_30rem)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-200 shadow-neon">
                <Sparkles className="size-6" />
              </div>
              <div>
                <p className="text-xl font-bold">PrismDashboard</p>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Secure Web Core</p>
              </div>
            </div>
            <div>
              <p className="mb-4 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
                KeyAuth protected
              </p>
              <h1 className="max-w-xl text-4xl font-black leading-tight text-white lg:text-6xl">
                Command the prism from any display.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                Live 3D telemetry, app generation workflows, and backend validated sessions in one premium responsive control surface.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 lg:p-10">
          <div className="mb-8 flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            {(['login', 'register'] as AuthMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold capitalize transition ${
                  mode === item ? 'bg-cyan-400/15 text-cyan-100 shadow-neon' : 'text-slate-400 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-300">Username</span>
              <input name="username" required className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-cyan-300/40 transition focus:ring-2" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Password</span>
              <div className="mt-2 flex rounded-2xl border border-white/10 bg-black/20 focus-within:ring-2 focus-within:ring-cyan-300/40">
                <input name="password" required type={showPassword ? 'text' : 'password'} className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-4 text-slate-400 hover:text-white">
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </label>
            {mode === 'register' && (
              <label className="block">
                <span className="text-sm text-slate-300">License key</span>
                <input name="license_key" required className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-cyan-300/40 transition focus:ring-2" />
              </label>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-300">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="size-4 accent-cyan-300" />
              Remember me
            </label>
            <span className="text-slate-500">Backend session proxy</span>
          </div>

          {error && <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>}

          <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-4 font-bold text-slate-950 shadow-neon transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? <Loader2 className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
            {loading ? 'Validating' : mode === 'login' ? 'Enter Dashboard' : 'Create Account'}
          </button>
        </form>
      </section>
    </main>
  );
}
