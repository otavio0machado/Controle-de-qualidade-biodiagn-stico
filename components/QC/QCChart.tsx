
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { QCDataPoint, QCConfig } from '../../types';

interface QCChartProps {
  data: QCDataPoint[];
  config: QCConfig;
}

const QCChart: React.FC<QCChartProps> = ({ data, config }) => {
  const { mean, sd } = config;
  const plus1SD = mean + sd;
  const plus2SD = mean + 2 * sd;
  const plus3SD = mean + 3 * sd;
  const minus1SD = mean - sd;
  const minus2SD = mean - 2 * sd;
  const minus3SD = mean - 3 * sd;

  // Dynamic domain to ensure points are visible, but at least +/- 3SD
  const values = data.map(d => d.value);
  const minVal = Math.min(...values, minus3SD);
  const maxVal = Math.max(...values, plus3SD);
  const padding = sd * 0.5;

  const domainMin = minVal - padding;
  const domainMax = maxVal + padding;

  return (
    <div className="w-full h-96 bg-surface p-4 rounded-lg shadow-md border border-gray-700">
      <h3 className="text-lg font-bold mb-4 text-primary">Gráfico de Levey-Jennings</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            tick={{fontSize: 12}}
            padding={{left: 20, right: 20}}
            tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          />
          <YAxis 
            domain={[domainMin, domainMax]} 
            stroke="#94a3b8" 
            tick={{fontSize: 12}}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
            formatter={(value: number) => [value, config.analyteName]}
            labelStyle={{ color: '#94a3b8' }}
            labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
          />
          
          <ReferenceLine y={mean} label="Média" stroke="#22c55e" strokeDasharray="5 5" />
          <ReferenceLine y={plus1SD} label="+1DP" stroke="#64748b" strokeDasharray="3 3" />
          <ReferenceLine y={minus1SD} label="-1DP" stroke="#64748b" strokeDasharray="3 3" />
          
          <ReferenceLine y={plus2SD} label="+2DP" stroke="#eab308" strokeDasharray="3 3" />
          <ReferenceLine y={minus2SD} label="-2DP" stroke="#eab308" strokeDasharray="3 3" />
          
          <ReferenceLine y={plus3SD} label="+3DP" stroke="#ef4444" />
          <ReferenceLine y={minus3SD} label="-3DP" stroke="#ef4444" />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            activeDot={{ r: 8 }}
            dot={(props) => {
               const { cx, cy, payload } = props;
               let fill = "#3b82f6"; // default primary
               if (payload.status === 'WARNING') fill = "#eab308";
               if (payload.status === 'ERROR') fill = "#ef4444";
               
               return (
                 <circle cx={cx} cy={cy} r={4} fill={fill} stroke="none" />
               );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QCChart;
