
import React, { useState } from 'react';
import { QCDataPoint } from '../../types';
import { Trash2, Plus, Edit2, Check, X, Download } from 'lucide-react';

interface QCTableProps {
  data: QCDataPoint[];
  onUpdate: (newData: QCDataPoint[]) => void;
  analyteName: string;
}

const QCTable: React.FC<QCTableProps> = ({ data, onUpdate, analyteName }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [editDate, setEditDate] = useState<string>('');

  const [newValue, setNewValue] = useState<string>('');
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      onUpdate(data.filter(d => d.id !== id));
    }
  };

  const startEdit = (item: QCDataPoint) => {
    setEditingId(item.id);
    setEditValue(item.value);
    setEditDate(item.date);
  };

  const saveEdit = () => {
    onUpdate(data.map(d => {
      if (d.id === editingId) {
        return { ...d, value: editValue, date: editDate, status: undefined }; // Reset status to re-evaluate
      }
      return d;
    }));
    setEditingId(null);
  };

  const addPoint = () => {
    if (!newValue || !newDate) return;
    const newItem: QCDataPoint = {
      id: crypto.randomUUID(),
      date: newDate,
      value: parseFloat(newValue),
    };
    // Add to end and sort
    const newData = [...data, newItem].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    onUpdate(newData);
    setNewValue('');
  };

  const handleExport = () => {
    if (data.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const headers = ['Data', 'Valor', 'Status', 'Regra Violada'];
    const csvRows = [
      headers.join(';'),
      ...data.map(row => {
        const dateStr = new Date(row.date).toLocaleDateString('pt-BR');
        // Brazil uses comma for decimals in Excel
        const valStr = row.value.toString().replace('.', ',');
        const statusStr = row.status === 'OK' ? 'OK' : (row.status || '');
        const ruleStr = row.ruleViolated || '';
        return `${dateStr};${valStr};${statusStr};${ruleStr}`;
      })
    ];

    // Add BOM for correct Excel encoding
    const csvString = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    const safeName = analyteName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const date = new Date().toISOString().slice(0,10);
    
    link.href = URL.createObjectURL(blob);
    link.download = `cq_${safeName}_${date}.csv`;
    link.click();
  };

  return (
    <div className="bg-surface rounded-lg shadow-md border border-gray-700 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-200">Tabela de Dados</h3>
        <button 
          onClick={handleExport}
          className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm border border-gray-600"
          title="Exportar para Excel/CSV"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>
      
      {/* Add New Row */}
      <div className="p-3 bg-gray-800/30 border-b border-gray-700 flex gap-2 items-center">
        <input 
          type="date" 
          value={newDate} 
          onChange={(e) => setNewDate(e.target.value)}
          className="bg-background border border-gray-600 rounded p-1 text-sm text-white focus:border-primary outline-none"
        />
        <input 
          type="number" 
          value={newValue} 
          placeholder="Valor"
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPoint()}
          className="bg-background border border-gray-600 rounded p-1 text-sm text-white w-24 focus:border-primary outline-none"
        />
        <button 
          onClick={addPoint}
          className="p-1 bg-primary text-white rounded hover:bg-blue-600 transition-colors"
          title="Adicionar"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-800 text-gray-200 sticky top-0 z-10">
            <tr>
              <th className="p-3 font-medium">Data</th>
              <th className="p-3 font-medium">Valor</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Nenhum dado registrado para este exame.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-800/50 transition-colors">
                  {editingId === row.id ? (
                    <>
                      <td className="p-2">
                        <input 
                          type="date" 
                          value={editDate} 
                          onChange={(e) => setEditDate(e.target.value)}
                          className="bg-background border border-gray-600 rounded p-1 w-full text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(parseFloat(e.target.value))}
                          className="bg-background border border-gray-600 rounded p-1 w-full text-white"
                        />
                      </td>
                      <td className="p-2 text-gray-500 italic">Editando...</td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={saveEdit} className="text-success hover:text-green-400"><Check size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="text-danger hover:text-red-400"><X size={16} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3">{new Date(row.date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 font-mono text-gray-200">{row.value}</td>
                      <td className="p-3">
                        {row.status === 'ERROR' && <span className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded border border-red-900">{row.ruleViolated || 'Erro'}</span>}
                        {row.status === 'WARNING' && <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded border border-yellow-900">{row.ruleViolated || 'Alerta'}</span>}
                        {row.status === 'OK' && <span className="text-xs text-green-500">OK</span>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => startEdit(row)} className="text-primary hover:text-blue-400"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(row.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QCTable;
