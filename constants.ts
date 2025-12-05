
import { QCConfigMap } from './types';

export const INITIAL_QC_CONFIGS: QCConfigMap = {
  'glicose_cal': { id: 'glicose_cal', analyteName: 'Glicose CAL', mean: 112.0, sd: 3.6, unit: 'mg/dL' },
  'colesterol': { id: 'colesterol', analyteName: 'Colesterol', mean: 197.0, sd: 2.5, unit: 'mg/dL' },
  'triglicerideos': { id: 'triglicerideos', analyteName: 'Triglicerídeos', mean: 154.0, sd: 2.6, unit: 'mg/dL' },
  'ureia': { id: 'ureia', analyteName: 'Ureia', mean: 37.0, sd: 2.7, unit: 'mg/dL' },
  'creatinina_p': { id: 'creatinina_p', analyteName: 'Creatinina P', mean: 1.08, sd: 0.1, unit: 'mg/dL' },
  'acido_urico': { id: 'acido_urico', analyteName: 'Ácido Úrico', mean: 6.6, sd: 0.5, unit: 'mg/dL' },
  'tgo': { id: 'tgo', analyteName: 'TGO', mean: 19.0, sd: 2.0, unit: 'U/L' },
  'tgp': { id: 'tgp', analyteName: 'TGP', mean: 29.0, sd: 2.0, unit: 'U/L' },
  'fal_dgkc': { id: 'fal_dgkc', analyteName: 'FAL DGKC 137 / 131', mean: 55.0, sd: 5.5, unit: 'U/L' },
  'amilase': { id: 'amilase', analyteName: 'Amilase', mean: 48.0, sd: 5.0, unit: 'U/L' },
  'cpk_total': { id: 'cpk_total', analyteName: 'CPK Total', mean: 79.0, sd: 8.0, unit: 'U/L' },
  'hdl_eva_50': { id: 'hdl_eva_50', analyteName: 'HDL EVA 50', mean: 40.0, sd: 3.0, unit: 'mg/dL' },
  'colesterol_p200': { id: 'colesterol_p200', analyteName: 'Colesterol P200', mean: 195.0, sd: 4.6, unit: 'mg/dL' },
};
