import type { Step, TreeNode } from "@/app/algorithms/types";

export function range(start: number, end: number) {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function cloneBoard(board: number[][]) {
  return board.map((row) => [...row]);
}

export function layoutTree(values: number[], active: number): TreeNode[] {
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
    nodes.push({
      value: node.value,
      x: 50 + (node.index - 2 ** node.depth / 2 + 0.5) * spread,
      y: 16 + node.depth * 24,
      status: node.value === active ? "active" : undefined,
    });
    walk(node.left);
    walk(node.right);
  };

  walk(root);
  return nodes;
}

export function baseStep(values: number[], title: string, note: string, overrides: Partial<Step> = {}): Step {
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
