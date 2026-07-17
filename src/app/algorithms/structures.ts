import type { AlgorithmId, Step } from "@/app/algorithms/types";
import { layoutTree } from "@/app/algorithms/utils";

export function structureSteps(id: AlgorithmId, input: number[]): Step[] {
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
