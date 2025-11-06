import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { FlowchartNode, Connection } from '../types';

interface ExportModalProps {
  nodes: FlowchartNode[];
  connections: Connection[];
  title: string;
  onClose: () => void;
}

export default function ExportModal({
  nodes,
  connections,
  title,
  onClose,
}: ExportModalProps) {
  const [format, setFormat] = useState<'png' | 'svg'>('png');

  const renderFlowchartToSVG = () => {
    if (nodes.length === 0) {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><text x="400" y="300" text-anchor="middle" fill="#666">Пустая блок-схема</text></svg>';
    }

    const padding = 50;
    const minX = Math.min(...nodes.map((n) => n.x)) - padding;
    const minY = Math.min(...nodes.map((n) => n.y)) - padding;
    const maxX = Math.max(...nodes.map((n) => n.x + 120)) + padding;
    const maxY = Math.max(...nodes.map((n) => n.y + 80)) + padding;

    const width = maxX - minX;
    const height = maxY - minY;

    const getNodeColor = (type: string) => {
      const colors: Record<string, { bg: string; border: string; text: string }> = {
        start: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
        end: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
        process: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
        input: { bg: '#fef3c7', border: '#eab308', text: '#854d0e' },
        decision: { bg: '#fed7aa', border: '#f97316', text: '#9a3412' },
      };
      return colors[type] || colors.process;
    };

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += `<rect width="${width}" height="${height}" fill="#f9fafb"/>`;

    svg += '<defs><marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="#374151"/></marker></defs>';

    connections.forEach((conn) => {
      const fromNode = nodes.find((n) => n.id === conn.from);
      const toNode = nodes.find((n) => n.id === conn.to);

      if (fromNode && toNode) {
        const x1 = fromNode.x - minX + 60;
        const y1 = fromNode.y - minY + 40;
        const x2 = toNode.x - minX + 60;
        const y2 = toNode.y - minY + 40;

        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#374151" stroke-width="2" marker-end="url(#arrowhead)"/>`;
      }
    });

    nodes.forEach((node) => {
      const colors = getNodeColor(node.type);
      const x = node.x - minX;
      const y = node.y - minY;

      if (node.type === 'start' || node.type === 'end') {
        svg += `<ellipse cx="${x + 60}" cy="${y + 40}" rx="60" ry="40" fill="${colors.bg}" stroke="${colors.border}" stroke-width="2"/>`;
        svg += `<text x="${x + 60}" y="${y + 45}" text-anchor="middle" fill="${colors.text}" font-size="14" font-weight="600">${escapeXml(node.label)}</text>`;
      } else if (node.type === 'decision') {
        const cx = x + 64;
        const cy = y + 64;
        svg += `<polygon points="${cx},${cy - 64} ${cx + 64},${cy} ${cx},${cy + 64} ${cx - 64},${cy}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="2"/>`;
        svg += `<text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="${colors.text}" font-size="14" font-weight="600">${escapeXml(node.label)}</text>`;
      } else {
        svg += `<rect x="${x}" y="${y}" width="120" height="80" rx="8" fill="${colors.bg}" stroke="${colors.border}" stroke-width="2"/>`;
        svg += `<text x="${x + 60}" y="${y + 45}" text-anchor="middle" fill="${colors.text}" font-size="14" font-weight="600">${escapeXml(node.label)}</text>`;
      }
    });

    svg += '</svg>';
    return svg;
  };

  const escapeXml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const handleExport = () => {
    const svg = renderFlowchartToSVG();

    if (format === 'svg') {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      downloadFile(blob, `${title}.svg`);
    } else {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx?.scale(2, 2);
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            downloadFile(blob, `${title}.png`);
          }
        }, 'image/png');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Экспорт блок-схемы</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Выберите формат:
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormat('png')}
              className={`p-4 rounded-lg border-2 transition ${
                format === 'png'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-lg font-semibold mb-1">PNG</div>
              <div className="text-sm text-gray-600">
                Растровое изображение высокого качества
              </div>
            </button>
            <button
              onClick={() => setFormat('svg')}
              className={`p-4 rounded-lg border-2 transition ${
                format === 'svg'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-lg font-semibold mb-1">SVG</div>
              <div className="text-sm text-gray-600">
                Векторное изображение для масштабирования
              </div>
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-96 overflow-auto">
          <div className="text-sm text-gray-600 mb-2">Предпросмотр:</div>
          <div
            className="bg-white rounded border border-gray-200 p-4 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: renderFlowchartToSVG() }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
          >
            <Download className="w-5 h-5" />
            Скачать {format.toUpperCase()}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
