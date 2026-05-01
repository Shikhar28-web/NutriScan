'use client';

import { motion } from 'framer-motion';
import { riskColor, riskLabel } from '@/lib/api';
import { DiseaseRisk } from '@/lib/types';

interface DiseaseRiskPanelProps {
  risks: Record<string, DiseaseRisk>;
  nutriments?: Record<string, number>;
}

const DISEASE_LABELS: Record<string, { label: string; icon: string }> = {
  diabetes:      { label: 'Type 2 Diabetes',   icon: '🩸' },
  heart_disease: { label: 'Heart Disease',      icon: '❤️' },
  obesity:       { label: 'Obesity',            icon: '⚖️' },
  hypertension:  { label: 'Hypertension',       icon: '💊' },
  liver_disease: { label: 'Liver Disease',      icon: '🫀' },
  cancer:        { label: 'Cancer Risk',        icon: '🔬' },
};

interface RiskBarProps {
  name: string;
  data: DiseaseRisk;
}

function RiskBar({ name, data }: RiskBarProps) {
  const meta  = DISEASE_LABELS[name] ?? { label: name.replace(/_/g, ' '), icon: '⚠️' };
  const pct   = Math.round(data.risk * 100);
  const color = riskColor(data.risk);
  const label = riskLabel(data.risk);

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-slate-300 font-medium">
          <span className="text-base">{meta.icon}</span>
          {meta.label}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {label}
          </span>
          <span className="font-bold tabular-nums text-white w-9 text-right">{pct}%</span>
        </div>
      </div>

      {/* Bar track */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
      </div>

      {/* Confidence line */}
      <p className="text-xs text-slate-600">
        Confidence: {Math.round(data.confidence * 100)}%
      </p>
    </motion.div>
  );
}

function explainRisk(name: string, risk: DiseaseRisk, nutriments?: Record<string, number>): string {
  const sugar = nutriments?.sugar_100g ?? 0;
  const salt = nutriments?.salt_100g ?? 0;
  const satFat = nutriments?.saturated_fat_100g ?? 0;
  const fat = nutriments?.fat_100g ?? 0;
  const kcal = nutriments?.energy_kcal ?? 0;
  const additives = nutriments?.additives_count ?? 0;
  const fiber = nutriments?.fiber_100g ?? 0;

  const highSignals: string[] = [];
  if (sugar > 22.5) highSignals.push('high sugar');
  if (salt > 1.5) highSignals.push('high salt');
  if (satFat > 5) highSignals.push('high saturated fat');
  if (fat > 17.5) highSignals.push('high total fat');
  if (kcal > 450) highSignals.push('high energy density');
  if (additives >= 5) highSignals.push('higher additive load');

  const protectiveSignals: string[] = [];
  if (fiber >= 6) protectiveSignals.push('good fiber');

  const trigger = highSignals.length > 0 ? highSignals.slice(0, 2).join(' and ') : 'mixed nutrient profile';
  const protection = protectiveSignals.length > 0 ? ` Protective factor: ${protectiveSignals.join(', ')}.` : '';

  if (name === 'diabetes') {
    return `Driven mainly by ${trigger}.${protection}`;
  }
  if (name === 'heart_disease') {
    return `Most influenced by ${trigger}, especially sodium and saturated-fat balance.${protection}`;
  }
  if (name === 'obesity') {
    return `Reflects sugar-energy-fat density pattern (${trigger}) and expected intake load.${protection}`;
  }
  if (name === 'hypertension') {
    return `Primarily linked to sodium profile (${trigger}) with processing markers.${protection}`;
  }
  return `Estimated from nutrient and processing pattern (${trigger}).${protection}`;
}

export default function DiseaseRiskPanel({ risks, nutriments }: DiseaseRiskPanelProps) {
  const entries = Object.entries(risks).sort((a, b) => b[1].risk - a[1].risk);

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-5">
      <h2 className="text-base font-semibold text-slate-400 uppercase tracking-widest">
        Disease Risk Indicators
      </h2>

      <motion.div
        className="flex flex-col gap-5"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
      >
        {entries.length === 0 ? (
          <p className="text-slate-500 text-sm">No risk data available.</p>
        ) : (
          entries.map(([name, data]) => {
            const details = explainRisk(name, data, nutriments);
            return (
              <div key={name} className="space-y-2">
                <RiskBar name={name} data={data} />
                <p className="text-xs text-slate-500 leading-relaxed pl-0.5">{details}</p>
              </div>
            );
          })
        )}
      </motion.div>

      <p className="text-xs text-slate-700 border-t border-white/5 pt-3">
        Estimates based on nutritional composition. Not a medical diagnosis.
      </p>
    </div>
  );
}
