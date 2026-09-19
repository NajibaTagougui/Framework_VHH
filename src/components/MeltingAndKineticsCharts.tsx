import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { VhhCandidate } from '../types';
import { generateMeltingCurve, generateSensorgramKinetics } from '../utils/biophysics';
import { Thermometer, Activity, Sliders } from 'lucide-react';

interface MeltingAndKineticsChartsProps {
  candidate: VhhCandidate;
}

export function MeltingAndKineticsCharts({ candidate }: MeltingAndKineticsChartsProps) {
  const [activeChart, setActiveChart] = useState<'thermal' | 'kinetics'>('thermal');

  const meltingData = generateMeltingCurve(candidate.metrics.meltingTempTm);
  const kineticsData = generateSensorgramKinetics(candidate.metrics.predictedKdNm);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      
      {/* Tab Switcher & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            {activeChart === 'thermal' ? (
              <>
                <Thermometer className="w-4 h-4 text-rose-400" />
                <span>Thermal Denaturation Melting Curve (DSF / CD)</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>SPR Binding Kinetics Sensorgram (k<sub>on</sub> / k<sub>off</sub>)</span>
              </>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeChart === 'thermal'
              ? `Two-state cooperative unfolding equilibrium. Measured midpoint Tm: ${candidate.metrics.meltingTempTm}°C`
              : `Real-time association (0-120s) and dissociation (120-240s) phases for Kd: ${candidate.metrics.predictedKdNm} nM`}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveChart('thermal')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeChart === 'thermal'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Thermal T<sub>m</sub> Curve
          </button>
          <button
            onClick={() => setActiveChart('kinetics')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeChart === 'kinetics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SPR Kinetics Sensorgram
          </button>
        </div>
      </div>

      {/* Chart Visualization Area */}
      <div className="h-64 w-full">
        {activeChart === 'thermal' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={meltingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="temperature"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit="°C"
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                itemStyle={{ color: '#f43f5e', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(val: any) => [`${val}% Unfolded`, 'Thermal State']}
                labelFormatter={(temp) => `Temperature: ${temp} °C`}
              />
              <ReferenceLine
                x={candidate.metrics.meltingTempTm}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: `T_m = ${candidate.metrics.meltingTempTm}°C`,
                  fill: '#10b981',
                  fontSize: 12,
                  position: 'top'
                }}
              />
              <Line
                type="monotone"
                dataKey="unfoldedPct"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#f43f5e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kineticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="timeSec"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit="s"
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit=" RU"
                domain={[0, 140]}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                itemStyle={{ color: '#06b6d4', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(val: any) => [`${val} RU`, 'Response Units']}
                labelFormatter={(t) => `Time: ${t} seconds`}
              />
              <ReferenceLine
                x={120}
                stroke="#64748b"
                strokeDasharray="3 3"
                label={{ value: 'Dissociation Starts', fill: '#94a3b8', fontSize: 11, position: 'insideTopRight' }}
              />
              <Line
                type="monotone"
                dataKey="responseRU"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#06b6d4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
        <div className="flex items-center gap-4 font-mono">
          <span>Target: {candidate.target}</span>
          <span>Antigen Affinity: K<sub>d</sub> = {candidate.metrics.predictedKdNm} nM</span>
          <span>ΔG = {candidate.metrics.deltaGKcal} kcal/mol</span>
        </div>
        <div className="text-emerald-400 font-medium flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5" />
          <span>Thermodynamic Stability: {candidate.metrics.meltingTempTm >= 70 ? 'High (>70°C)' : 'Moderate'}</span>
        </div>
      </div>

    </div>
  );
}
