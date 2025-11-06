import { MousePointer2, Circle, Square, Play, StopCircle, GitBranch } from 'lucide-react';

interface ToolbarProps {
  selectedTool: string;
  onSelectTool: (tool: string) => void;
}

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Выбрать', color: 'blue' },
  { id: 'start', icon: Play, label: 'Начало', color: 'green' },
  { id: 'end', icon: StopCircle, label: 'Конец', color: 'red' },
  { id: 'process', icon: Square, label: 'Процесс', color: 'blue' },
  { id: 'input', icon: Circle, label: 'Ввод/Вывод', color: 'yellow' },
  { id: 'decision', icon: GitBranch, label: 'Условие', color: 'orange' },
];

export default function Toolbar({ selectedTool, onSelectTool }: ToolbarProps) {
  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isSelected = selectedTool === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
              isSelected
                ? 'bg-blue-50 text-blue-600 border-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-100 border-2 border-transparent'
            }`}
            title={tool.label}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{tool.label}</span>
          </button>
        );
      })}

      <div className="mt-4 pt-4 border-t border-gray-200 w-full px-2">
        <div className="text-xs text-gray-500 text-center space-y-2">
          <p>Выберите элемент и кликните на холст</p>
          <p className="text-gray-400">Shift+клик для соединения</p>
        </div>
      </div>
    </div>
  );
}
