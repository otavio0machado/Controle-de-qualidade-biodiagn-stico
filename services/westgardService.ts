
import { QCDataPoint, WestgardResult } from '../types';

export const evaluateWestgard = (
  current: QCDataPoint,
  history: QCDataPoint[],
  mean: number,
  sd: number
): WestgardResult => {
  if (sd === 0) return { status: 'OK', rules: [] }; // Avoid division by zero

  const zScore = (val: number) => (val - mean) / sd;
  const currZ = zScore(current.value);
  const prev = history[history.length - 1]; // Previous point before current push
  const prevZ = prev ? zScore(prev.value) : 0;

  // 1-3s (Random Error) - Rejection
  if (Math.abs(currZ) > 3) {
    return { status: 'ERROR', rules: ['1-3s'], message: 'Valor excede o limite de 3DP.' };
  }

  // 2-2s (Systematic Error) - Rejection
  if (Math.abs(currZ) > 2 && Math.abs(prevZ) > 2 && Math.sign(currZ) === Math.sign(prevZ)) {
    return { status: 'ERROR', rules: ['2-2s'], message: 'Dois valores consecutivos excedem 2DP do mesmo lado.' };
  }

  // R-4s (Random Error) - Rejection
  if (Math.abs(currZ - prevZ) > 4) {
    return { status: 'ERROR', rules: ['R-4s'], message: 'A diferença entre valores consecutivos excede 4DP.' };
  }

  // 4-1s (Systematic Error) - Rejection
  // Check last 4 points including current
  const last4 = [...history.slice(-3), current];
  if (last4.length === 4) {
    const allExceed1SD = last4.every(p => Math.abs(zScore(p.value)) > 1);
    const sameSide = last4.every(p => Math.sign(zScore(p.value)) === Math.sign(currZ));
    if (allExceed1SD && sameSide) {
      return { status: 'ERROR', rules: ['4-1s'], message: 'Quatro valores consecutivos excedem 1DP do mesmo lado.' };
    }
  }

  // 10x (Systematic Error) - Rejection
  // Check last 10 points including current
  const last10 = [...history.slice(-9), current];
  if (last10.length === 10) {
    const sameSideMean = last10.every(p => Math.sign(zScore(p.value)) === Math.sign(currZ));
    if (sameSideMean) {
      return { status: 'ERROR', rules: ['10x'], message: 'Dez valores consecutivos do mesmo lado da média.' };
    }
  }

  // 1-2s (Warning)
  if (Math.abs(currZ) > 2) {
    return { status: 'WARNING', rules: ['1-2s'], message: 'Valor excede 2DP. Regra de alerta.' };
  }

  return { status: 'OK', rules: [] };
};
