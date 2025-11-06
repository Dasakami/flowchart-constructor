import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Download, Settings } from 'lucide-react';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import ExportModal from './ExportModal';
import { api } from '../api';
import { User, Flowchart, FlowchartNode, Connection } from '../types';

interface FlowchartEditorProps {
  flowchart: Flowchart;
  onBack: () => void;
  onLogout: () => void;
  user: User;
}

export default function FlowchartEditor({
  flowchart,
  onBack,
  onLogout,
  user,
}: FlowchartEditorProps) {
  const [nodes, setNodes] = useState<FlowchartNode[]>(flowchart.data.nodes || []);
  const [connections, setConnections] = useState<Connection[]>(flowchart.data.connections || []);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [title, setTitle] = useState(flowchart.title);
  const [description, setDescription] = useState(flowchart.description || '');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date(flowchart.updated_at));

  useEffect(() => {
    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [nodes, connections, title, description]);

  const handleAutoSave = async () => {
    if (nodes.length === 0 && connections.length === 0) return;
    await handleSave(true);
  };

  const handleSave = async (auto = false) => {
    setSaving(true);
    try {
      await api.updateFlowchart(flowchart.id, title, description, {
        nodes,
        connections,
      });
      setLastSaved(new Date());
      if (!auto) {
        alert('Блок-схема сохранена');
      }
    } catch (error) {
      if (!auto) {
        alert('Ошибка при сохранении');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSave = () => {
    setShowSettings(false);
    handleSave();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Вернуться к списку"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-500">
                {saving ? 'Сохранение...' : `Сохранено ${lastSaved.toLocaleTimeString('ru-RU')}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <Settings className="w-5 h-5" />
              Настройки
            </button>
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              Сохранить
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              <Download className="w-5 h-5" />
              Экспорт
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Toolbar selectedTool={selectedTool} onSelectTool={setSelectedTool} />
        <Canvas
          nodes={nodes}
          connections={connections}
          selectedTool={selectedTool}
          onNodesChange={setNodes}
          onConnectionsChange={setConnections}
        />
      </div>

      {showExportModal && (
        <ExportModal
          nodes={nodes}
          connections={connections}
          title={title}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Настройки блок-схемы</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSettingsSave}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
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
