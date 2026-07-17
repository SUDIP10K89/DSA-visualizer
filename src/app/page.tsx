"use client";

import { ListRestart, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";

import { AlgorithmVisualizer } from "@/app/components/AlgorithmVisualizer";
import { metas } from "@/app/algorithms/metadata";
import { parseValues, randomValues } from "@/app/algorithms/steps";
import type { AlgorithmId, Category } from "@/app/algorithms/types";

export default function Home() {
  const [algorithmId, setAlgorithmId] = useState<AlgorithmId>("bubble");
  const [compareId, setCompareId] = useState<AlgorithmId>("quick");
  const [inputText, setInputText] = useState("36, 12, 67, 25, 48, 9, 73, 31");
  const [target, setTarget] = useState(48);
  const [speed, setSpeed] = useState(620);
  const [version, setVersion] = useState(0);
  const [comparison, setComparison] = useState(false);

  const values = useMemo(() => parseValues(inputText), [inputText]);
  const activeMeta = metas.find((algo) => algo.id === algorithmId)!;
  const categories = Array.from(new Set(metas.map((meta) => meta.category))) as Category[];

  const generateRandom = () => {
    const next = randomValues();
    setInputText(next.join(", "));
    setTarget(next[Math.floor(next.length / 2)]);
    setVersion((value) => value + 1);
  };

  return (
    <main className="min-h-screen px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="grid gap-4 rounded-lg border border-slate-200 bg-white/90 p-4 shadow-soft lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-700">Virtual DSA Laboratory</p>
            <h1 className="mt-1 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">DSA Algorithm Visualizer</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Experiment with algorithms, watch each decision unfold, compare strategies, and connect the animation to complexity, use cases, and common exam insights.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={generateRandom} className="inline-flex h-10 items-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
              <Shuffle className="h-4 w-4" /> Random
            </button>
            <button type="button" onClick={() => setVersion((value) => value + 1)} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:border-teal-500">
              <ListRestart className="h-4 w-4" /> Apply Input
            </button>
          </div>
        </header>

        <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-soft lg:grid-cols-[1.2fr_1fr_0.8fr]">
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="algorithm">Algorithm</label>
            <select id="algorithm" value={algorithmId} onChange={(event) => setAlgorithmId(event.target.value as AlgorithmId)} className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
              {categories.map((category) => (
                <optgroup key={category} label={category}>
                  {metas.filter((meta) => meta.category === category).map((meta) => (
                    <option key={meta.id} value={meta.id}>{meta.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="input">Custom input</label>
            <input id="input" value={inputText} onChange={(event) => setInputText(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" placeholder="12, 7, 44, 3" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="target">Target</label>
              <input id="target" type="number" value={target} onChange={(event) => setTarget(Number(event.target.value))} className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="speed">Speed</label>
              <input id="speed" type="range" min="180" max="1200" step="40" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="mt-4 w-full accent-teal-700" />
              <p className="mt-1 text-xs text-slate-500">{speed}ms</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
          <AlgorithmVisualizer algorithmId={algorithmId} values={values} target={target} speed={speed} version={version} />

          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-teal-700">Learning Mode</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">{activeMeta.name}</h2>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{activeMeta.category}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{activeMeta.explanation}</p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Real-world use</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{activeMeta.application}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Metric label="Best" value={activeMeta.complexity.best} />
              <Metric label="Average" value={activeMeta.complexity.average} />
              <Metric label="Worst" value={activeMeta.complexity.worst} />
              <Metric label="Space" value={activeMeta.complexity.space} />
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-800">Key concepts</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeMeta.concepts.map((concept) => (
                  <span key={concept} className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-900">{concept}</span>
                ))}
              </div>
            </div>
            <label className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-800">
              Comparison mode
              <input type="checkbox" checked={comparison} onChange={(event) => setComparison(event.target.checked)} className="h-5 w-5 accent-teal-700" />
            </label>
          </aside>
        </section>

        {comparison && (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-teal-700">Comparison Mode</p>
                <h2 className="text-xl font-bold text-slate-950">Same input, two execution traces</h2>
              </div>
              <select value={compareId} onChange={(event) => setCompareId(event.target.value as AlgorithmId)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
                {metas.map((meta) => <option key={meta.id} value={meta.id}>{meta.name}</option>)}
              </select>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <AlgorithmVisualizer algorithmId={algorithmId} values={values} target={target} speed={speed} version={version} compact />
              <AlgorithmVisualizer algorithmId={compareId} values={values} target={target} speed={speed} version={version} compact />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}