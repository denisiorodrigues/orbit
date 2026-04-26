const STATUS_STYLES = {
  planned: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  paused: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const STATUS_LABELS = {
  planned: 'Planejado',
  in_progress: 'Em andamento',
  paused: 'Pausado',
  completed: 'Concluído',
};

export function ProjectCard({ project, onEdit, onDelete, compact = false }) {
  const techs = project.technologies ? project.technologies.split(',').map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="group rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition-all p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-white text-sm leading-snug">{project.name}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(project)} className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors text-xs">
            ✏️
          </button>
          <button onClick={() => onDelete(project)} className="p-1 rounded text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors text-xs">
            🗑️
          </button>
        </div>
      </div>

      {!compact && project.description && (
        <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{project.description}</p>
      )}

      {!compact && techs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {techs.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[project.status]}`}>
          {STATUS_LABELS[project.status]}
        </span>
        <div className="flex gap-2">
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-white/30 hover:text-white/70 transition-colors">
              repo ↗
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-white/30 hover:text-white/70 transition-colors">
              live ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
