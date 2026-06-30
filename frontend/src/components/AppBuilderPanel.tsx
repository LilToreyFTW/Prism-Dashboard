import { Download, Loader2, PackagePlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { generateProject } from '../lib/api';
import type { BuilderLanguage, BuilderRequest } from '../types/api';

const frameworks: Record<BuilderLanguage, string[]> = {
  python: ['Tkinter', 'CustomTkinter', 'PyQt6', 'Dear PyGui', 'Streamlit', 'Flet'],
  cpp: ['Dear ImGui + GLFW + OpenGL', 'Qt6', 'wxWidgets'],
  csharp: ['WinForms', 'WPF', 'MAUI', 'AvaloniaUI'],
  java: ['Swing', 'JavaFX', 'TornadoFX']
};

const templates = ['Blank', 'Dashboard', 'Login System', 'Data Tool', 'Game'];

export default function AppBuilderPanel() {
  const [language, setLanguage] = useState<BuilderLanguage>('python');
  const [request, setRequest] = useState<BuilderRequest>({
    language: 'python',
    framework: 'CustomTkinter',
    template: 'Dashboard',
    app_name: 'PrismGeneratedApp',
    version: '1.0.0',
    theme: 'Dark Prism',
    features: ['gui', 'readme', 'build-scripts'],
    initialize_git: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const commands = useMemo(() => {
    if (language === 'python') return ['python -m venv .venv', 'pip install -r requirements.txt', 'python main.py', 'pyinstaller --onefile --windowed main.py'];
    if (language === 'cpp') return ['cmake -S . -B build -A x64', 'cmake --build build --config Release', 'build\\Release\\App.exe'];
    if (language === 'csharp') return ['dotnet restore', 'dotnet run', 'dotnet publish -c Release -r win-x64 -p:PublishSingleFile=true'];
    return ['mvn clean package', 'gradle run', 'java -jar target/app.jar'];
  }, [language]);

  function setLanguageSafe(next: BuilderLanguage) {
    setLanguage(next);
    setRequest((current) => ({ ...current, language: next, framework: frameworks[next][0] }));
  }

  async function submit() {
    setLoading(true);
    setMessage(null);
    try {
      const blob = await generateProject({ ...request, language });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${request.app_name.replace(/\s+/g, '-')}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage('Project generated and downloaded.');
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Project generation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
      <section className="glass neon-border rounded-3xl p-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Generate Production Project</h2>
            <p className="text-sm text-slate-400">Python, C++, C#, and Java templates with build scripts and README files.</p>
          </div>
          <button onClick={submit} disabled={loading} className="flex items-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 shadow-neon disabled:opacity-70">
            {loading ? <Loader2 className="size-5 animate-spin" /> : <Download className="size-5" />}
            Generate Project
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 md:grid-cols-4">
          {(['python', 'cpp', 'csharp', 'java'] as BuilderLanguage[]).map((item) => (
            <button
              key={item}
              onClick={() => setLanguageSafe(item)}
              className={`rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide transition ${
                language === item ? 'bg-violet-400/20 text-violet-100 shadow-violet' : 'text-slate-400 hover:bg-white/8 hover:text-white'
              }`}
            >
              {item === 'cpp' ? 'C++' : item === 'csharp' ? 'C#' : item}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="App Name" value={request.app_name} onChange={(value) => setRequest((current) => ({ ...current, app_name: value }))} />
          <Field label="Version" value={request.version} onChange={(value) => setRequest((current) => ({ ...current, version: value }))} />
          <Select label="Framework" value={request.framework} options={frameworks[language]} onChange={(value) => setRequest((current) => ({ ...current, framework: value }))} />
          <Select label="Template" value={request.template} options={templates} onChange={(value) => setRequest((current) => ({ ...current, template: value }))} />
          <Field label="Theme" value={request.theme} onChange={(value) => setRequest((current) => ({ ...current, theme: value }))} />
          <label className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <span className="mb-3 block text-sm text-slate-300">Options</span>
            <span className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={request.initialize_git} onChange={(event) => setRequest((current) => ({ ...current, initialize_git: event.target.checked }))} className="size-4 accent-cyan-300" />
              Initialize Git repository
            </span>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm text-slate-300">License Header</span>
          <textarea
            value={request.license_header ?? ''}
            onChange={(event) => setRequest((current) => ({ ...current, license_header: event.target.value }))}
            className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-cyan-300/40 transition focus:ring-2"
            placeholder="Optional company/license header inserted into generated source files."
          />
        </label>

        {message && <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-cyan-100">{message}</div>}
      </section>

      <aside className="glass rounded-3xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <PackagePlus className="size-5 text-cyan-200" />
          <h2 className="text-lg font-bold">Build Commands</h2>
        </div>
        <div className="space-y-3">
          {commands.map((command) => (
            <code key={command} className="block rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-cyan-100">
              {command}
            </code>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-violet-300/20 bg-violet-400/10 p-4 text-sm text-violet-100">
          Preview files include app entrypoints, dependency manifests, build scripts, setup instructions, and template-specific UI code.
        </div>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-cyan-300/40 transition focus:ring-2" />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-cyan-300/40 transition focus:ring-2">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
