'use client';

import { motion } from 'framer-motion';
import { RecommendationItem } from '@/lib/types';
import { healthScoreColor, healthScoreLabel } from '@/lib/api';
import { Sparkles, ChevronRight } from 'lucide-react';

interface RecommendationSectionProps {
  items: RecommendationItem[];
}

interface RecommendationCardProps {
  item: RecommendationItem;
}

function RecommendationCard({ item }: RecommendationCardProps) {
  const score = item.health_score ?? 0;
  const color = healthScoreColor(score);
  const label = healthScoreLabel(score);

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: 30 }, show: { opacity: 1, x: 0 } }}
      className="glass rounded-xl p-5 flex flex-col gap-4 min-w-[220px] max-w-[240px] flex-shrink-0 hover:border-green-500/30 transition-colors duration-200 cursor-pointer"
      whileHover={{ scale: 1.02 }}
    >
      {/* Score badge */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-extrabold"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {score}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-white text-sm font-semibold leading-snug line-clamp-2">
          {item.product?.product_name ?? 'Product'}
        </p>
        {item.product?.brand && <p className="text-slate-500 text-xs">{item.product.brand}</p>}
      </div>

      <div
        className="text-xs px-2.5 py-1 rounded-full font-medium self-start"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {label}
      </div>
    </motion.div>
  );
}

export default function RecommendationSection({ items }: RecommendationSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-slate-500" />
          <h2 className="text-base font-semibold text-slate-400 uppercase tracking-widest">
            Healthier Alternatives
          </h2>
        </div>
        <ChevronRight size={16} className="text-slate-600" />
      </div>

      {/* Horizontal scroll */}
      <motion.div
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
      >
        {items.map((item, i) => (
          <RecommendationCard key={item.product?.barcode ?? i} item={item} />
        ))}
      </motion.div>
    </div>
  );
}
