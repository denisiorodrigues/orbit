import { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { ProjectForm } from './components/ProjectForm';
import { KanbanView } from './components/KanbanView';
import { ListView } from './components/ListView';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('kanban');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadProjects = useCallback(async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      setError(null);
    } catch {
      setError('Não foi possível conectar à API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  async function handleSave(form) {
    try {
      if (editing) {
        await api.updateProject(editing.id, form);
      } else {
        await api.createProject(form);
      }
      setFormOpen(false);
      setEditing(null);
      loadProjects();
    } catch {
      alert('Erro ao salvar projeto.');
    }
  }

  async function handleDelete(project) {
    try {
      await api.deleteProject(project.id);
      setDeleteConfirm(null);
      loadProjects();
    } catch {
      alert('Erro ao excluir projeto.');
    }
  }

  function openEdit(project) {
    setEditing(project);
    setFormOpen(true);
  }

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white tracking-tight">orbit</span>
          <span className="text-xs text-white/30">/ projetos pessoais</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-xs transition-colors ${view === 'kanban' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs transition-colors ${view === 'list' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white'}`}
            >
              Lista
            </button>
          </div>
          <button
            onClick={openNew}
            className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-1.5 text-sm font-medium text-white transition-colors"
          >
            + Novo projeto
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        {loading && (
          <div className="flex items-center justify-center h-40 text-white/30 text-sm">
            Carregando...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {!loading && !error && view === 'kanban' && (
          <KanbanView projects={projects} onEdit={openEdit} onDelete={setDeleteConfirm} />
        )}

        {!loading && !error && view === 'list' && (
          <ListView projects={projects} onEdit={openEdit} onDelete={setDeleteConfirm} />
        )}
      </main>

      {formOpen && (
        <ProjectForm project={editing} onSave={handleSave} onCancel={closeForm} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#1a1a24] border border-white/10 p-6 flex flex-col gap-4">
            <h3 className="text-white font-semibold">Excluir projeto?</h3>
            <p className="text-sm text-white/50">
              Tem certeza que deseja excluir <span className="text-white">{deleteConfirm.name}</span>? Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
