
export interface QCDataPoint {
  id: string;
  date: string;
  value: number;
  zScore?: number;
  westgardRules?: string[]; // Array of rule codes e.g. ['1_3s', 'R_4s']
  comment?: string;
  status?: 'OK' | 'WARNING' | 'ERROR';
  ruleViolated?: string;
}

export interface QCConfig {
  id: string;
  analyteName: string;
  mean: number;
  sd: number;
  unit: string;
}

export interface WestgardResult {
  status: 'OK' | 'WARNING' | 'ERROR';
  rules: string[];
  message?: string;
}

export type QCDataMap = Record<string, QCDataPoint[]>;
export type QCConfigMap = Record<string, QCConfig>;

export enum Tab {
  QC = 'QC',
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K',
}
