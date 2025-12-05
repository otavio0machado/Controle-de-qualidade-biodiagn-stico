
import { QCDataPoint } from '../../types';

export class WestgardEngine {
  static evaluate(
    currentValue: number,
    history: QCDataPoint[], // History EXCLUDING current point, sorted by date ascending
    mean: number,
    sd: number
  ): string[] {
    const violations: string[] = [];
    if (sd === 0) return violations;

    const z = (val: number) => (val - mean) / sd;
    const curZ = z(currentValue);
    const prevPoint = history[history.length - 1];
    const prevZ = prevPoint ? z(prevPoint.value) : 0;

    // 1-3s: Random Error (Rejection)
    if (Math.abs(curZ) > 3) {
      violations.push('1-3s');
    }

    // 2-2s: Systematic Error (Rejection)
    // Current > 2SD AND Previous > 2SD (Same side)
    if (Math.abs(curZ) > 2 && Math.abs(prevZ) > 2) {
      if (Math.sign(curZ) === Math.sign(prevZ)) {
        violations.push('2-2s');
      }
    }

    // R-4s: Random Error (Rejection)
    // Difference between current and previous exceeds 4SD
    // Usually implies one is +2SD and other is -2SD
    if (history.length > 0) {
      if (Math.abs(curZ - prevZ) > 4) {
        violations.push('R-4s');
      }
    }

    // 4-1s: Systematic Error (Rejection)
    // Last 4 points (including current) > 1SD (Same side)
    if (history.length >= 3) {
      const last3 = history.slice(-3);
      const group = [...last3, { value: currentValue } as QCDataPoint];
      const allOutside1SD = group.every(p => Math.abs(z(p.value)) > 1);
      const sameSide = group.every(p => Math.sign(z(p.value)) === Math.sign(curZ));
      
      if (allOutside1SD && sameSide) {
        violations.push('4-1s');
      }
    }

    // 10x: Systematic Error (Rejection)
    // Last 10 points (including current) on same side of mean
    if (history.length >= 9) {
      const last9 = history.slice(-9);
      const group = [...last9, { value: currentValue } as QCDataPoint];
      const side = Math.sign(curZ);
      
      // If current is exactly on mean (0), 10x doesn't really apply or break it. 
      // Strict interpretation: must be on ONE side.
      if (side !== 0) {
        const allSameSide = group.every(p => Math.sign(z(p.value)) === side);
        if (allSameSide) {
          violations.push('10x');
        }
      }
    }

    // 1-2s: Warning
    // Evaluated last so it doesn't overshadow rejections, or can exist alongside
    if (Math.abs(curZ) > 2 && Math.abs(curZ) <= 3 && violations.length === 0) {
      violations.push('1-2s');
    }

    return violations;
  }
}
