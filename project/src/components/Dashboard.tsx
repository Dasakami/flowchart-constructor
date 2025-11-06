import { useState, useEffect } from 'react';
import { Plus, LogOut, Edit2, Trash2, FileText } from 'lucide-react';
import { api } from '../api';
import { User, Flowchart } from '../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onEditFlowchart: (flowchart: Flowchart | null) => void;
}

export default function Dashboard({ user, onLogout, onEditFlowchart }: DashboardProps) {
  const [flowcharts, setFlowcharts] = useState<Flowchart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    loadFlowcharts();
  }, []);

  const loadFlowcharts = async () => {
    try {
      const data = await api.getFlowcharts();
      setFlowcharts(data);
    } catch (error) {
      console.error('Failed to load flowcharts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;

    try {
      const flowchart = await api.createFlowchart(newTitle, newDescription, {
        nodes: [],
        connections: [],
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      onEditFlowchart(flowchart);
    } catch (error) {
      alert('Ошибка при создании блок-схемы');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту блок-схему?')) return;

    try {
      await api.deleteFlowchart(id);
      setFlowcharts(flowcharts.filter((f) => f.id !== id));
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Мои блок-схемы</h1>
                <p className="text-sm text-gray-500">{user.username}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Выход
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Создать блок-схему
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : flowcharts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет блок-схем</h3>
            <p className="text-gray-500">Создайте свою первую блок-схему</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flowcharts.map((flowchart) => (
              <div
                key={flowchart.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {flowchart.title}
                  </h3>
                  {flowchart.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {flowchart.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 mb-4">
                    {formatDate(flowchart.updated_at)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditFlowchart(flowchart)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Открыть
                    </button>
                    <button
                      onClick={() => handleDelete(flowchart.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Создать новую блок-схему
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Моя блок-схема"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание (опционально)
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="Описание блок-схемы..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Создать
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTitle('');
                    setNewDescription('');
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
