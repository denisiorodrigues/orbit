import { useState } from 'react';
import { ProjectCard } from './ProjectCard';

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'planned', label: 'Planejado' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'paused', label: 'Pausado' },
  { value: 'completed', label: 'Concluído' },
];

export function ListView({ projects, onEdit, onDelete }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
              filter === f.value
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/30'
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-60">
              {f.value === 'all' ? projects.length : projects.filter((p) => p.status === f.value).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/30">
          Nenhum projeto encontrado
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
