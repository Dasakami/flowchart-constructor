import { useState, useRef, useEffect } from 'react';
import { FlowchartNode, Connection } from '../types';
import { Trash2, Edit3 } from 'lucide-react';

interface CanvasProps {
  nodes: FlowchartNode[];
  connections: Connection[];
  selectedTool: string;
  onNodesChange: (nodes: FlowchartNode[]) => void;
  onConnectionsChange: (connections: Connection[]) => void;
}

export default function Canvas({
  nodes,
  connections,
  selectedTool,
  onNodesChange,
  onConnectionsChange,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (selectedTool === 'select' || draggingNode || isPanning) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - pan.x) / scale;
    const y = (e.clientY - rect.top - pan.y) / scale;

    if (e.shiftKey && selectedNode) {
      setConnectingFrom(selectedNode);
      return;
    }

    const newNode: FlowchartNode = {
      id: Date.now().toString(),
      type: selectedTool as any,
      x,
      y,
      label: getDefaultLabel(selectedTool),
    };

    onNodesChange([...nodes, newNode]);
  };

  const getDefaultLabel = (type: string) => {
    const labels: Record<string, string> = {
      start: 'Начало',
      end: 'Конец',
      process: 'Процесс',
      input: 'Ввод/Вывод',
      decision: 'Условие?',
    };
    return labels[type] || 'Блок';
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();

    if (e.shiftKey && selectedNode && selectedNode !== nodeId) {
      const newConnection: Connection = {
        id: Date.now().toString(),
        from: selectedNode,
        to: nodeId,
      };
      onConnectionsChange([...connections, newConnection]);
      setSelectedNode(nodeId);
      return;
    }

    setSelectedNode(nodeId);
    setDraggingNode(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = (e.clientX - rect.left - pan.x) / scale;
        const mouseY = (e.clientY - rect.top - pan.y) / scale;
        setDragOffset({
          x: mouseX - node.x,
          y: mouseY - node.y,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (!draggingNode) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - pan.x) / scale - dragOffset.x;
    const y = (e.clientY - rect.top - pan.y) / scale - dragOffset.y;

    onNodesChange(
      nodes.map((node) =>
        node.id === draggingNode ? { ...node, x, y } : node
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.max(0.1, Math.min(3, s * delta)));
  };

  const handleMiddleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    onNodesChange(nodes.filter((n) => n.id !== nodeId));
    onConnectionsChange(connections.filter((c) => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
  };

  const handleEditNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setEditingNode(nodeId);
      setEditLabel(node.label);
    }
  };

  const handleSaveEdit = () => {
    if (editingNode) {
      onNodesChange(
        nodes.map((node) =>
          node.id === editingNode ? { ...node, label: editLabel } : node
        )
      );
      setEditingNode(null);
    }
  };

  const getNodeStyle = (node: FlowchartNode) => {
    const colors: Record<string, string> = {
      start: 'bg-green-100 border-green-500 text-green-800',
      end: 'bg-red-100 border-red-500 text-red-800',
      process: 'bg-blue-100 border-blue-500 text-blue-800',
      input: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      decision: 'bg-orange-100 border-orange-500 text-orange-800',
    };

    const shapes: Record<string, string> = {
      start: 'rounded-full',
      end: 'rounded-full',
      process: 'rounded-lg',
      input: 'rounded-lg',
      decision: 'rounded-lg transform rotate-45',
    };

    return `${colors[node.type]} ${shapes[node.type]}`;
  };

  const renderConnection = (conn: Connection) => {
    const fromNode = nodes.find((n) => n.id === conn.from);
    const toNode = nodes.find((n) => n.id === conn.to);

    if (!fromNode || !toNode) return null;

    const x1 = fromNode.x + 60;
    const y1 = fromNode.y + 40;
    const x2 = toNode.x + 60;
    const y2 = toNode.y + 40;

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowSize = 10;

    return (
      <g key={conn.id}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#374151"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        <polygon
          points={`${x2},${y2} ${x2 - arrowSize * Math.cos(angle - Math.PI / 6)},${
            y2 - arrowSize * Math.sin(angle - Math.PI / 6)
          } ${x2 - arrowSize * Math.cos(angle + Math.PI / 6)},${
            y2 - arrowSize * Math.sin(angle + Math.PI / 6)
          }`}
          fill="#374151"
        />
      </g>
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNode) {
        handleDeleteNode(selectedNode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, nodes, connections]);

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-50">
      <div
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMiddleMouseDown}
        onWheel={handleWheel}
        style={{
          backgroundImage:
            'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#374151" />
            </marker>
          </defs>
          {connections.map(renderConnection)}
        </svg>

        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute w-32 h-20 border-2 flex items-center justify-center font-medium text-sm cursor-move select-none shadow-md transition-shadow ${getNodeStyle(
                node
              )} ${
                selectedNode === node.id
                  ? 'ring-4 ring-blue-400 shadow-lg'
                  : 'hover:shadow-lg'
              } ${node.type === 'decision' ? 'w-32 h-32' : ''}`}
              style={{
                left: node.x,
                top: node.y,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              <span
                className={
                  node.type === 'decision'
                    ? 'transform -rotate-45 text-center px-2'
                    : 'text-center px-2'
                }
              >
                {node.label}
              </span>
              {selectedNode === node.id && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-1 bg-white rounded-lg shadow-lg p-1">
                  <button
                    onClick={() => handleEditNode(node.id)}
                    className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
                    title="Редактировать"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="p-1.5 hover:bg-red-50 rounded text-red-600"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 text-sm text-gray-600">
        <div>Масштаб: {Math.round(scale * 100)}%</div>
        <div className="text-xs text-gray-400 mt-1">
          Колесо мыши для масштаба
        </div>
      </div>

      {editingNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Редактировать текст</h3>
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') setEditingNode(null);
              }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditingNode(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
