import { ProjectCard } from './ProjectCard';

const COLUMNS = [
  { status: 'planned', label: 'Planejado', color: 'bg-slate-500' },
  { status: 'in_progress', label: 'Em andamento', color: 'bg-blue-500' },
  { status: 'paused', label: 'Pausado', color: 'bg-amber-500' },
  { status: 'completed', label: 'Concluído', color: 'bg-emerald-500' },
];

export function KanbanView({ projects, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const items = projects.filter((p) => p.status === col.status);
        return (
          <div key={col.status} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span className={`w-2 h-2 rounded-full ${col.color}`} />
              <span className="text-sm font-medium text-white/70">{col.label}</span>
              <span className="ml-auto text-xs text-white/30">{items.length}</span>
            </div>
            <div className="flex flex-col gap-2 min-h-[100px]">
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-white/20">
                  Nenhum projeto
                </div>
              ) : (
                items.map((p) => (
                  <ProjectCard key={p.id} project={p} onEdit={onEdit} onDelete={onDelete} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
