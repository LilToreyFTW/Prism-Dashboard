import { Copy, KeyRound, Loader2, Shield } from 'lucide-react';
import { useState } from 'react';
import { generateLicenseKeys } from '../lib/api';
import type { LicenseDuration, LicenseKeyRecord } from '../types/api';

const durations: Array<{ value: LicenseDuration; label: string; helper: string }> = [
  { value: '1_month', label: '1 Month', helper: '30-day access' },
  { value: '6_month', label: '6 Months', helper: '182-day access' },
  { value: '12_month', label: '12 Months', helper: '365-day access' },
  { value: 'lifetime', label: 'Lifetime', helper: 'No expiry' }
];

export default function LicenseKeysPanel() {
  const [duration, setDuration] = useState<LicenseDuration>('1_month');
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [keys, setKeys] = useState<LicenseKeyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setMessage(null);
    try {
      const generated = await generateLicenseKeys({ duration, count, note: note || undefined, adminToken: adminToken || undefined });
      setKeys(generated);
      setMessage(`${generated.length} key${generated.length === 1 ? '' : 's'} generated.`);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'License generation failed.');
    } finally {
      setLoading(false);
    }
  }

  async function copyKeys() {
    await navigator.clipboard.writeText(keys.map((item) => item.key).join('\n'));
    setMessage('Copied keys to clipboard.');
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_440px]">
      <section className="glass neon-border rounded-3xl p-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">8-Character License Keys</h2>
            <p className="text-sm text-slate-400">Server-side key generation for monthly, yearly, and lifetime access.</p>
          </div>
          <button onClick={submit} disabled={loading} className="flex items-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 shadow-neon disabled:opacity-70">
            {loading ? <Loader2 className="size-5 animate-spin" /> : <KeyRound className="size-5" />}
            Generate Keys
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {durations.map((item) => (
            <button
              key={item.value}
              onClick={() => setDuration(item.value)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                duration === item.value ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-50 shadow-neon' : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              <span className="block font-bold">{item.label}</span>
              <span className="mt-1 block text-xs text-slate-400">{item.helper}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-sm text-slate-300">Count</span>
            <input type="number" min={1} max={100} value={count} onChange={(event) => setCount(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-cyan-300/40 transition focus:ring-2" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm text-slate-300">Batch note</span>
            <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional internal note" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-cyan-300/40 transition focus:ring-2" />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="flex items-center gap-2 text-sm text-slate-300"><Shield className="size-4 text-violet-200" /> Admin token</span>
          <input value={adminToken} onChange={(event) => setAdminToken(event.target.value)} type="password" placeholder="Required when PRISM_LICENSE_ADMIN_TOKEN is set" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-cyan-300/40 transition focus:ring-2" />
        </label>

        {message && <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-cyan-100">{message}</div>}
      </section>

      <aside className="glass rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Generated Batch</h2>
          <button onClick={copyKeys} disabled={keys.length === 0} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 disabled:opacity-40">
            <Copy className="size-4" /> Copy
          </button>
        </div>
        <div className="space-y-3">
          {keys.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">No keys generated yet.</div>
          ) : (
            keys.map((item) => (
              <div key={item.key} className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
                <code className="text-xl font-black tracking-[0.24em] text-cyan-100">{item.key}</code>
                <p className="mt-2 text-xs text-slate-400">{formatDuration(item.duration)} · {item.expires_at ? `expires ${new Date(item.expires_at).toLocaleDateString()}` : 'never expires'}</p>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

function formatDuration(duration: LicenseDuration) {
  if (duration === '1_month') return '1 month';
  if (duration === '6_month') return '6 months';
  if (duration === '12_month') return '12 months';
  return 'lifetime';
}
