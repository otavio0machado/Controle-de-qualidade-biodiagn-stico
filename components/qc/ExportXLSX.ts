
import * as XLSX from 'xlsx';
import { QCDataMap, QCConfigMap, QCDataPoint } from '../../types';
import { WestgardEngine } from './WestgardEngine';

export const exportAllDataToXLSX = (dataMap: QCDataMap, configMap: QCConfigMap) => {
  const workbook = XLSX.utils.book_new();
  let hasData = false;

  // Get all configured exams and sort them alphabetically for the report
  const sortedExamIds = Object.keys(configMap).sort((a, b) => 
    configMap[a].analyteName.localeCompare(configMap[b].analyteName)
  );

  sortedExamIds.forEach((examId) => {
    const config = configMap[examId];
    const rawData = dataMap[examId] || [];

    // Skip exams with no data
    if (rawData.length === 0) return;
    hasData = true;

    // Sort data by date (oldest to newest) for logical reading order
    const sortedData = [...rawData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const exportRows: any[] = [];
    const historyForEngine: QCDataPoint[] = [];

    sortedData.forEach(point => {
      // Re-evaluate rules to ensure the export reflects the exact state based on the current config
      // Note: In a real historical system, you might want to use the config snapshot at the time of data entry,
      // but for this requirements, we use the current active config for consistency.
      const rules = WestgardEngine.evaluate(point.value, historyForEngine, config.mean, config.sd);
      
      // Add to history for next iteration's rule check
      historyForEngine.push(point);

      const z = config.sd ? (point.value - config.mean) / config.sd : 0;

      exportRows.push({
        'Exame': config.analyteName,
        'Data': new Date(point.date).toLocaleDateString('pt-BR'),
        'Resultado': point.value,
        'Média (Alvo)': config.mean,
        'Desvio Padrão (SD)': config.sd,
        'Z-Score': parseFloat(z.toFixed(2)),
        'Status Westgard': rules.length > 0 ? rules.join(', ') : 'OK',
        '+1 SD': config.mean + config.sd,
        '-1 SD': config.mean - config.sd,
        '+2 SD': config.mean + (2 * config.sd),
        '-2 SD': config.mean - (2 * config.sd),
        '+3 SD': config.mean + (3 * config.sd),
        '-3 SD': config.mean - (3 * config.sd),
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    
    // Set column widths for better readability
    const wscols = [
      { wch: 20 }, // Exame
      { wch: 12 }, // Data
      { wch: 10 }, // Resultado
      { wch: 12 }, // Media
      { wch: 15 }, // SD
      { wch: 10 }, // Z-Score
      { wch: 20 }, // Status
      { wch: 10 }, // +1sd
      { wch: 10 }, // -1sd
      { wch: 10 }, // +2sd
      { wch: 10 }, // -2sd
      { wch: 10 }, // +3sd
      { wch: 10 }, // -3sd
    ];
    worksheet['!cols'] = wscols;

    // Excel sheet names have a 31 char limit and cannot contain specific characters
    const safeSheetName = config.analyteName.replace(/[\/\\\?\*\]\[]/g, ' ').trim().slice(0, 30);
    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName || examId);
  });

  if (!hasData) {
    alert("Nenhum dado encontrado para exportar. Adicione resultados primeiro.");
    return;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `LabGuard_Relatorio_CQ_${dateStr}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
};
