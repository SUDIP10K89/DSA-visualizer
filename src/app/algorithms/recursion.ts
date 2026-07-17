import type { AlgorithmId, Step, TowerState } from "@/app/algorithms/types";
import { cloneBoard } from "@/app/algorithms/utils";

export function recursiveSteps(id: AlgorithmId, input: number[]): Step[] {
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
