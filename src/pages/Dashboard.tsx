import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Folder, Calendar, Trash2 } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import type { Project } from "../types";

export function Dashboard() {
  const navigate = useNavigate();
  const { projects, isLoading, createProject, deleteProject, isDeleting } =
    useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.project_id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Projets</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez vos projets avec les agents IA
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Nouveau Projet
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun projet
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre premier projet pour commencer
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Créer un projet
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                onClick={() => handleProjectClick(project)}
                onDelete={() => {
                  if (
                    window.confirm(`Supprimer le projet "${project.name}" ?`)
                  ) {
                    deleteProject(project.project_id);
                  }
                }}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Créer Projet */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createProject}
        />
      )}
    </div>
  );
}

// Composant ProjectCard
interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function ProjectCard({
  project,
  onClick,
  onDelete,
  isDeleting,
}: ProjectCardProps) {
  return (
    <Card hover className="relative group">
      <div onClick={onClick} className="cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Folder className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-500">{project.project_id}</p>
            </div>
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(project.created_at).toLocaleDateString("fr-FR")}
        </div>
      </div>

      {/* Bouton supprimer (visible au hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={isDeleting}
        className="
          absolute top-4 right-4 p-2 bg-red-50 text-red-600 rounded-lg
          opacity-0 group-hover:opacity-100 transition-opacity
          hover:bg-red-100 disabled:opacity-50
        "
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </Card>
  );
}

// Modal Créer Projet
interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (data: any) => void;
}

function CreateProjectModal({ onClose, onCreate }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    project_id: "",
    name: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Nouveau Projet</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID du projet
            </label>
            <input
              type="text"
              required
              pattern="[a-z0-9_-]+"
              value={formData.project_id}
              onChange={(e) =>
                setFormData({ ...formData, project_id: e.target.value })
              }
              placeholder="mon_projet"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minuscules, chiffres, tirets et underscores uniquement
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du projet
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Mon Super Projet"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnel)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Description du projet..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
