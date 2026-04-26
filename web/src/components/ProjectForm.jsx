import { useState, useEffect } from 'react';

const STATUSES = [
  { value: 'planned', label: 'Planejado' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'paused', label: 'Pausado' },
  { value: 'completed', label: 'Concluído' },
];

const EMPTY = { name: '', description: '', status: 'planned', repoUrl: '', liveUrl: '', technologies: '' };

export function ProjectForm({ project, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(project ? { ...EMPTY, ...project } : EMPTY);
  }, [project]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  const inputClass =
    'w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#1a1a24] border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {project ? 'Editar projeto' : 'Novo projeto'}
          </h2>
          <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Nome *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Nome do projeto" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Descrição</label>
            <textarea name="description" value={form.description ?? ''} onChange={handleChange} placeholder="O que é esse projeto?" rows={3} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Tecnologias</label>
            <input name="technologies" value={form.technologies ?? ''} onChange={handleChange} placeholder="React, .NET, SQLite..." className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-1">Repositório</label>
              <input name="repoUrl" value={form.repoUrl ?? ''} onChange={handleChange} placeholder="https://github.com/..." className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">URL do projeto</label>
              <input name="liveUrl" value={form.liveUrl ?? ''} onChange={handleChange} placeholder="https://..." className={inputClass} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors">
              {project ? 'Salvar' : 'Criar projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
