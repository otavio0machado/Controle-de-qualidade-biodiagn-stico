
import React, { useState, useEffect } from 'react';
import { INITIAL_QC_CONFIGS } from '../../constants';
import { qcStorage } from '../../utils/qcStorage';
import { QCDataMap, QCConfigMap, QCDataPoint } from '../../types';
import { WestgardEngine } from './WestgardEngine';
import { exportAllDataToXLSX } from './ExportXLSX';
import QCChart from '../QC/QCChart';
import QCTableInput from './QCTableInput';
import { 
  LayoutDashboard, 
  Settings, 
  Download, 
  Beaker,
  Save
} from 'lucide-react';

const QCPage: React.FC = () => {
  const [selectedExamId, setSelectedExamId] = useState<string>(Object.keys(INITIAL_QC_CONFIGS)[0]);
  const [dataMap, setDataMap] = useState<QCDataMap>({});
  const [configMap, setConfigMap] = useState<QCConfigMap>(INITIAL_QC_CONFIGS);
  const [showConfig, setShowConfig] = useState(false);
  
  // Local state for editing config
  const [editMean, setEditMean] = useState('');
  const [editSd, setEditSd] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (configMap[selectedExamId]) {
      setEditMean(configMap[selectedExamId].mean.toString());
      setEditSd(configMap[selectedExamId].sd.toString());
    }
  }, [selectedExamId, configMap]);

  const loadData = async () => {
    try {
      const { loadAllQCData, loadAllConfigs } = await import('../../services/storageService');
      const loadedData = await loadAllQCData();
      const loadedConfigs = await loadAllConfigs();
      
      setDataMap(loadedData || {});
      if (loadedConfigs) {
        setConfigMap(prev => ({...prev, ...loadedConfigs}));
      }
    } catch (e) {
      console.error("Error loading QC data:", e);
    }
  };

  const activeConfig = configMap[selectedExamId];
  const activeData = dataMap[selectedExamId] || [];

  // Calculate rules for display
  const processedData = React.useMemo(() => {
    if (!activeData) return [];
    const sorted = [...activeData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Re-evaluate all history to ensure rules like 2-2s are correct based on sequence
    const evaluated: QCDataPoint[] = [];
    sorted.forEach((pt) => {
      const history = evaluated; // Points before this one
      const rules = WestgardEngine.evaluate(pt.value, history, activeConfig.mean, activeConfig.sd);
      const z = (pt.value - activeConfig.mean) / activeConfig.sd;
      
      evaluated.push({
        ...pt,
        zScore: z,
        westgardRules: rules
      });
    });
    
    return evaluated.reverse(); // Newest first for table
  }, [activeData, activeConfig]);

  const handleAdd = async (val: number, date: string) => {
    const { saveAllQCData } = await import('../../services/storageService');
    
    const newItem: QCDataPoint = {
      id: crypto.randomUUID(),
      date: date, // Input is YYYY-MM-DD
      value: val
    };

    const newList = [...activeData, newItem];
    const newMap = { ...dataMap, [selectedExamId]: newList };
    
    setDataMap(newMap);
    await saveAllQCData(newMap);
  };

  const handleDelete = async (id: string) => {
    const { saveAllQCData } = await import('../../services/storageService');
    const newList = activeData.filter(d => d.id !== id);
    const newMap = { ...dataMap, [selectedExamId]: newList };
    setDataMap(newMap);
    await saveAllQCData(newMap);
  };

  const handleConfigSave = async () => {
    const { saveAllConfigs } = await import('../../services/storageService');
    const newMean = parseFloat(editMean);
    const newSd = parseFloat(editSd);
    
    if (!isNaN(newMean) && !isNaN(newSd)) {
      const newConfig = { ...activeConfig, mean: newMean, sd: newSd };
      const newMap = { ...configMap, [selectedExamId]: newConfig };
      setConfigMap(newMap);
      await saveAllConfigs(newMap);
      setShowConfig(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700 flex items-center gap-2 text-primary">
          <Beaker size={24} />
          <span className="font-bold text-lg tracking-wide">LabGuard CQ</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2 px-2">Exames Disponíveis</div>
          {Object.values(configMap).sort((a,b) => a.analyteName.localeCompare(b.analyteName)).map((cfg) => (
            <button
              key={cfg.id}
              onClick={() => { setSelectedExamId(cfg.id); setShowConfig(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex justify-between items-center ${
                selectedExamId === cfg.id 
                  ? 'bg-primary text-white shadow-lg shadow-blue-900/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {cfg.analyteName}
              {(dataMap[cfg.id]?.length ?? 0) > 0 && (
                <span className={`text-[10px] px-1.5 rounded-full ${selectedExamId === cfg.id ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  {dataMap[cfg.id]?.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={() => exportAllDataToXLSX(dataMap, configMap)}
            className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
          >
            <Download size={16} /> Exportar Dados (.xlsx)
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-700 bg-surface flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="text-gray-500" size={20} />
            <h1 className="text-xl font-bold text-white">{activeConfig.analyteName}</h1>
            <div className="h-6 w-px bg-gray-700 mx-2"></div>
            <div className="flex gap-4 text-sm font-mono">
              <div className="flex flex-col">
                 <span className="text-[10px] text-gray-500 uppercase">Média</span>
                 <span className="text-green-400 font-bold">{activeConfig.mean}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] text-gray-500 uppercase">Desvio Padrão</span>
                 <span className="text-yellow-400 font-bold">{activeConfig.sd}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] text-gray-500 uppercase">Unidade</span>
                 <span className="text-gray-300">{activeConfig.unit}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded-lg transition-colors ${showConfig ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            title="Configurações do Exame"
          >
            <Settings size={20} />
          </button>
        </header>

        {/* Config Panel Overlay */}
        {showConfig && (
          <div className="absolute top-16 right-0 w-full md:w-80 bg-gray-800/95 backdrop-blur-md border-b md:border-l border-gray-700 z-20 p-6 shadow-2xl animate-in slide-in-from-top-2">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Settings size={18} /> Ajustar Parâmetros
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Média (Target)</label>
                <input 
                  type="number" 
                  value={editMean}
                  onChange={(e) => setEditMean(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Desvio Padrão (SD)</label>
                <input 
                  type="number" 
                  value={editSd}
                  onChange={(e) => setEditSd(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-primary outline-none"
                />
              </div>
              <button 
                onClick={handleConfigSave}
                className="w-full bg-primary hover:bg-blue-600 text-white py-2 rounded font-medium flex items-center justify-center gap-2"
              >
                <Save size={16} /> Salvar Alterações
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[600px]">
            {/* Left: Chart */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <QCChart 
                data={[...processedData].reverse()} // Chart needs oldest to newest (processedData is newest first)
                config={activeConfig} 
              />
              
              {/* Stats / Summary */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-surface p-4 rounded-xl border border-gray-700">
                    <div className="text-xs text-gray-500 uppercase">Total de Pontos</div>
                    <div className="text-2xl font-bold text-white">{processedData.length}</div>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-gray-700">
                    <div className="text-xs text-gray-500 uppercase">CV %</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {activeConfig.mean ? ((activeConfig.sd / activeConfig.mean) * 100).toFixed(1) : '0.0'}%
                    </div>
                  </div>
               </div>
            </div>

            {/* Right: Table & Input */}
            <div className="lg:col-span-1 h-full flex flex-col min-h-0">
              <QCTableInput 
                data={processedData} 
                onAdd={handleAdd} 
                onDelete={handleDelete}
                mean={activeConfig.mean}
                sd={activeConfig.sd}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QCPage;
