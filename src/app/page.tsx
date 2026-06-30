"use client";

import {
  BarChart3,
  Binary,
  Brain,
  GitBranch,
  ListRestart,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  SkipForward,
  SquareStack,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Category = "Sorting" | "Searching" | "Data Structures" | "Graph Algorithms" | "Recursive Problems";
type AlgorithmId =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "quick"
  | "heap"
  | "linear"
  | "binary"
  | "stack"
  | "queue"
  | "circularQueue"
  | "linkedList"
  | "bst"
  | "bfs"
  | "dfs"
  | "dijkstra"
  | "prim"
  | "hanoi"
  | "fibonacci"
  | "nQueens";

type AlgoMeta = {
  id: AlgorithmId;
  category: Category;
  name: string;
  icon: "sort" | "search" | "structure" | "graph" | "recursive";
  explanation: string;
  application: string;
  complexity: { best: string; average: string; worst: string; space: string };
  concepts: string[];
};

type GraphNode = { id: string; x: number; y: number; value?: number; status?: string };
type GraphEdge = { from: string; to: string; weight?: number; active?: boolean; selected?: boolean };
type TreeNode = { value: number; x: number; y: number; status?: string };
type TowerState = number[][];

type Step = {
  title: string;
  note: string;
  insight: string;
  values?: number[];
  active?: number[];
  compare?: number[];
  done?: number[];
  pivot?: number;
  operations: number;
  comparisons: number;
  swaps: number;
  graphNodes?: GraphNode[];
  graphEdges?: GraphEdge[];
  structure?: number[];
  structureLabel?: string;
  linked?: number[];
  tree?: TreeNode[];
  towers?: TowerState;
  board?: number[][];
  fib?: { n: number; sequence: number[]; active: number };
};

const metas: AlgoMeta[] = [
  {
    id: "bubble",
    category: "Sorting",
    name: "Bubble Sort",
    icon: "sort",
    explanation: "Repeatedly compare adjacent elements and swap them when they are out of order.",
    application: "Useful for teaching adjacent comparisons and for tiny nearly sorted lists.",
    complexity: { best: "O(n)", average: "O(n^2)", worst: "O(n^2)", space: "O(1)" },
    concepts: ["Adjacent comparison", "Swap", "Pass", "Early stop"],
  },
  {
    id: "selection",
    category: "Sorting",
    name: "Selection Sort",
    icon: "sort",
    explanation: "Select the smallest remaining element and place it at the next sorted position.",
    application: "Good when swaps are expensive because it performs at most n swaps.",
    complexity: { best: "O(n^2)", average: "O(n^2)", worst: "O(n^2)", space: "O(1)" },
    concepts: ["Minimum scan", "Partition", "In-place sorting"],
  },
  {
    id: "insertion",
    category: "Sorting",
    name: "Insertion Sort",
    icon: "sort",
    explanation: "Build a sorted prefix by inserting each new element where it belongs.",
    application: "Fast for small arrays and nearly sorted data; often used inside hybrid sorts.",
    complexity: { best: "O(n)", average: "O(n^2)", worst: "O(n^2)", space: "O(1)" },
    concepts: ["Sorted prefix", "Shifting", "Stable sort"],
  },
  {
    id: "merge",
    category: "Sorting",
    name: "Merge Sort",
    icon: "sort",
    explanation: "Divide the array, sort each half, then merge sorted runs back together.",
    application: "Reliable stable sorting for linked lists, external sorting, and large datasets.",
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
    concepts: ["Divide and conquer", "Merge", "Stable sort"],
  },
  {
    id: "quick",
    category: "Sorting",
    name: "Quick Sort",
    icon: "sort",
    explanation: "Choose a pivot, partition around it, then recursively sort both sides.",
    application: "A practical high-performance in-place sort when pivots are chosen well.",
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n^2)", space: "O(log n)" },
    concepts: ["Pivot", "Partition", "Recursion"],
  },
  {
    id: "heap",
    category: "Sorting",
    name: "Heap Sort",
    icon: "sort",
    explanation: "Build a max heap, repeatedly extract the root, and restore heap order.",
    application: "Useful for guaranteed O(n log n) sorting with constant extra space.",
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
    concepts: ["Heap property", "Sift down", "Extraction"],
  },
  {
    id: "linear",
    category: "Searching",
    name: "Linear Search",
    icon: "search",
    explanation: "Check each element from left to right until the target is found.",
    application: "Works on unsorted data and simple streams where no index structure exists.",
    complexity: { best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(1)" },
    concepts: ["Sequential scan", "Target match", "Early return"],
  },
  {
    id: "binary",
    category: "Searching",
    name: "Binary Search",
    icon: "search",
    explanation: "On sorted data, repeatedly cut the search interval in half.",
    application: "Used in indexes, dictionaries, answer-space search, and lookup tables.",
    complexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)" },
    concepts: ["Sorted input", "Midpoint", "Interval shrink"],
  },
  {
    id: "stack",
    category: "Data Structures",
    name: "Stack",
    icon: "structure",
    explanation: "A last-in-first-out structure where pushes and pops happen at the top.",
    application: "Used in undo history, parsing, recursion, browser history, and backtracking.",
    complexity: { best: "Push/pop O(1)", average: "Push/pop O(1)", worst: "Push/pop O(1)", space: "O(n)" },
    concepts: ["LIFO", "Top pointer", "Overflow/underflow"],
  },
  {
    id: "queue",
    category: "Data Structures",
    name: "Queue",
    icon: "structure",
    explanation: "A first-in-first-out structure with enqueue at rear and dequeue at front.",
    application: "Used in scheduling, buffering, BFS, and request processing.",
    complexity: { best: "O(1)", average: "O(1)", worst: "O(1)", space: "O(n)" },
    concepts: ["FIFO", "Front", "Rear"],
  },
  {
    id: "circularQueue",
    category: "Data Structures",
    name: "Circular Queue",
    icon: "structure",
    explanation: "A queue where front and rear wrap around a fixed-size array.",
    application: "Used in ring buffers, streaming audio, and bounded scheduling queues.",
    complexity: { best: "O(1)", average: "O(1)", worst: "O(1)", space: "O(n)" },
    concepts: ["Modulo index", "Wrap-around", "Fixed capacity"],
  },
  {
    id: "linkedList",
    category: "Data Structures",
    name: "Linked List",
    icon: "structure",
    explanation: "Nodes store values and links, so insertion can happen without shifting arrays.",
    application: "Useful for dynamic memory layouts, adjacency lists, and frequent insert/delete operations.",
    complexity: { best: "Insert head O(1)", average: "Search O(n)", worst: "Search O(n)", space: "O(n)" },
    concepts: ["Node", "Pointer", "Head", "Traversal"],
  },
  {
    id: "bst",
    category: "Data Structures",
    name: "Binary Search Tree",
    icon: "structure",
    explanation: "Each node keeps smaller values on the left and larger values on the right.",
    application: "Used for ordered maps, sets, range queries, and tree traversal practice.",
    complexity: { best: "O(log n)", average: "O(log n)", worst: "O(n)", space: "O(n)" },
    concepts: ["Ordering invariant", "Insert path", "Traversal"],
  },
  {
    id: "bfs",
    category: "Graph Algorithms",
    name: "Breadth-First Search",
    icon: "graph",
    explanation: "Visit nodes level by level using a queue.",
    application: "Shortest paths in unweighted graphs, web crawling, and social network degrees.",
    complexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
    concepts: ["Queue", "Visited set", "Layer order"],
  },
  {
    id: "dfs",
    category: "Graph Algorithms",
    name: "Depth-First Search",
    icon: "graph",
    explanation: "Explore deeply along a path before backtracking.",
    application: "Cycle detection, topological sorting, maze solving, and connected components.",
    complexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
    concepts: ["Stack", "Recursion", "Backtracking"],
  },
  {
    id: "dijkstra",
    category: "Graph Algorithms",
    name: "Dijkstra's Algorithm",
    icon: "graph",
    explanation: "Always expand the unsettled node with the smallest known distance.",
    application: "Routing, navigation, network optimization, and weighted shortest paths.",
    complexity: { best: "O((V + E) log V)", average: "O((V + E) log V)", worst: "O((V + E) log V)", space: "O(V)" },
    concepts: ["Relaxation", "Priority choice", "Shortest distance"],
  },
  {
    id: "prim",
    category: "Graph Algorithms",
    name: "Prim's Algorithm",
    icon: "graph",
    explanation: "Grow a minimum spanning tree by adding the cheapest edge to a new node.",
    application: "Network design, cabling, clustering, and infrastructure planning.",
    complexity: { best: "O(E log V)", average: "O(E log V)", worst: "O(E log V)", space: "O(V)" },
    concepts: ["Minimum spanning tree", "Cut property", "Greedy choice"],
  },
  {
    id: "hanoi",
    category: "Recursive Problems",
    name: "Tower of Hanoi",
    icon: "recursive",
    explanation: "Move disks between pegs by solving smaller subproblems recursively.",
    application: "Classic model for recursion, call stacks, and exponential growth.",
    complexity: { best: "O(2^n)", average: "O(2^n)", worst: "O(2^n)", space: "O(n)" },
    concepts: ["Base case", "Recursive case", "Call stack"],
  },
  {
    id: "fibonacci",
    category: "Recursive Problems",
    name: "Fibonacci",
    icon: "recursive",
    explanation: "Build each number from the two previous values.",
    application: "Introduces recursion, dynamic programming, memoization, and recurrence relations.",
    complexity: { best: "O(n)", average: "O(n)", worst: "O(n)", space: "O(1)" },
    concepts: ["Recurrence", "Memoization", "Overlapping subproblems"],
  },
  {
    id: "nQueens",
    category: "Recursive Problems",
    name: "N-Queens",
    icon: "recursive",
    explanation: "Place queens row by row while avoiding same columns and diagonals.",
    application: "Great for understanding backtracking and constraint satisfaction.",
    complexity: { best: "O(n!)", average: "O(n!)", worst: "O(n!)", space: "O(n)" },
    concepts: ["Backtracking", "Constraint check", "Search tree"],
  },
];

const categoryIcons: Record<Category, React.ElementType> = {
  Sorting: BarChart3,
  Searching: Binary,
  "Data Structures": SquareStack,
  "Graph Algorithms": GitBranch,
  "Recursive Problems": Brain,
};

const sampleGraphNodes: GraphNode[] = [
  { id: "A", x: 12, y: 42 },
  { id: "B", x: 34, y: 18 },
  { id: "C", x: 35, y: 68 },
  { id: "D", x: 58, y: 25 },
  { id: "E", x: 62, y: 73 },
  { id: "F", x: 84, y: 48 },
];

const sampleGraphEdges: GraphEdge[] = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "C", weight: 2 },
  { from: "B", to: "D", weight: 5 },
  { from: "C", to: "D", weight: 1 },
  { from: "C", to: "E", weight: 7 },
  { from: "D", to: "F", weight: 3 },
  { from: "E", to: "F", weight: 2 },
];

function clampInput(values: number[]) {
  return values.filter(Number.isFinite).slice(0, 12).map((value) => Math.max(1, Math.min(99, Math.round(value))));
}

function parseValues(text: string) {
  const parsed = text.split(/[,\s]+/).map(Number);
  return clampInput(parsed).length ? clampInput(parsed) : [36, 12, 67, 25, 48, 9, 73, 31];
}

function randomValues() {
  return Array.from({ length: 9 }, () => Math.floor(Math.random() * 86) + 8);
}

function baseStep(values: number[], title: string, note: string, overrides: Partial<Step> = {}): Step {
  return {
    values: [...values],
    title,
    note,
    insight: "Watch the highlighted items; they explain the decision the algorithm is making right now.",
    operations: 0,
    comparisons: 0,
    swaps: 0,
    ...overrides,
  };
}

function sortingSteps(id: AlgorithmId, input: number[]): Step[] {
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
        push("Merge compare", `Choose the smaller front value from the two sorted runs.`, { compare: [i, j], active: range(left, right) });
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

function searchingSteps(id: AlgorithmId, input: number[], target: number): Step[] {
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

function structureSteps(id: AlgorithmId, input: number[]): Step[] {
  const values = input.slice(0, 7);
  const steps: Step[] = [];
  let operations = 0;
  const push = (step: Partial<Step> & Pick<Step, "title" | "note">) =>
    steps.push({
      ...step,
      comparisons: step.comparisons ?? 0,
      swaps: step.swaps ?? 0,
      operations: step.operations ?? operations,
      insight: step.insight ?? "The structure changes only through its allowed access pattern.",
    });

  if (id === "stack") {
    const stack: number[] = [];
    values.slice(0, 5).forEach((value) => {
      stack.push(value);
      operations++;
      push({ title: "Push", note: `${value} is placed on top of the stack.`, structure: [...stack], structureLabel: "Top is the newest item" });
    });
    while (stack.length > 2) {
      const value = stack.pop();
      operations++;
      push({ title: "Pop", note: `${value} leaves first because the stack is LIFO.`, structure: [...stack], structureLabel: "Top moves down" });
    }
  }

  if (id === "queue" || id === "circularQueue") {
    const queue: number[] = [];
    const capacity = 6;
    values.slice(0, 5).forEach((value) => {
      queue.push(value);
      operations++;
      push({ title: "Enqueue", note: `${value} joins at the rear.`, structure: [...queue], structureLabel: id === "queue" ? "Front -> Rear" : `Capacity ${capacity}, rear advances by modulo` });
    });
    for (let i = 0; i < 2; i++) {
      const value = queue.shift();
      operations++;
      push({ title: "Dequeue", note: `${value} leaves from the front.`, structure: [...queue], structureLabel: "Front advances" });
    }
    if (id === "circularQueue") {
      values.slice(5, 7).forEach((value) => {
        queue.push(value);
        operations++;
        push({ title: "Wrap enqueue", note: `${value} uses a freed slot when rear wraps around.`, structure: [...queue], structureLabel: "Modulo arithmetic reuses space" });
      });
    }
  }

  if (id === "linkedList") {
    const list: number[] = [];
    values.slice(0, 5).forEach((value) => {
      list.push(value);
      operations++;
      push({ title: "Append node", note: `Create a node for ${value} and link it after the tail.`, linked: [...list] });
    });
    operations++;
    list.splice(2, 0, values[5] ?? 42);
    push({ title: "Insert node", note: "Only nearby links change; existing values do not shift.", linked: [...list] });
    operations++;
    list.splice(1, 1);
    push({ title: "Delete node", note: "Bypass the removed node by rewiring its previous link.", linked: [...list] });
  }

  if (id === "bst") {
    const inserted: number[] = [];
    values.forEach((value) => {
      inserted.push(value);
      operations++;
      push({ title: "Insert value", note: `${value} follows left/right comparisons until it reaches an empty child.`, tree: layoutTree(inserted, value) });
    });
  }

  return steps;
}

function graphSteps(id: AlgorithmId): Step[] {
  const adjacency: Record<string, string[]> = { A: ["B", "C"], B: ["D"], C: ["D", "E"], D: ["F"], E: ["F"], F: [] };
  const steps: Step[] = [];
  let operations = 0;
  const push = (title: string, note: string, activeNodes: string[], selectedEdges: string[] = [], values: Record<string, number> = {}) => {
    operations++;
    steps.push({
      title,
      note,
      insight: id === "dfs" ? "Depth-first search commits to a path before returning." : "Greedy and traversal algorithms keep careful state about what is already known.",
      operations,
      comparisons: operations,
      swaps: 0,
      graphNodes: sampleGraphNodes.map((node) => ({
        ...node,
        value: values[node.id],
        status: activeNodes.includes(node.id) ? "active" : selectedEdges.join("-").includes(node.id) ? "done" : undefined,
      })),
      graphEdges: sampleGraphEdges.map((edge) => ({
        ...edge,
        active: selectedEdges.includes(`${edge.from}${edge.to}`) || selectedEdges.includes(`${edge.to}${edge.from}`),
        selected: selectedEdges.includes(`${edge.from}${edge.to}`),
      })),
    });
  };

  if (id === "bfs") {
    const visited = new Set<string>(["A"]);
    const queue = ["A"];
    push("Start BFS", "A enters the queue as level 0.", ["A"]);
    while (queue.length) {
      const node = queue.shift()!;
      push("Dequeue", `${node} is expanded; its unvisited neighbors will be queued.`, [node]);
      adjacency[node].forEach((next) => {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
          push("Discover neighbor", `${next} is discovered and added to the rear of the queue.`, [next], [`${node}${next}`]);
        }
      });
    }
  }

  if (id === "dfs") {
    const visited = new Set<string>();
    const dfs = (node: string) => {
      visited.add(node);
      push("Visit node", `${node} is marked visited, then DFS tries one neighbor deeply.`, [node]);
      adjacency[node].forEach((next) => {
        if (!visited.has(next)) {
          push("Follow edge", `Move from ${node} to ${next}.`, [node, next], [`${node}${next}`]);
          dfs(next);
        }
      });
      push("Backtrack", `No more unvisited neighbors from ${node}; return to the caller.`, [node]);
    };
    dfs("A");
  }

  if (id === "dijkstra") {
    const dist: Record<string, number> = { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity, F: Infinity };
    const settled = new Set<string>();
    push("Initialize distances", "Source A starts at 0; all other distances are unknown.", ["A"], [], dist);
    while (settled.size < sampleGraphNodes.length) {
      const current = Object.keys(dist).filter((node) => !settled.has(node)).sort((a, b) => dist[a] - dist[b])[0];
      if (!current || dist[current] === Infinity) break;
      settled.add(current);
      push("Settle closest", `${current} has the smallest tentative distance, so it becomes final.`, [current], [], dist);
      sampleGraphEdges.filter((edge) => edge.from === current).forEach((edge) => {
        const candidate = dist[current] + (edge.weight ?? 0);
        if (candidate < dist[edge.to]) {
          dist[edge.to] = candidate;
          push("Relax edge", `A shorter path to ${edge.to} is found through ${current}.`, [edge.to], [`${edge.from}${edge.to}`], dist);
        }
      });
    }
  }

  if (id === "prim") {
    const selected = new Set<string>(["A"]);
    push("Start tree", "The spanning tree starts from A.", ["A"]);
    while (selected.size < sampleGraphNodes.length) {
      const candidate = sampleGraphEdges
        .filter((edge) => selected.has(edge.from) && !selected.has(edge.to))
        .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0))[0];
      if (!candidate) break;
      selected.add(candidate.to);
      push("Add cheapest edge", `${candidate.from}-${candidate.to} is the lightest edge crossing into an unvisited node.`, [candidate.to], [`${candidate.from}${candidate.to}`]);
    }
  }

  return steps;
}

function recursiveSteps(id: AlgorithmId, input: number[]): Step[] {
  const steps: Step[] = [];
  let operations = 0;
  const push = (step: Partial<Step> & Pick<Step, "title" | "note">) =>
    steps.push({
      ...step,
      comparisons: step.comparisons ?? 0,
      swaps: step.swaps ?? 0,
      operations: step.operations ?? ++operations,
      insight: step.insight ?? "Recursive solutions solve a smaller version of the same problem, then combine the result.",
    });

  if (id === "hanoi") {
    const n = Math.min(4, Math.max(3, input[0] % 5 || 3));
    const towers: TowerState = [Array.from({ length: n }, (_, index) => n - index), [], []];
    push({ title: "Base setup", note: `${n} disks begin on the first peg.`, towers: towers.map((tower) => [...tower]) });
    const move = (count: number, from: number, to: number, aux: number) => {
      if (count === 0) return;
      move(count - 1, from, aux, to);
      towers[to].push(towers[from].pop()!);
      push({ title: "Move disk", note: `Move disk ${count} from peg ${from + 1} to peg ${to + 1}.`, towers: towers.map((tower) => [...tower]) });
      move(count - 1, aux, to, from);
    };
    move(n, 0, 2, 1);
  }

  if (id === "fibonacci") {
    const n = Math.min(10, Math.max(5, input[0] % 11 || 7));
    const seq = [0, 1];
    push({ title: "Base cases", note: "F(0)=0 and F(1)=1 start the recurrence.", fib: { n, sequence: [...seq], active: 1 } });
    for (let i = 2; i <= n; i++) {
      seq[i] = seq[i - 1] + seq[i - 2];
      push({ title: "Combine subproblems", note: `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${seq[i]}.`, fib: { n, sequence: [...seq], active: i } });
    }
  }

  if (id === "nQueens") {
    const size = 4;
    const board = Array.from({ length: size }, () => Array(size).fill(0));
    const safe = (row: number, col: number) => {
      for (let r = 0; r < row; r++) {
        if (board[r][col]) return false;
        const left = col - (row - r);
        const right = col + (row - r);
        if (left >= 0 && board[r][left]) return false;
        if (right < size && board[r][right]) return false;
      }
      return true;
    };
    const solve = (row: number): boolean => {
      if (row === size) return true;
      for (let col = 0; col < size; col++) {
        push({ title: "Try position", note: `Check row ${row + 1}, column ${col + 1}.`, board: cloneBoard(board) });
        if (safe(row, col)) {
          board[row][col] = 1;
          push({ title: "Place queen", note: "No queen attacks this square, so keep it for now.", board: cloneBoard(board) });
          if (solve(row + 1)) return true;
          board[row][col] = 0;
          push({ title: "Backtrack", note: "This path failed later, so remove the queen and try another column.", board: cloneBoard(board) });
        }
      }
      return false;
    };
    solve(0);
  }

  return steps;
}

function buildSteps(id: AlgorithmId, values: number[], target: number) {
  const meta = metas.find((algo) => algo.id === id)!;
  if (meta.category === "Sorting") return sortingSteps(id, values);
  if (meta.category === "Searching") return searchingSteps(id, values, target);
  if (meta.category === "Data Structures") return structureSteps(id, values);
  if (meta.category === "Graph Algorithms") return graphSteps(id);
  return recursiveSteps(id, values);
}

function range(start: number, end: number) {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function cloneBoard(board: number[][]) {
  return board.map((row) => [...row]);
}

function layoutTree(values: number[], active: number): TreeNode[] {
  type Node = { value: number; left?: Node; right?: Node; depth: number; index: number };
  let root: Node | undefined;
  values.forEach((value) => {
    const insert = (node: Node | undefined, depth = 0, index = 0): Node => {
      if (!node) return { value, depth, index };
      if (value < node.value) node.left = insert(node.left, depth + 1, index * 2);
      else if (value > node.value) node.right = insert(node.right, depth + 1, index * 2 + 1);
      return node;
    };
    root = insert(root);
  });
  const nodes: TreeNode[] = [];
  const walk = (node?: Node) => {
    if (!node) return;
    const spread = 36 / Math.max(1, node.depth + 1);
    nodes.push({ value: node.value, x: 50 + (node.index - 2 ** node.depth / 2 + 0.5) * spread, y: 16 + node.depth * 24, status: node.value === active ? "active" : undefined });
    walk(node.left);
    walk(node.right);
  };
  walk(root);
  return nodes;
}

function iconFor(meta: AlgoMeta) {
  const Icon = categoryIcons[meta.category];
  return <Icon className="h-4 w-4" aria-hidden />;
}

function AlgorithmVisualizer({ algorithmId, values, target, speed, version, compact = false }: { algorithmId: AlgorithmId; values: number[]; target: number; speed: number; version: number; compact?: boolean }) {
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
    <section className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            {iconFor(meta)}
            {meta.name}
          </div>
          <p className="text-xs text-slate-500">{meta.category}</p>
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

      <div className="h-1 bg-slate-100">
        <div className="h-full bg-teal-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className={`grid flex-1 gap-0 ${compact ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]"}`}>
        <div className="flex min-h-[360px] items-center justify-center bg-[#f9fbf8] p-4">
          <Visual step={step} meta={meta} />
        </div>
        <aside className="border-t border-slate-200 bg-white p-4 lg:border-l lg:border-t-0">
          <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase text-slate-500">
            <span>Step {index + 1} of {steps.length}</span>
            <span>{step.operations} ops</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-950">{step.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-650">{step.note}</p>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
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

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-950">{value}</p>
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
      className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-teal-500 hover:text-teal-700"
    >
      {children}
    </button>
  );
}

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
