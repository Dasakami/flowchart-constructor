import { useState } from 'react';
import { FlowchartNode, Connection } from '../types';

interface ExportModalProps {
  nodes: FlowchartNode[];
  connections: Connection[];
  title: string;
  onClose: () => void;
}

export default function ExportModal({ nodes, connections, title, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'png' | 'svg'>('png');

  const escapeXml = (str: string) =>
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&apos;');

  const renderFlowchartToSVG = () => {
    if (nodes.length === 0) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
                <text x="400" y="300" text-anchor="middle" fill="#999" font-size="16">Пустая блок-схема</text>
              </svg>`;
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
        start: { bg: '#E6FFFA', border: '#2C7A7B', text: '#2C7A7B' },
        end: { bg: '#FFF5F5', border: '#C53030', text: '#C53030' },
        process: { bg: '#EBF8FF', border: '#3182CE', text: '#3182CE' },
        input: { bg: '#FFFEEB', border: '#D69E2E', text: '#D69E2E' },
        decision: { bg: '#FFFAEB', border: '#DD6B20', text: '#DD6B20' },
      };
      return colors[type] || colors.process;
    };

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                 <rect width="${width}" height="${height}" fill="#F7FAFC"/>`;

    svg += '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0,10 3,0 6" fill="#4A5568"/></marker></defs>';

    connections.forEach(conn => {
      const from = nodes.find(n => n.id === conn.from);
      const to = nodes.find(n => n.id === conn.to);
      if (!from || !to) return;
      const x1 = from.x - minX + 60;
      const y1 = from.y - minY + 40;
      const x2 = to.x - minX + 60;
      const y2 = to.y - minY + 40;
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#4A5568" stroke-width="2" marker-end="url(#arrow)"/>`;
    });

    nodes.forEach(node => {
      const colors = getNodeColor(node.type);
      const x = node.x - minX;
      const y = node.y - minY;
      if (node.type === 'start' || node.type === 'end') {
        svg += `<ellipse cx="${x + 60}" cy="${y + 40}" rx="60" ry="40" fill="${colors.bg}" stroke="${colors.border}" stroke-width="2"/>`;
        svg += `<text x="${x + 60}" y="${y + 45}" text-anchor="middle" fill="${colors.text}" font-size="14" font-weight="600">${escapeXml(node.label)}</text>`;
      } else if (node.type === 'decision') {
        const cx = x + 64;
        const cy = y + 64;
        svg += `<polygon points="${cx},${cy-64} ${cx+64},${cy} ${cx},${cy+64} ${cx-64},${cy}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="2"/>`;
        svg += `<text x="${cx}" y="${cy+5}" text-anchor="middle" fill="${colors.text}" font-size="14" font-weight="600">${escapeXml(node.label)}</text>`;
      } else {
        svg += `<rect x="${x}" y="${y}" width="120" height="80" rx="8" fill="${colors.bg}" stroke="${colors.border}" stroke-width="2"/>`;
        svg += `<text x="${x+60}" y="${y+45}" text-anchor="middle" fill="${colors.text}" font-size="14" font-weight="600">${escapeXml(node.label)}</text>`;
      }
    });

    svg += '</svg>';
    return svg;
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

  const handleExport = () => {
    const svg = renderFlowchartToSVG();
    if (format === 'svg') {
      downloadFile(new Blob([svg], { type: 'image/svg+xml' }), `${title}.svg`);
    } else {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx?.scale(2, 2);
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(blob => blob && downloadFile(blob, `${title}.png`), 'image/png');
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Экспорт блок-схемы</h2>
          <button
            onClick={onClose}
            className="px-2 py-1 text-gray-500 hover:text-gray-800 transition rounded"
          >
            X
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
          <div className="flex gap-4">
            {['png', 'svg'].map(f => (
              <button
                key={f}
                onClick={() => setFormat(f as 'png' | 'svg')}
                className={`flex-1 py-2 rounded-lg border-2 text-center transition ${
                  format === f ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 bg-gray-50 p-3 rounded-lg max-h-80 overflow-auto">
          <div
            dangerouslySetInnerHTML={{ __html: renderFlowchartToSVG() }}
            className="flex items-center justify-center"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition"
          >
            Скачать {format.toUpperCase()}
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
