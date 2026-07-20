"use client";

import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { categoryIcons, metas } from "@/app/algorithms/metadata";
import { buildSteps } from "@/app/algorithms/steps";
import type { AlgoMeta, AlgorithmId, Step, TowerState, TreeNode } from "@/app/algorithms/types";

function iconFor(meta: AlgoMeta) {
  const Icon = categoryIcons[meta.category];
  return <Icon className="h-4 w-4" aria-hidden />;
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-slate-300 bg-slate-50 p-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function ControlButton({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center border border-slate-300 bg-white text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
    >
      {children}
    </button>
  );
}

export function AlgorithmVisualizer({ algorithmId, values, target, speed, version, compact = false }: { algorithmId: AlgorithmId; values: number[]; target: number; speed: number; version: number; compact?: boolean }) {
  const steps = useMemo(() => buildSteps(algorithmId, values, target), [algorithmId, values, target]);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);
  const meta = metas.find((algo) => algo.id === algorithmId)!;
  const step = steps[Math.min(index, steps.length - 1)] ?? buildSteps(algorithmId, values, target)[0];

  useEffect(() => {
    setIndex(0);
    setRunning(false);
  }, [algorithmId, version, values, target]);

  useEffect(() => {
    if (!running) return;
    timer.current = window.setTimeout(() => {
      setIndex((current) => {
        if (current >= steps.length - 1) {
          setRunning(false);
          return current;
        }
        return current + 1;
      });
    }, speed);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [running, index, speed, steps.length]);

  const progress = steps.length <= 1 ? 100 : Math.round((index / (steps.length - 1)) * 100);

  return (
    <section className="flex h-full min-h-[520px] flex-col overflow-hidden border border-slate-900/10 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            {iconFor(meta)}
            {meta.name}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{meta.category}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <ControlButton title={running ? "Pause" : "Start"} onClick={() => setRunning((value) => !value)}>
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </ControlButton>
          <ControlButton title="Step forward" onClick={() => setIndex((value) => Math.min(value + 1, steps.length - 1))}>
            <SkipForward className="h-4 w-4" />
          </ControlButton>
          <ControlButton title="Reset" onClick={() => { setIndex(0); setRunning(false); }}>
            <RotateCcw className="h-4 w-4" />
          </ControlButton>
        </div>
      </div>

      <div className="h-2 bg-slate-100">
        <div className="h-full bg-teal-700 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className={`grid flex-1 gap-0 ${compact ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]"}`}>
        <div className="flex min-h-[360px] items-center justify-center bg-slate-50 p-4">
          <Visual step={step} meta={meta} />
        </div>
        <aside className="border-t border-slate-300 bg-white p-4 lg:border-l lg:border-t-0">
          <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <span>Step {index + 1} of {steps.length}</span>
            <span>{step.operations} ops</span>
          </div>
          <h2 className="text-lg font-black text-slate-950">{step.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-650">{step.note}</p>
          <div className="mt-4 border border-amber-300 bg-amber-50 p-3 text-sm font-medium text-amber-950">
            {step.insight}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric label="Comparisons" value={step.comparisons} />
            <Metric label="Moves" value={step.swaps} />
            <Metric label="Progress" value={`${progress}%`} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function Visual({ step, meta }: { step: Step; meta: AlgoMeta }) {
  if (step.graphNodes) return <GraphVisual step={step} />;
  if (step.tree) return <TreeVisual nodes={step.tree} />;
  if (step.linked) return <LinkedVisual values={step.linked} />;
  if (step.structure) return <StructureVisual values={step.structure} label={step.structureLabel ?? ""} circular={meta.id === "circularQueue"} />;
  if (step.towers) return <TowerVisual towers={step.towers} />;
  if (step.fib) return <FibVisual fib={step.fib} />;
  if (step.board) return <BoardVisual board={step.board} />;
  return <ArrayVisual step={step} />;
}

function ArrayVisual({ step }: { step: Step }) {
  const values = step.values ?? [];
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-[340px] w-full max-w-4xl items-end justify-center gap-2 rounded-lg border border-slate-200 bg-white p-4">
      {values.map((value, index) => {
        const isActive = step.active?.includes(index);
        const isCompare = step.compare?.includes(index);
        const isDone = step.done?.includes(index);
        const isPivot = step.pivot === index;
        const color = isDone ? "bg-emerald-500" : isPivot ? "bg-rose-500" : isActive ? "bg-teal-600" : isCompare ? "bg-amber-500" : "bg-slate-400";
        return (
          <div key={`${value}-${index}`} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <div
              className={`flex w-full max-w-14 items-start justify-center rounded-t-md px-1 pt-2 text-xs font-bold text-white transition-all duration-300 ${color}`}
              style={{ height: `${Math.max(12, (value / max) * 92)}%` }}
            >
              {value}
            </div>
            <span className="text-[11px] font-medium text-slate-500">{index}</span>
          </div>
        );
      })}
    </div>
  );
}

function GraphVisual({ step }: { step: Step }) {
  const nodes = step.graphNodes ?? [];
  const getNode = (id: string) => nodes.find((node) => node.id === id)!;
  return (
    <div className="relative h-[360px] w-full max-w-3xl rounded-lg border border-slate-200 bg-white">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" role="img" aria-label="Graph visualization">
        {(step.graphEdges ?? []).map((edge) => {
          const from = getNode(edge.from);
          const to = getNode(edge.to);
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={edge.active ? "#0d9488" : "#cbd5e1"} strokeWidth={edge.active ? 1.6 : 0.9} />
              <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 2} textAnchor="middle" className="fill-slate-500 text-[4px] font-bold">
                {edge.weight}
              </text>
            </g>
          );
        })}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r="6.5" fill={node.status === "active" ? "#0d9488" : node.status === "done" ? "#10b981" : "#e2e8f0"} stroke="#0f172a" strokeWidth="0.6" />
            <text x={node.x} y={node.y + 1.5} textAnchor="middle" className="fill-slate-950 text-[5px] font-bold">
              {node.id}
            </text>
            {node.value !== undefined && (
              <text x={node.x} y={node.y + 12} textAnchor="middle" className="fill-slate-600 text-[4px]">
                {node.value === Infinity ? "inf" : node.value}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function StructureVisual({ values, label, circular }: { values: number[]; label: string; circular: boolean }) {
  return (
    <div className="flex min-h-[320px] w-full max-w-3xl flex-col items-center justify-center gap-5 rounded-lg border border-slate-200 bg-white p-5">
      <div className={circular ? "grid h-64 w-64 place-items-center rounded-full border-2 border-dashed border-slate-300 p-6" : "flex flex-wrap justify-center gap-3"}>
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className="grid h-16 w-16 place-items-center rounded-md bg-teal-600 text-lg font-bold text-white shadow-sm">
            {value}
          </div>
        ))}
      </div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}

function LinkedVisual({ values }: { values: number[] }) {
  return (
    <div className="flex min-h-[320px] w-full flex-wrap items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-5">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex items-center gap-2">
          <div className="grid h-16 w-20 place-items-center rounded-md border border-slate-300 bg-slate-50 text-lg font-bold text-slate-950">{value}</div>
          {index < values.length - 1 && <span className="text-2xl font-semibold text-teal-700">{"->"}</span>}
        </div>
      ))}
    </div>
  );
}

function TreeVisual({ nodes }: { nodes: TreeNode[] }) {
  return (
    <div className="relative h-[360px] w-full max-w-3xl rounded-lg border border-slate-200 bg-white">
      {nodes.map((node) => (
        <div
          key={`${node.value}-${node.x}-${node.y}`}
          className={`absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-sm font-bold shadow-sm ${node.status === "active" ? "border-teal-800 bg-teal-600 text-white" : "border-slate-300 bg-slate-50 text-slate-950"}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          {node.value}
        </div>
      ))}
    </div>
  );
}

function TowerVisual({ towers }: { towers: TowerState }) {
  const maxDisk = Math.max(...towers.flat(), 1);
  return (
    <div className="grid min-h-[320px] w-full max-w-3xl grid-cols-3 gap-4 rounded-lg border border-slate-200 bg-white p-6">
      {towers.map((tower, towerIndex) => (
        <div key={towerIndex} className="relative flex flex-col-reverse items-center justify-start border-b-4 border-slate-500 pb-2">
          <div className="absolute bottom-2 h-56 w-2 rounded-t bg-slate-300" />
          {tower.map((disk) => (
            <div key={disk} className="z-10 mb-1 h-9 rounded-md bg-teal-600 text-center text-xs font-bold leading-9 text-white shadow-sm" style={{ width: `${36 + (disk / maxDisk) * 55}%` }}>
              {disk}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function FibVisual({ fib }: { fib: { n: number; sequence: number[]; active: number } }) {
  return (
    <div className="flex min-h-[320px] w-full max-w-3xl flex-wrap items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-5">
      {fib.sequence.map((value, index) => (
        <div key={index} className={`grid h-20 w-20 place-items-center rounded-md border text-sm shadow-sm ${index === fib.active ? "border-teal-700 bg-teal-600 text-white" : "border-slate-200 bg-slate-50 text-slate-950"}`}>
          <span className="text-xs">F({index})</span>
          <strong className="text-xl">{value}</strong>
        </div>
      ))}
    </div>
  );
}

function BoardVisual({ board }: { board: number[][] }) {
  return (
    <div className="grid h-80 w-80 grid-cols-4 overflow-hidden rounded-lg border border-slate-300 bg-white">
      {board.flatMap((row, r) =>
        row.map((cell, c) => (
          <div key={`${r}-${c}`} className={`grid place-items-center text-3xl font-bold ${((r + c) % 2 === 0) ? "bg-slate-100" : "bg-teal-50"} text-slate-950`}>
            {cell ? "Q" : ""}
          </div>
        )),
      )}
    </div>
  );
}
