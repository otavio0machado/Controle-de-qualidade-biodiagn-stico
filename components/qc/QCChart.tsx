
import React from 'react';
import {
  ComposedChart,
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

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const rules = payload.westgardRules || [];
  
  let fill = "#22c55e"; // Green (OK)
  let r = 4;

  if (rules.length > 0) {
    if (rules.includes('1-2s') && rules.length === 1) {
      fill = "#eab308"; // Yellow (Warning)
      r = 5;
    } else {
      fill = "#ef4444"; // Red (Error/Rejection)
      r = 6;
    }
  }

  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke="white" strokeWidth={2} />;
};

const QCChart: React.FC<QCChartProps> = ({ data, config }) => {
  const { mean, sd } = config;
  
  // Calculate limits
  const plus1 = mean + sd;
  const plus2 = mean + 2 * sd;
  const plus3 = mean + 3 * sd;
  const minus1 = mean - sd;
  const minus2 = mean - 2 * sd;
  const minus3 = mean - 3 * sd;

  // Determine Y-Axis Domain to fit points comfortably
  const values = data.map(d => d.value);
  const minVal = Math.min(...values, minus3 * 0.98); // Ensure -3SD is visible
  const maxVal = Math.max(...values, plus3 * 1.02);  // Ensure +3SD is visible
  
  // Add padding
  const yDomain = [
    minVal - (sd * 0.5),
    maxVal + (sd * 0.5)
  ];

  const formattedData = data.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  }));

  return (
    <div className="w-full h-[450px] bg-surface p-4 rounded-xl border border-gray-700 shadow-md">
      <h3 className="text-lg font-bold text-gray-200 mb-2">Gráfico Levey-Jennings</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="displayDate" 
            stroke="#94a3b8" 
            tick={{fontSize: 11}}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={yDomain} 
            stroke="#94a3b8" 
            tick={{fontSize: 11}}
            width={40}
            tickFormatter={(val) => val.toFixed(1)}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
            formatter={(value: number, name: string, props: any) => {
               const rules = props.payload.westgardRules;
               return [
                 <div key="tooltip">
                   <div>Valor: {value}</div>
                   {rules && rules.length > 0 && (
                     <div className="text-red-400 font-bold mt-1">Regras: {rules.join(', ')}</div>
                   )}
                 </div>, 
                 ''
               ];
            }}
            labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
          />
          
          {/* Mean */}
          <ReferenceLine y={mean} stroke="#10b981" strokeWidth={2} label={{ value: 'X', fill: '#10b981', fontSize: 12, position: 'right' }} />
          
          {/* SD Lines */}
          <ReferenceLine y={plus1} stroke="#64748b" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={minus1} stroke="#64748b" strokeDasharray="4 4" strokeOpacity={0.5} />
          
          <ReferenceLine y={plus2} stroke="#eab308" strokeDasharray="4 4" label={{ value: '+2s', fill: '#eab308', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={minus2} stroke="#eab308" strokeDasharray="4 4" label={{ value: '-2s', fill: '#eab308', fontSize: 10, position: 'right' }} />
          
          <ReferenceLine y={plus3} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '+3s', fill: '#ef4444', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={minus3} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '-3s', fill: '#ef4444', fontSize: 10, position: 'right' }} />

          <Line
            type="linear"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QCChart;
