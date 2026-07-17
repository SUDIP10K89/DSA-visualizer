import type { AlgorithmId, Step } from "@/app/algorithms/types";
import { baseStep, range } from "@/app/algorithms/utils";

export function searchingSteps(id: AlgorithmId, input: number[], target: number): Step[] {
  const values = id === "binary" ? [...input].sort((a, b) => a - b) : [...input];
  const steps: Step[] = [baseStep(values, "Initialize", `Search for target ${target}.`)];
  let comparisons = 0;
  const push = (title: string, note: string, overrides: Partial<Step> = {}) =>
    steps.push(baseStep(values, title, note, { comparisons, operations: comparisons, ...overrides }));

  if (id === "linear") {
    for (let i = 0; i < values.length; i++) {
      comparisons++;
      push("Check element", `Compare ${values[i]} with target ${target}.`, { compare: [i] });
      if (values[i] === target) {
        push("Target found", `The target appears at position ${i + 1}.`, { done: [i] });
        return steps;
      }
    }
  } else {
    let low = 0;
    let high = values.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      comparisons++;
      push("Check midpoint", `Midpoint ${values[mid]} decides which half can still contain ${target}.`, {
        compare: [mid],
        active: range(low, high),
      });
      if (values[mid] === target) {
        push("Target found", "The midpoint equals the target.", { done: [mid] });
        return steps;
      }
      if (values[mid] < target) {
        low = mid + 1;
        push("Move right", "Everything left of the midpoint is too small.", { active: range(low, high) });
      } else {
        high = mid - 1;
        push("Move left", "Everything right of the midpoint is too large.", { active: range(low, high) });
      }
    }
  }

  push("Not found", "The search space is exhausted.", {});
  return steps;
}
