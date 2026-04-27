'use client';

import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Barcode,
  Camera,
  ShieldAlert,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { useMemo, useRef } from 'react';

const keywords = [
  'Protein',
  'Carbohydrate',
  'Fiber',
  'Vitamins',
  'B12',
  'Iron',
  'Calcium',
  'Electrolytes',
  '⚠️ Warnings',
  'Sugar',
  'Sodium',
  'Trans Fat',
  'Preservatives',
  'Additives',
  '💚 Health',
  'Healthy',
  'Immunity',
  'Energy ⚡',
  'Hydration 💧',
  'Balance',
];

const scanMethods: Array<{ icon: typeof Camera; title: string; description: string }> = [
  { icon: Camera, title: 'Scan via Camera', description: 'Capture nutrition panels with live OCR extraction.' },
  { icon: Barcode, title: 'Enter Barcode', description: 'Type barcode digits for instant nutrition decoding.' },
  { icon: UploadCloud, title: 'Upload Nutrition Label', description: 'Upload label images and let AI detect hidden signals.' },
];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true, amount: 0.2 },
};

export default function LandingPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ['start start', 'end end'],
  });

  return (
    <main ref={pageRef} className="relative overflow-x-hidden bg-[#06080f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,255,153,0.16),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,159,67,0.14),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(88,116,255,0.1),transparent_40%)]" />
      <FloatingKeywords />
      <MovingObject progress={scrollYProgress} />
      <Hero onStart={() => router.push('/scan')} />
      <WhatIsNutriScan />
      <ScanSection />
      <Dashboard />
      <DailyLifeImpact />
      <CTA onStart={() => router.push('/scan')} />
    </main>
  );
}

function FloatingKeywords() {
  const floatingKeywords = useMemo(
    () =>
      keywords.map((word, idx) => ({
        word,
        left: `${(idx * 13 + 9) % 92}%`,
        top: `${(idx * 19 + 7) % 88}%`,
        size: `${0.9 + ((idx * 7) % 8) / 10}rem`,
        duration: 12 + (idx % 5) * 2.4,
        delay: idx * 0.5,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {floatingKeywords.map(item => (
        <motion.span
          key={item.word}
          className="absolute select-none font-medium tracking-wide text-white"
          style={{
            left: item.left,
            top: item.top,
            fontSize: item.size,
            opacity: 0.06 + (item.word.length % 5) * 0.013,
            filter: 'blur(1.2px)',
          }}
          animate={{ x: [0, 18, -12, 0], y: [0, -16, 10, 0] }}
          transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {item.word}
        </motion.span>
      ))}
    </div>
  );
}

function MovingObject({ progress }: { progress: MotionValue<number> }) {
  const x = useTransform(progress, [0, 0.35, 0.65, 1], ['0%', '-26vw', '24vw', '0%']);
  const y = useTransform(progress, [0, 1], ['42vh', '72vh']);
  const scale = useTransform(progress, [0, 0.4, 0.8, 1], [1.18, 0.95, 0.9, 1.02]);
  const rotate = useTransform(progress, [0, 1], [0, 120]);
  const extrasOpacity = useTransform(progress, [0, 0.045, 0.09, 1], [1, 1, 0, 0]);
  const extrasScale = useTransform(progress, [0, 0.09, 1], [1, 0.9, 0.9]);

  return (
    <motion.div className="pointer-events-none fixed left-[72%] top-0 z-20 -translate-x-1/2 md:left-[76%] lg:left-[80%]" style={{ x, y, scale, rotate }} aria-hidden>
      <motion.div className="absolute inset-0" style={{ opacity: extrasOpacity, scale: extrasScale }}>
        <FloatingMiniFood className="left-[-78px] top-[6px]" kind="banana" />
        <FloatingMiniFood className="right-[-70px] top-[8px]" kind="pineapple" />
        <FloatingMiniFood className="left-[-96px] bottom-[34px]" kind="chocolate" />
        <FloatingMiniFood className="right-[-95px] bottom-[30px]" kind="chips" />
        <FloatingMiniFood className="left-[-24px] bottom-[-58px]" kind="can" />
      </motion.div>
      <motion.div
        className="relative h-44 w-44"
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute left-1/2 top-6 h-28 w-24 -translate-x-[65%] rounded-full bg-gradient-to-br from-[#ffb27d] via-[#ff6b5d] to-[#d7263d] shadow-[inset_-12px_-10px_18px_rgba(98,12,22,0.45),0_26px_56px_rgba(0,0,0,0.48)]" />
        <div className="absolute right-1/2 top-6 h-28 w-24 translate-x-[65%] rounded-full bg-gradient-to-br from-[#ffb27d] via-[#ff6b5d] to-[#d7263d] shadow-[inset_12px_-10px_18px_rgba(98,12,22,0.45),0_26px_56px_rgba(0,0,0,0.48)]" />
        <div className="absolute left-1/2 top-2 h-8 w-2 -translate-x-1/2 rounded-full bg-[#5b3621]" />
        <div className="absolute left-1/2 top-1 h-7 w-12 -translate-x-1 rounded-full bg-gradient-to-r from-[#00ff99] to-[#67e8a3] opacity-90 shadow-[0_0_16px_rgba(0,255,153,0.35)]" />
        <div className="absolute left-1/2 top-11 h-10 w-6 -translate-x-[95%] rounded-full bg-white/20 blur-[1px]" />
      </motion.div>
    </motion.div>
  );
}

function FloatingMiniFood({ className, kind }: { className: string; kind: 'banana' | 'pineapple' | 'chocolate' | 'chips' | 'can' }) {
  const common =
    'absolute h-14 w-14 rounded-2xl border border-white/20 shadow-[0_14px_28px_rgba(0,0,0,0.38)]';

  if (kind === 'banana') {
    return (
      <motion.div
        className={`${className} ${common} rounded-[2rem] bg-gradient-to-br from-[#ffe27a] via-[#ffcf48] to-[#f4b400]`}
        animate={{ y: [0, -5, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute left-1 top-1/2 h-2 w-10 -translate-y-1/2 rounded-full bg-[#fff2b0]/60 blur-[0.5px]" />
      </motion.div>
    );
  }

  if (kind === 'pineapple') {
    return (
      <motion.div
        className={`${className} ${common} bg-gradient-to-br from-[#ffcc66] via-[#f59e0b] to-[#d97706]`}
        animate={{ y: [0, -4, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute -top-3 left-1/2 h-4 w-5 -translate-x-1/2 rounded-full bg-[#22c55e]" />
        <div className="absolute inset-2 rounded-xl border border-[#fde68a]/35" />
      </motion.div>
    );
  }

  if (kind === 'chocolate') {
    return (
      <motion.div
        className={`${className} ${common} rounded-lg bg-gradient-to-br from-[#8b5a2b] via-[#6b3f21] to-[#3f2513]`}
        animate={{ y: [0, -3, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-x-2 top-2 h-1 rounded bg-[#c58f5e]/50" />
        <div className="absolute inset-x-2 bottom-2 h-1 rounded bg-[#2f1a0e]/65" />
      </motion.div>
    );
  }

  if (kind === 'chips') {
    return (
      <motion.div
        className={`${className} ${common} bg-gradient-to-br from-[#ff9f43] via-[#f97316] to-[#ea580c]`}
        animate={{ y: [0, -4, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-x-3 top-3 h-2 rounded-full bg-[#ffd6ad]/50" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`${className} ${common} rounded-full bg-gradient-to-br from-[#67e8f9] via-[#38bdf8] to-[#0284c7]`}
      animate={{ y: [0, -5, 0], rotate: [0, 6, 0] }}
      transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="absolute inset-x-3 top-1 h-2 rounded-full bg-white/40" />
    </motion.div>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative z-10 min-h-screen px-6 pb-20 pt-10 md:px-12 lg:px-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/[0.03] px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-white/85">
          <Sparkles className="h-4 w-4 text-[#00ff99]" />
          NUTRISCAN
        </div>
        <button type="button" onClick={onStart} className="rounded-full border border-[#00ff99]/40 bg-[#00ff99]/10 px-4 py-2 text-xs tracking-[0.16em] text-[#00ff99] transition hover:bg-[#00ff99]/20">
          START SCANNING
        </button>
      </div>

      <div className="mx-auto mt-24 max-w-6xl">
        <motion.div {...fadeUp} className="max-w-2xl">
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Scan Your Food.
            <br />
            <span className="bg-gradient-to-r from-[#00ff99] via-white to-[#ff9f43] bg-clip-text text-transparent">Understand What You Eat.</span>
          </h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            NutriScan converts confusing labels into clear, science-backed nutrition insights for smarter everyday choices.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3 text-sm font-semibold tracking-[0.16em] text-black shadow-[0_0_36px_rgba(255,255,255,0.35)] transition hover:translate-y-[-2px]"
          >
            START SCANNING
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function WhatIsNutriScan() {
  return (
    <section className="relative z-10 px-6 py-24 md:px-12 lg:px-20">
      <motion.div {...fadeUp} className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-xs tracking-[0.24em] text-[#00ff99]/80">WHAT IS NUTRISCAN</p>
          <h2 className="mt-4 text-3xl font-semibold md:text-5xl">Reading labels is hard. Understanding food should not be.</h2>
          <p className="mt-5 max-w-2xl text-white/70">
            NutriScan uses AI to decode ingredients, nutrients, and warning signals into simple language you can use at the shelf.
          </p>
        </div>
        <div className="grid gap-4">
          {[
            'Messy nutrition labels become clear insights',
            'Hidden additives and sugar spikes are flagged early',
            'Health scoring helps daily food decisions',
          ].map(item => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/80">
              {item}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function ScanSection() {
  return (
    <section className="relative z-10 px-6 py-24 md:px-12 lg:px-20">
      <motion.div {...fadeUp} className="mx-auto max-w-6xl">
        <p className="text-xs tracking-[0.24em] text-[#ff9f43]/90">SCAN YOUR PACKAGE</p>
        <h3 className="mt-4 text-3xl font-semibold md:text-5xl">Choose any method. Get instant extraction.</h3>
        <div className="data-grid-overlay mt-12 grid gap-6 md:grid-cols-3">
          {scanMethods.map(method => (
            <motion.article
              key={method.title}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
            >
              <motion.div whileHover={{ rotate: 6 }}>
                <method.icon className="h-8 w-8 text-[#00ff99] transition group-hover:text-[#ff9f43]" />
              </motion.div>
              <h4 className="mt-6 text-xl font-medium">{method.title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{method.description}</p>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function Dashboard() {
  return (
    <section className="relative z-10 px-6 py-24 md:px-12 lg:px-20">
      <motion.div {...fadeUp} className="mx-auto max-w-6xl">
        <p className="text-xs tracking-[0.24em] text-[#00ff99]/90">INSIGHTS DASHBOARD</p>
        <h3 className="mt-4 text-3xl font-semibold md:text-5xl">Health intelligence unlocked in real time.</h3>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-7">
            <div className="flex items-center justify-between">
              <span className="text-sm tracking-[0.16em] text-white/60">HEALTH SCORE</span>
              <span className="text-2xl font-semibold text-[#00ff99]">82/100</span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '82%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#00ff99] to-[#ff9f43]"
              />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <Metric label="Calories" value="220" tone="text-white" />
              <Metric label="Sugar" value="14g" tone="text-[#ff9f43]" />
              <Metric label="Fat" value="9g" tone="text-[#00ff99]" />
            </div>
          </div>

          <div className="grid gap-4">
            <GlassAlert icon={AlertTriangle} title="Warnings" body="High sugar load and additive markers detected." tone="orange" />
            <GlassAlert icon={ShieldAlert} title="Disease Risk Indicators" body="Moderate diabetes and heart-health risk signals found." tone="red" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function DailyLifeImpact() {
  return (
    <section className="relative z-10 px-6 py-24 md:px-12 lg:px-20">
      <motion.div {...fadeUp} className="mx-auto max-w-6xl">
        <p className="text-xs tracking-[0.24em] text-[#ff9f43]/90">DAILY LIFE IMPACT</p>
        <h3 className="mt-4 text-3xl font-semibold md:text-5xl">From confusion to confident choices.</h3>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#ff4d4d]/25 bg-[#ff4d4d]/10 p-6">
            <p className="text-xs tracking-[0.14em] text-[#ff4d4d]">BEFORE NUTRISCAN</p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>Confusing labels and marketing-heavy claims.</li>
              <li>Hard to compare sugar, sodium, and additives quickly.</li>
              <li>Food decisions based on guesswork.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-[#00ff99]/25 bg-[#00ff99]/10 p-6">
            <p className="text-xs tracking-[0.14em] text-[#00ff99]">AFTER NUTRISCAN</p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>AI explains what matters for your goals instantly.</li>
              <li>Hidden ingredients and warnings become obvious.</li>
              <li>Safer, smarter grocery choices every day.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function CTA({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative z-10 px-6 pb-28 pt-14 md:px-12 lg:px-20">
      <motion.div
        {...fadeUp}
        className="mx-auto flex max-w-5xl flex-col items-center rounded-[2.5rem] border border-white/10 bg-gradient-to-r from-[#00ff99]/15 via-white/[0.04] to-[#ff9f43]/15 px-8 py-14 text-center"
      >
        <p className="text-sm tracking-[0.2em] text-white/70">START SCANNING SMARTER TODAY</p>
        <h3 className="mt-5 text-3xl font-semibold md:text-5xl">Make every food decision more informed.</h3>
        <button
          type="button"
          onClick={onStart}
          className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-8 py-3 text-sm font-semibold tracking-[0.16em] text-black transition hover:translate-y-[-2px]"
        >
          SCAN YOUR FIRST PRODUCT
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-4">
      <p className="text-[11px] tracking-[0.14em] text-white/60">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function GlassAlert({
  icon: Icon,
  title,
  body,
  tone,
}: {
  icon: typeof AlertTriangle;
  title: string;
  body: string;
  tone: 'orange' | 'red';
}) {
  const toneClass =
    tone === 'orange'
      ? 'text-[#ff9f43] border-[#ff9f43]/25 bg-[#ff9f43]/10'
      : 'text-[#ff4d4d] border-[#ff4d4d]/25 bg-[#ff4d4d]/10';
  return (
    <div className={`rounded-3xl border p-5 ${toneClass}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <p className="text-sm tracking-[0.14em]">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/80">{body}</p>
    </div>
  );
}
