import type { AlgorithmId, Step } from "@/app/algorithms/types";
import { sampleGraphEdges, sampleGraphNodes } from "@/app/algorithms/metadata";

export function graphSteps(id: AlgorithmId): Step[] {
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
