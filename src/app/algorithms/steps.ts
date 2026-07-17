import { metas } from "@/app/algorithms/metadata";
import type { AlgorithmId } from "@/app/algorithms/types";
import { graphSteps } from "@/app/algorithms/graphs";
import { recursiveSteps } from "@/app/algorithms/recursion";
import { searchingSteps } from "@/app/algorithms/searching";
import { sortingSteps } from "@/app/algorithms/sorting";
import { structureSteps } from "@/app/algorithms/structures";

export function clampInput(values: number[]) {
  return values.filter(Number.isFinite).slice(0, 12).map((value) => Math.max(1, Math.min(99, Math.round(value))));
}

export function parseValues(text: string) {
  const parsed = text.split(/[,\s]+/).map(Number);
  return clampInput(parsed).length ? clampInput(parsed) : [36, 12, 67, 25, 48, 9, 73, 31];
}

export function randomValues() {
  return Array.from({ length: 9 }, () => Math.floor(Math.random() * 86) + 8);
}

export function buildSteps(id: AlgorithmId, values: number[], target: number) {
  const meta = metas.find((algo) => algo.id === id)!;
  if (meta.category === "Sorting") return sortingSteps(id, values);
  if (meta.category === "Searching") return searchingSteps(id, values, target);
  if (meta.category === "Data Structures") return structureSteps(id, values);
  if (meta.category === "Graph Algorithms") return graphSteps(id);
  return recursiveSteps(id, values);
}
