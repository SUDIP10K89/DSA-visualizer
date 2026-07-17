export type Category = "Sorting" | "Searching" | "Data Structures" | "Graph Algorithms" | "Recursive Problems";

export type AlgorithmId =
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

export type AlgoMeta = {
  id: AlgorithmId;
  category: Category;
  name: string;
  icon: "sort" | "search" | "structure" | "graph" | "recursive";
  explanation: string;
  application: string;
  complexity: { best: string; average: string; worst: string; space: string };
  concepts: string[];
};

export type GraphNode = { id: string; x: number; y: number; value?: number; status?: string };
export type GraphEdge = { from: string; to: string; weight?: number; active?: boolean; selected?: boolean };
export type TreeNode = { value: number; x: number; y: number; status?: string };
export type TowerState = number[][];

export type Step = {
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
