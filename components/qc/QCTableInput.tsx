
import React, { useState } from 'react';
import { QCDataPoint } from '../../types';
import { Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface QCTableInputProps {
  data: QCDataPoint[];
  onAdd: (value: number, date: string) => void;
  onDelete: (id: string) => void;
  mean: number;
  sd: number;
}

const QCTableInput: React.FC<QCTableInputProps> = ({ data, onAdd, onDelete, mean, sd }) => {
  const [valInput, setValInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(valInput);
    if (!isNaN(num)) {
      onAdd(num, dateInput);
      setValInput('');
    }
  };

  // Sort descending for list view (newest top)
  const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-surface rounded-xl border border-gray-700 flex flex-col h-[600px]">
      {/* Header / Form */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <h3 className="text-lg font-bold text-gray-200 mb-3">Entrada de Dados</h3>
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Data</label>
            <input 
              type="date" 
              required
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full bg-background border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Resultado</label>
            <input 
              type="number" 
              step="0.01"
              required
              placeholder="Valor"
              value={valInput}
              onChange={(e) => setValInput(e.target.value)}
              className="w-full bg-background border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none"
            />
          </div>
          <button 
            type="submit"
            className="bg-primary hover:bg-blue-600 text-white p-2 rounded transition-colors"
            title="Adicionar"
          >
            <Plus size={20} />
          </button>
        </form>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-400 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2">Z-Score</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 text-gray-300">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">Nenhum dado registrado.</td>
              </tr>
            ) : (
              sortedData.map((row) => {
                const hasRules = row.westgardRules && row.westgardRules.length > 0;
                const isWarning = hasRules && row.westgardRules!.includes('1-2s') && row.westgardRules!.length === 1;
                const isError = hasRules && !isWarning;

                return (
                  <tr key={row.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">{new Date(row.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 font-mono font-medium text-white">{row.value}</td>
                    <td className="px-4 py-3 font-mono text-gray-400">
                      {row.zScore ? row.zScore.toFixed(2) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {isError ? (
                        <span className="flex items-center gap-1 text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-900/50 w-fit text-xs font-bold">
                          <AlertCircle size={12} /> {row.westgardRules![0]}
                        </span>
                      ) : isWarning ? (
                        <span className="flex items-center gap-1 text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-900/50 w-fit text-xs font-bold">
                          <AlertCircle size={12} /> 1-2s
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-500 text-xs">
                          <CheckCircle2 size={12} /> OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => onDelete(row.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QCTableInput;
