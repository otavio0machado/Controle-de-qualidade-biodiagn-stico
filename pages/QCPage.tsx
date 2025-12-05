
import React, { useEffect, useState } from 'react';
import QCTable from '../components/QC/QCTable';
import QCChart from '../components/qc/QCChart';
import QCWestgard from '../components/QC/QCWestgard';
import { QCDataPoint, QCConfig, QCDataMap, QCConfigMap } from '../types';
import { evaluateWestgard } from '../services/westgardService';
import { saveAllQCData, loadAllQCData, saveAllConfigs, loadAllConfigs } from '../services/storageService';
import { INITIAL_QC_CONFIGS } from '../constants';
import { Settings, Save, Beaker, FileSpreadsheet } from 'lucide-react';

const QCPage: React.FC = () => {
  // State for all data and configs
  const [dataMap, setDataMap] = useState<QCDataMap>({});
  const [configMap, setConfigMap] = useState<QCConfigMap>(INITIAL_QC_CONFIGS);
  
  // Active selection
  const [selectedExamId, setSelectedExamId] = useState<string>('glucose');
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Edit config state
  const [editMean, setEditMean] = useState<string>('');
  const [editSD, setEditSD] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        const storedData = await loadAllQCData();
        const storedConfigs = await loadAllConfigs();

        if (storedConfigs) {
          setConfigMap(storedConfigs);
        } else {
          await saveAllConfigs(INITIAL_QC_CONFIGS);
        }
        
        setDataMap(storedData);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const activeConfig = configMap[selectedExamId];
  const activeData = dataMap[selectedExamId] || [];

  const reEvaluateAll = (points: QCDataPoint[], currentConfig: QCConfig) => {
    const evaluated: QCDataPoint[] = [];
    // Ensure sorted by date before evaluating history dependent rules
    const sortedPoints = [...points].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedPoints.forEach((point, index) => {
      const history = evaluated.slice(0, index); 
      const result = evaluateWestgard(point, evaluated, currentConfig.mean, currentConfig.sd);
      evaluated.push({
        ...point,
        status: result.status,
        ruleViolated: result.rules[0],
        westgardRules: result.rules
      });
    });
    return evaluated;
  };

  const handleUpdateData = async (newData: QCDataPoint[]) => {
    const reEvaluated = reEvaluateAll(newData, activeConfig);
    
    const updatedMap = {
      ...dataMap,
      [selectedExamId]: reEvaluated
    };
    
    setDataMap(updatedMap);
    await saveAllQCData(updatedMap);
  };

  const handleOpenConfig = () => {
    setEditMean(activeConfig.mean.toString());
    setEditSD(activeConfig.sd.toString());
    setShowConfigModal(true);
  };

  const handleSaveConfig = async () => {
    const newMean = parseFloat(editMean);
    const newSD = parseFloat(editSD);

    if (isNaN(newMean) || isNaN(newSD)) return;

    const newConfig = {
      ...activeConfig,
      mean: newMean,
      sd: newSD
    };

    const updatedConfigMap = {
      ...configMap,
      [selectedExamId]: newConfig
    };

    setConfigMap(updatedConfigMap);
    await saveAllConfigs(updatedConfigMap);

    // Re-evaluate data with new limits
    const reEvaluated = reEvaluateAll(activeData, newConfig);
    const updatedDataMap = {
      ...dataMap,
      [selectedExamId]: reEvaluated
    };
    setDataMap(updatedDataMap);
    await saveAllQCData(updatedDataMap);

    setShowConfigModal(false);
  };

  if (loading) return <div className="text-white text-center mt-20 text-lg">Carregando Módulo CQ...</div>;

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Sidebar / Analyte Selector */}
      <div className="w-full lg:w-64 bg-surface rounded-lg border border-gray-700 flex flex-col shadow-lg max-h-[200px] lg:max-h-none overflow-hidden">
        <div className="p-4 bg-gray-800/50 border-b border-gray-700 font-bold text-gray-200 flex items-center gap-2">
          <Beaker size={18} className="text-primary"/>
          Exames
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {Object.values(configMap).sort((a,b) => a.analyteName.localeCompare(b.analyteName)).map((conf) => (
            <button
              key={conf.id}
              onClick={() => setSelectedExamId(conf.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center ${
                selectedExamId === conf.id 
                  ? 'bg-primary/20 text-white border border-primary/50' 
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              {conf.analyteName}
              {(dataMap[conf.id]?.length ?? 0) > 0 && (
                <span className="text-xs bg-gray-700 px-1.5 rounded-full text-gray-300">{dataMap[conf.id]?.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col space-y-6 min-w-0">
        
        {/* Header & Config */}
        <div className="bg-surface p-4 rounded-lg border border-gray-700 flex flex-wrap justify-between items-center shadow-md gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-primary/10 p-3 rounded-full">
                <FileSpreadsheet className="text-primary" size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-white leading-none">{activeConfig.analyteName}</h2>
                <span className="text-sm text-gray-400">Controle de Qualidade Diário</span>
             </div>
          </div>

          <div className="flex gap-4 items-center bg-background/50 p-2 rounded-lg border border-gray-700">
            <div className="px-2 border-r border-gray-600">
              <span className="text-xs text-gray-500 block uppercase tracking-wider">Média (Alvo)</span>
              <span className="text-lg font-mono font-bold text-green-400">{activeConfig.mean}</span>
            </div>
            <div className="px-2 border-r border-gray-600">
              <span className="text-xs text-gray-500 block uppercase tracking-wider">Desvio Padrão</span>
              <span className="text-lg font-mono font-bold text-yellow-400">{activeConfig.sd}</span>
            </div>
             <div className="px-2">
              <span className="text-xs text-gray-500 block uppercase tracking-wider">Unidade</span>
              <span className="text-lg font-mono text-gray-300">{activeConfig.unit}</span>
            </div>
            <button 
              onClick={handleOpenConfig}
              className="ml-4 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-white flex items-center gap-2 transition-colors border border-gray-600 shadow-sm"
              title="Configurar Média e Desvio Padrão"
            >
              <Settings size={16} />
              <span>Editar Alvo</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Left Col: Table */}
          <div className="lg:col-span-4 h-[500px] lg:h-auto min-h-0">
            <QCTable 
              data={activeData} 
              onUpdate={handleUpdateData} 
              analyteName={activeConfig.analyteName}
            />
          </div>

          {/* Right Col: Charts */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto pb-4 min-h-0 custom-scrollbar">
            <div className="flex-none h-96">
              <QCChart data={activeData} config={activeConfig} />
            </div>
            <div className="flex-none">
              <QCWestgard data={activeData} />
            </div>
          </div>
        </div>
      </div>

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-gray-600 p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Configurar {activeConfig.analyteName}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Média (Alvo)</label>
                <input 
                  type="number" 
                  value={editMean}
                  onChange={(e) => setEditMean(e.target.value)}
                  className="w-full bg-background border border-gray-600 rounded-lg p-2.5 text-white focus:border-primary outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Valor alvo esperado para este controle (Média).</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Desvio Padrão (SD)</label>
                <input 
                  type="number" 
                  value={editSD}
                  onChange={(e) => setEditSD(e.target.value)}
                  className="w-full bg-background border border-gray-600 rounded-lg p-2.5 text-white focus:border-primary outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Desvio padrão estabelecido pelo fabricante ou laboratório.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Save size={18} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QCPage;
