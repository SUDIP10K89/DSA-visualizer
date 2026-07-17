import type { AlgorithmId, Step } from "@/app/algorithms/types";
import { baseStep, range } from "@/app/algorithms/utils";

export function sortingSteps(id: AlgorithmId, input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [baseStep(a, "Initialize", "Start with the input array.")];
  let comparisons = 0;
  let swaps = 0;
  const push = (title: string, note: string, overrides: Partial<Step> = {}) =>
    steps.push(baseStep(a, title, note, { comparisons, swaps, operations: comparisons + swaps, ...overrides }));

  if (id === "bubble") {
    for (let end = a.length - 1; end > 0; end--) {
      let changed = false;
      for (let i = 0; i < end; i++) {
        comparisons++;
        push("Compare neighbors", `${a[i]} and ${a[i + 1]} are adjacent; larger values move right.`, { compare: [i, i + 1], done: range(end + 1, a.length - 1) });
        if (a[i] > a[i + 1]) {
          [a[i], a[i + 1]] = [a[i + 1], a[i]];
          swaps++;
          changed = true;
          push("Swap", "They were out of order, so the pair is swapped.", { active: [i, i + 1], done: range(end + 1, a.length - 1) });
        }
      }
      push("Largest settled", "The largest unsorted value has bubbled into its final position.", { done: range(end, a.length - 1) });
      if (!changed) break;
    }
  }

  if (id === "selection") {
    for (let i = 0; i < a.length - 1; i++) {
      let min = i;
      push("Select slot", `Position ${i + 1} is the next sorted slot.`, { active: [i], done: range(0, i - 1) });
      for (let j = i + 1; j < a.length; j++) {
        comparisons++;
        push("Scan for minimum", `Compare current minimum ${a[min]} with ${a[j]}.`, { compare: [min, j], done: range(0, i - 1) });
        if (a[j] < a[min]) {
          min = j;
          push("New minimum", `${a[min]} is now the smallest value seen in the unsorted region.`, { active: [min], done: range(0, i - 1) });
        }
      }
      if (min !== i) {
        [a[i], a[min]] = [a[min], a[i]];
        swaps++;
        push("Place minimum", "Move the smallest remaining value into the sorted slot.", { active: [i, min], done: range(0, i) });
      }
    }
  }

  if (id === "insertion") {
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      push("Pick key", `${key} must be inserted into the sorted prefix.`, { active: [i], done: range(0, i - 1) });
      while (j >= 0) {
        comparisons++;
        push("Compare with prefix", `Compare ${key} with ${a[j]}.`, { compare: [j, j + 1], done: range(0, i - 1) });
        if (a[j] <= key) break;
        a[j + 1] = a[j];
        swaps++;
        push("Shift right", `${a[j]} shifts right to make room.`, { active: [j, j + 1], done: range(0, i - 1) });
        j--;
      }
      a[j + 1] = key;
      push("Insert key", `${key} lands where the prefix remains sorted.`, { active: [j + 1], done: range(0, i) });
    }
  }

  if (id === "merge") {
    const merge = (left: number, mid: number, right: number) => {
      const merged: number[] = [];
      let i = left;
      let j = mid + 1;
      while (i <= mid && j <= right) {
        comparisons++;
        push("Merge compare", "Choose the smaller front value from the two sorted runs.", { compare: [i, j], active: range(left, right) });
        merged.push(a[i] <= a[j] ? a[i++] : a[j++]);
      }
      while (i <= mid) merged.push(a[i++]);
      while (j <= right) merged.push(a[j++]);
      merged.forEach((value, index) => {
        a[left + index] = value;
        swaps++;
        push("Write merged value", `${value} is written back into the merged segment.`, { active: [left + index], done: range(left, left + index) });
      });
    };
    const divide = (left: number, right: number) => {
      if (left >= right) return;
      const mid = Math.floor((left + right) / 2);
      push("Divide", `Split positions ${left + 1}-${right + 1} at the midpoint.`, { active: range(left, right) });
      divide(left, mid);
      divide(mid + 1, right);
      merge(left, mid, right);
    };
    divide(0, a.length - 1);
  }

  if (id === "quick") {
    const partition = (low: number, high: number) => {
      const pivot = a[high];
      let i = low;
      push("Choose pivot", `${pivot} becomes the pivot for this partition.`, { pivot: high, active: range(low, high) });
      for (let j = low; j < high; j++) {
        comparisons++;
        push("Compare to pivot", `${a[j]} is compared with pivot ${pivot}.`, { compare: [j, high], pivot: high, active: range(low, high) });
        if (a[j] < pivot) {
          [a[i], a[j]] = [a[j], a[i]];
          swaps++;
          push("Move below pivot", `${a[i]} belongs on the left side of the pivot.`, { active: [i, j], pivot: high });
          i++;
        }
      }
      [a[i], a[high]] = [a[high], a[i]];
      swaps++;
      push("Place pivot", "The pivot is now in its final sorted position.", { active: [i], done: [i] });
      return i;
    };
    const quick = (low: number, high: number) => {
      if (low < high) {
        const p = partition(low, high);
        quick(low, p - 1);
        quick(p + 1, high);
      }
    };
    quick(0, a.length - 1);
  }

  if (id === "heap") {
    const sift = (n: number, i: number) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n) {
        comparisons++;
        push("Heap compare", "Compare parent with left child.", { compare: [largest, left] });
        if (a[left] > a[largest]) largest = left;
      }
      if (right < n) {
        comparisons++;
        push("Heap compare", "Compare current largest with right child.", { compare: [largest, right] });
        if (a[right] > a[largest]) largest = right;
      }
      if (largest !== i) {
        [a[i], a[largest]] = [a[largest], a[i]];
        swaps++;
        push("Sift down", "Swap parent with larger child to restore heap order.", { active: [i, largest] });
        sift(n, largest);
      }
    };
    for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) sift(a.length, i);
    for (let end = a.length - 1; end > 0; end--) {
      [a[0], a[end]] = [a[end], a[0]];
      swaps++;
      push("Extract max", "Move the largest heap value into the sorted suffix.", { active: [0, end], done: range(end, a.length - 1) });
      sift(end, 0);
    }
  }

  push("Complete", "The final state is sorted.", { done: range(0, a.length - 1) });
  return steps;
}
