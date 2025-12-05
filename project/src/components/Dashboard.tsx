import { useState, useEffect } from 'react';
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
    } catch {
      alert('Ошибка при создании блок-схемы');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту блок-схему?')) return;
    try {
      await api.deleteFlowchart(id);
      setFlowcharts(flowcharts.filter((f) => f.id !== id));
    } catch {
      alert('Ошибка при удалении');
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100 font-sans">
      <header className="flex justify-between items-center p-6 bg-white shadow-md rounded-b-lg">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Мои блок-схемы</h1>
          <p className="text-sm text-gray-500">{user.username}</p>
        </div>
        <button
          onClick={onLogout}
          className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition"
        >
          Выход
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="mb-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
        >
          Создать блок-схему
        </button>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Загрузка...</div>
        ) : flowcharts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <h3 className="text-lg font-medium mb-2">Нет блок-схем</h3>
            <p>Создайте первую блок-схему</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flowcharts.map((flowchart) => (
              <div
                key={flowchart.id}
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{flowchart.title}</h3>
                  {flowchart.description && (
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{flowchart.description}</p>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(flowchart.updated_at)}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => onEditFlowchart(flowchart)}
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                  >
                    Открыть
                  </button>
                  <button
                    onClick={() => handleDelete(flowchart.id)}
                    className="py-2 px-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Создать новую блок-схему</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Название</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                  placeholder="Моя блок-схема"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Описание (опционально)</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="Описание..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                >
                  Создать
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTitle('');
                    setNewDescription('');
                  }}
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
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
