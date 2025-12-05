
import React from 'react';
import { QCDataPoint } from '../../types';
import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

interface QCWestgardProps {
  data: QCDataPoint[];
}

const QCWestgard: React.FC<QCWestgardProps> = ({ data }) => {
  const violations = data.filter(d => d.status === 'ERROR' || d.status === 'WARNING').reverse(); // Show newest first

  return (
    <div className="bg-surface p-4 rounded-lg shadow-md border border-gray-700 h-full overflow-hidden flex flex-col">
      <h3 className="text-lg font-bold mb-4 text-gray-200">Análise de Westgard</h3>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {violations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <CheckCircle size={40} className="mb-2 text-success" />
            <p>Nenhuma violação de regra detectada.</p>
            <p className="text-xs mt-1">O sistema está em conformidade.</p>
          </div>
        ) : (
          violations.map(v => (
            <div 
              key={v.id} 
              className={`p-3 rounded-md border ${
                v.status === 'ERROR' 
                  ? 'bg-red-900/20 border-red-800/50' 
                  : 'bg-yellow-900/20 border-yellow-800/50'
              }`}
            >
              <div className="flex items-start gap-3">
                {v.status === 'ERROR' ? (
                  <XCircle className="text-danger shrink-0" size={20} />
                ) : (
                  <AlertTriangle className="text-warning shrink-0" size={20} />
                )}
                <div className="w-full">
                  <div className="flex justify-between items-baseline w-full">
                    <span className={`font-bold text-sm ${v.status === 'ERROR' ? 'text-red-400' : 'text-yellow-400'}`}>
                      Regra: {v.ruleViolated}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{new Date(v.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Valor: {v.value}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QCWestgard;
