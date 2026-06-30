import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import GridLayout from 'react-grid-layout';
import { Cpu, RadioTower, Server, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import PrismScene from './PrismScene';

const fallbackNodes = Array.from({ length: 18 }, (_, index) => ({
  id: `node-${index}`,
  label: `Node ${index + 1}`,
  value: 45 + ((index * 11) % 50),
  x: Math.sin(index) * 2.7,
  y: Math.cos(index * 1.4) * 1.5,
  z: Math.cos(index) * 2.2
}));

const chartData = Array.from({ length: 18 }, (_, index) => ({
  name: `${index}`,
  cpu: 34 + ((index * 7) % 45),
  memory: 42 + ((index * 9) % 38)
}));

export default function Dashboard() {
  const { data, connected, error } = useDashboardSocket();
  const metrics = data?.metrics ?? { cpu: 45, memory: 67, active_users: 1243, prism_score: 98.7 };
  const nodes = data?.prism_3d_data.nodes ?? fallbackNodes;

  return (
    <GridLayout className="layout" cols={12} rowHeight={96} width={1600} isDraggable isResizable compactType="vertical">
      <section key="scene" data-grid={{ x: 0, y: 0, w: 8, h: 6 }} className="glass neon-border overflow-hidden rounded-3xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-xl font-bold text-white">Prism 3D Viewport</h2>
              <p className="text-sm text-slate-400">Live node topology and metric intensity</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs ${connected ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-200'}`}>
              {connected ? 'Live' : 'Reconnecting'}
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <PrismScene nodes={nodes} />
          </div>
        </div>
      </section>

      <section key="metrics" data-grid={{ x: 8, y: 0, w: 4, h: 3 }} className="glass rounded-3xl p-5">
        <h2 className="mb-4 text-lg font-bold">System Metrics</h2>
        <div className="grid grid-cols-2 gap-3">
          <Metric icon={Cpu} label="CPU" value={`${metrics.cpu}%`} />
          <Metric icon={Server} label="Memory" value={`${metrics.memory}%`} />
          <Metric icon={Users} label="Users" value={metrics.active_users.toLocaleString()} />
          <Metric icon={RadioTower} label="Prism" value={metrics.prism_score.toFixed(1)} />
        </div>
      </section>

      <section key="chart" data-grid={{ x: 8, y: 3, w: 4, h: 3 }} className="glass rounded-3xl p-5">
        <h2 className="text-lg font-bold">Realtime Load</h2>
        <div className="h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#37d5ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#37d5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }} />
              <Area dataKey="cpu" stroke="#37d5ff" fill="url(#cpu)" />
              <Area dataKey="memory" stroke="#a855f7" fill="#a855f733" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section key="events" data-grid={{ x: 0, y: 6, w: 12, h: 2 }} className="glass rounded-3xl p-5">
        <h2 className="text-lg font-bold">Backend Events</h2>
        <p className="mt-2 text-sm text-slate-400">{error ?? `Last packet: ${data ? new Date(data.timestamp * 1000).toLocaleTimeString() : 'warming up'}`}</p>
      </section>
    </GridLayout>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <Icon className="mb-3 size-5 text-cyan-200" />
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
