'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, ExternalLink, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HealthScoreGauge from '@/components/HealthScoreGauge';
import NutritionPanel from '@/components/NutritionPanel';
import DiseaseRiskPanel from '@/components/DiseaseRiskPanel';
import ProcessingLevelCard from '@/components/ProcessingLevelCard';
import AgeGroupImpactGrid from '@/components/AgeGroupImpactGrid';
import ConsumptionGuidance from '@/components/ConsumptionGuidance';
import IngredientAnalysis from '@/components/IngredientAnalysis';
import RecommendationSection from '@/components/RecommendationSection';
import ChatAssistant from '@/components/ChatAssistant';
import axios from 'axios';
import { analyzeFood, getRecommendations } from '@/lib/api';
import { recordSearch } from '@/lib/auth';
import { AnalyzeResponse, RecommendationItem } from '@/lib/types';

function isAnalyzeResponse(value: unknown): value is AnalyzeResponse {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return !!obj.product && typeof obj.product === 'object';
}

function getApiErrorMessage(value: unknown, fallback: string): string {
  if (!value || typeof value !== 'object') return fallback;
  const obj = value as Record<string, unknown>;
  if (typeof obj.error === 'string' && obj.error.trim()) return obj.error;
  if (typeof obj.detail === 'string' && obj.detail.trim()) return obj.detail;
  return fallback;
}

function buildFallbackAnalysisMarkdown(data: AnalyzeResponse): string {
  const nutriments = data.product?.nutriments ?? {};
  const sugar = Number(nutriments.sugar_100g ?? 0);
  const fat = Number(nutriments.fat_100g ?? 0);
  const satFat = Number(nutriments.saturated_fat_100g ?? 0);
  const salt = Number(nutriments.salt_100g ?? 0);
  const fiber = Number(nutriments.fiber_100g ?? 0);
  const protein = Number(nutriments.proteins_100g ?? 0);
  const energy = Number(nutriments.energy_kcal ?? 0);
  const additives = Number(nutriments.additives_count ?? 0);

  const diseaseEntries = Object.entries(data.disease_risks ?? {}).sort((a, b) => b[1].risk - a[1].risk);
  const diseaseSummary = diseaseEntries.length
    ? diseaseEntries.map(([key, v]) => `${key.replace(/_/g, ' ')} ${Math.round(v.risk * 100)}%`).join(', ')
    : 'not available';

  const pros: string[] = [];
  const cons: string[] = [];
  if (fiber >= 6) pros.push(`Good fiber density (${fiber.toFixed(1)} g/100 g).`);
  if (protein >= 10) pros.push(`Useful protein contribution (${protein.toFixed(1)} g/100 g).`);
  if (sugar > 22.5) cons.push(`High sugar (${sugar.toFixed(1)} g/100 g; high > 22.5 g).`);
  if (salt > 1.5) cons.push(`High salt (${salt.toFixed(1)} g/100 g; high > 1.5 g).`);
  if (satFat > 5) cons.push(`High saturated fat (${satFat.toFixed(1)} g/100 g; high > 5 g).`);
  if (fat > 17.5) cons.push(`High total fat (${fat.toFixed(1)} g/100 g; high > 17.5 g).`);
  if (energy > 450) cons.push(`High energy density (${energy.toFixed(1)} kcal/100 g).`);
  if (additives >= 5) cons.push(`Higher additive load (${additives.toFixed(0)} additives).`);
  if (pros.length === 0) pros.push('No strong protective nutrition marker was detected in the available fields.');
  if (cons.length === 0) cons.push('No major traffic-light threshold was exceeded in the available data.');

  return [
    '### Ingredient & Nutrition Analysis',
    '',
    '#### Positive Signals',
    ...pros.map((line) => `- ${line}`),
    '',
    '#### Caution Signals',
    ...cons.map((line) => `- ${line}`),
    '',
    '#### Risk Interpretation',
    `- Disease-risk profile: ${diseaseSummary}.`,
    `- Processing profile: ${data.processing_level?.label ?? 'Unknown'} (NOVA ${data.processing_level?.nova_group ?? 'unknown'}).`,
    `- Composite health score: ${data.health_score.toFixed(2)}/100.`,
  ].join('\n');
}

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass rounded-2xl p-6 animate-pulse ${className}`}>
      <div className="h-4 bg-white/5 rounded-lg w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-5/6" />
        <div className="h-3 bg-white/5 rounded w-4/6" />
      </div>
    </div>
  );
}

function DashboardContent() {
  const params     = useSearchParams();
  const barcode    = params.get('barcode') ?? '';
  const name       = params.get('name') ?? '';
  const imageMode  = params.get('image') === '1';
  // Use barcode if provided, otherwise use product name
  const query      = barcode || name;

  const [data,  setData]  = useState<AnalyzeResponse | null>(null);
  const [recs,  setRecs]  = useState<RecommendationItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Image-upload path: result was stored in sessionStorage before navigation.
    if (imageMode) {
      try {
        const cached = sessionStorage.getItem('nutriscan_image_result');
        if (cached) {
          const parsed = JSON.parse(cached) as unknown;
          if (isAnalyzeResponse(parsed)) {
            setData(parsed);
            void recordSearch({
              query: 'image-upload',
              query_type: 'image_search',
              product_name: parsed.product?.product_name ?? null,
              barcode: parsed.product?.barcode ?? 'image-upload',
              result_summary: {
                health_score: parsed.health_score,
                processing_level: parsed.processing_level?.label,
              },
            });
          } else {
            setError(getApiErrorMessage(parsed, 'Image analysis did not return product data. Please try another image.'));
          }
        } else {
          setError('Image analysis result not found. Please upload an image again.');
        }
      } catch {
        setError('Failed to load image analysis result.');
      }
      setLoading(false);
      return;
    }

    if (!query) {
      setError('No product provided.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const result = await analyzeFood(query);
        if (!isAnalyzeResponse(result)) {
          throw new Error('Invalid analysis response from server.');
        }
        if (!cancelled) {
          setData(result);
          // Cache for ChatWrapper to consume without an extra API call
          try { sessionStorage.setItem(`nutriscan_${query}`, JSON.stringify(result)); } catch (_) {}
          void recordSearch({
            query,
            query_type: barcode ? 'barcode_search' : 'product_search',
            product_name: result.product?.product_name ?? null,
            barcode: result.product?.barcode ?? (barcode || null),
            result_summary: {
              health_score: result.health_score,
              product_name: result.product?.product_name,
              brand: result.product?.brand,
              processing_level: result.processing_level?.label,
            },
          });
          // Fire recommendations asynchronously; don't block the main render
          const recommendationBarcode = result.product?.barcode ?? query;
          if (recommendationBarcode && recommendationBarcode !== 'image-upload') {
            getRecommendations(recommendationBarcode)
              .then(r => { if (!cancelled) setRecs(r); })
              .catch(() => {});
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          let msg = 'Failed to analyse product.';
          if (axios.isAxiosError(err)) {
            if (err.response?.status === 404 || err.response?.data?.error?.includes('not found')) {
              msg = `Product "${query}" not found in database. Try searching with a different product name or barcode number.`;
            } else if (err.response?.status === 422) {
              msg = 'Invalid input. Please enter a valid product name or barcode.';
            } else if (err.response?.status === 503) {
              msg = 'Local ML service is still warming up or temporarily unavailable. Wait a few seconds and retry.';
            } else if (err.code === 'ECONNABORTED') {
              msg = 'Analysis is taking longer than expected. The ML model may still be loading. Please retry in a few seconds.';
            } else if (!err.response) {
              msg = 'Cannot reach the local analysis service. Ensure the Next.js dev server is running and PYTHON_BIN points to a valid venv python.';
            } else {
              msg = getApiErrorMessage(err.response?.data, `Server error (${err.response.status}). Please try again.`);
            }
          } else if (err instanceof Error && err.message.includes('Product not found')) {
            msg = `Product "${query}" not found in OpenFoodFacts database. Try a different product name.`;
          }
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [query, imageMode]);

  /* ── Loading state ─────────────────────── */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 bg-white/5 rounded-xl w-24 animate-pulse" />
          <div className="h-6 bg-white/5 rounded w-48 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 flex flex-col items-center gap-4 animate-pulse">
              <div className="w-52 h-52 rounded-full bg-white/5" />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard className="mt-6" />
      </div>
    );
  }

  /* ── Error state ───────────────────────── */
  if (error || !data || !data.product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-6">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="text-2xl font-bold text-white">Analysis Failed</h2>
        <p className="text-slate-400">{error || 'An unknown error occurred.'}</p>
        <div className="flex gap-3">
          <Link href="/scan" className="px-5 py-2.5 rounded-xl bg-green-500 text-black font-semibold text-sm hover:bg-green-400 transition-colors">
            Try Again
          </Link>
          <Link href="/" className="px-5 py-2.5 rounded-xl glass font-semibold text-sm text-slate-300 hover:text-white transition-colors">
            Home
          </Link>
        </div>
      </div>
    );
  }

  const { product, health_score, disease_risks, processing_level, age_group_impacts, consumption_disclaimer, ingredient_analysis } = data;

  /* ── Main dashboard ────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-10"
    >
      {/* Back button */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/scan"
          className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={15} />
          New Scan
        </Link>
        <span className="text-slate-700">/</span>
        <p className="text-slate-400 text-sm truncate">
          {product.product_name ?? `Barcode ${barcode}`}
        </p>
      </div>

      {/* Product header */}
      <div className="glass rounded-2xl p-5 md:p-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 mb-8 border border-white/5">
        {product.image_url ? (
          <div className="rounded-xl overflow-hidden bg-white/[0.03] border border-white/10 flex items-center justify-center p-2 min-h-[240px]">
            <Image
              src={product.image_url}
              alt={product.product_name ?? 'Product image'}
              width={440}
              height={440}
              className="w-full max-h-[340px] h-auto object-contain"
              unoptimized
            />
          </div>
        ) : (
          <div className="rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center min-h-[240px]">
            <Package size={22} className="text-slate-400" />
          </div>
        )}

        <div className="min-w-0 flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Analysed Product</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight break-words">
              {product.product_name ?? 'Unknown Product'}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Brand</p>
              <p className="text-sm text-slate-200 mt-1 break-words">{product.brand || 'Unknown'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Barcode</p>
              <p className="text-sm text-slate-200 mt-1 font-mono break-all">
                {product.barcode === 'image-upload' ? 'Image Upload' : (barcode || product.barcode)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Health Score</p>
              <p className="text-sm text-slate-200 mt-1">{health_score.toFixed(2)} / 100</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Processing</p>
              <p className="text-sm text-slate-200 mt-1 break-words">{processing_level?.label ?? 'Unknown'}</p>
            </div>
          </div>

          {product.barcode !== 'image-upload' && (
            <div>
              <a
                href={`https://world.openfoodfacts.org/product/${encodeURIComponent(barcode || product.barcode)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ExternalLink size={13} />
                View Source on OpenFoodFacts
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Row 1: Gauge + Nutrition + Disease Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="flex flex-col gap-6">
          <HealthScoreGauge score={health_score} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <NutritionPanel nutriments={product.nutriments} />
        </div>
      </div>

      <div className="mb-6">
        <DiseaseRiskPanel risks={disease_risks} nutriments={product.nutriments} />
      </div>

      {/* Row 2: Processing Level + Consumption Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {processing_level && <ProcessingLevelCard data={processing_level} />}
        {consumption_disclaimer && <ConsumptionGuidance data={consumption_disclaimer} />}
      </div>

      {/* Row 3: Age Group Impacts */}
      {age_group_impacts && Object.keys(age_group_impacts).length > 0 && (
        <div className="mb-6">
          <AgeGroupImpactGrid impacts={age_group_impacts} />
        </div>
      )}

      {/* Row 4: Ingredient Analysis */}
      {(ingredient_analysis || data) && (
        <div className="mb-6">
          <IngredientAnalysis markdown={ingredient_analysis || buildFallbackAnalysisMarkdown(data)} />
        </div>
      )}

      {/* Row 5: Recommendations */}
      {recs.length > 0 && (
        <div className="mb-6">
          <RecommendationSection items={recs} />
        </div>
      )}

      {/* Ingredients text (collapsible) */}
      {product.ingredients_text && (
        <details className="glass rounded-2xl p-6 mb-6 group cursor-pointer">
          <summary className="text-slate-400 text-sm font-semibold uppercase tracking-widest list-none flex items-center justify-between">
            Full Ingredients List
            <span className="text-slate-600 group-open:rotate-90 transition-transform duration-200">›</span>
          </summary>
          <p className="mt-4 text-slate-500 text-sm leading-relaxed">
            {product.ingredients_text}
          </p>
        </details>
      )}

      {/* Spacer for floating chat */}
      <div className="h-20" />
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />
      <div className="pt-16">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </div>

      {/* The chat assistant uses the already-loaded analysis data */}
      <Suspense fallback={null}>
        <ChatWrapper />
      </Suspense>
    </main>
  );
}

// ChatWrapper reads the barcode and stores analysis data for the chat
// It does NOT make its own API call — it relies on a broadcast via sessionStorage
// set by DashboardContent after its own fetch.
function ChatWrapper() {
  const params  = useSearchParams();
  const barcode = params.get('barcode') ?? '';
  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);

  useEffect(() => {
    if (!barcode) return;
    // Try reading from session storage (set by DashboardContent)
    const cached = sessionStorage.getItem(`nutriscan_${barcode}`);
    if (cached) {
      try { setAnalysisData(JSON.parse(cached)); return; } catch (_) { /* ignore */ }
    }
    // Fallback: fetch independently
    analyzeFood(barcode).then(setAnalysisData).catch(() => {});
  }, [barcode]);

  return <ChatAssistant productContext={analysisData} />;
}
