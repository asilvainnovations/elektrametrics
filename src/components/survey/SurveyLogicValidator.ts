import { Question } from './QuestionEditor';

export type LogicErrorType = 'unreachable' | 'circular' | 'orphaned' | 'missing_target' | 'invalid_option';

export interface LogicError {
  type: LogicErrorType;
  questionId: string;
  questionIndex: number;
  message: string;
  severity: 'error' | 'warning';
  fixable: boolean;
  autoFix?: () => Question[];
}

/**
 * Validates survey question logic for:
 * - Unreachable questions (show_if condition can never be true)
 * - Circular references in skip logic
 * - Orphaned skip logic (references deleted/moved questions)
 * - Missing target questions
 * - Invalid option references
 */
export function validateQuestionLogic(questions: Question[]): LogicError[] {
  const errors: LogicError[] = [];
  const idMap = new Map(questions.map((q, i) => [q.id, i]));

  // 1. Check for orphaned references (target question doesn't exist)
  questions.forEach((q, i) => {
    if (q.show_if) {
      const targetIdx = idMap.get(q.show_if.question_id);
      if (targetIdx === undefined) {
        errors.push({
          type: 'orphaned',
          questionId: q.id,
          questionIndex: i,
          message: `Q${i + 1} references a question that no longer exists`,
          severity: 'error',
          fixable: true,
        });
      } else if (targetIdx >= i) {
        // Target appears after the dependent question
        errors.push({
          type: 'orphaned',
          questionId: q.id,
          questionIndex: i,
          message: `Q${i + 1} depends on Q${targetIdx + 1}, which appears later in the survey`,
          severity: 'error',
          fixable: true,
        });
      }
    }
  });

  // 2. Check for invalid option references
  questions.forEach((q, i) => {
    if (q.show_if) {
      const targetIdx = idMap.get(q.show_if.question_id);
      if (targetIdx !== undefined && targetIdx < i) {
        const target = questions[targetIdx];
        if (target.options && !target.options.includes(q.show_if.equals)) {
          errors.push({
            type: 'invalid_option',
            questionId: q.id,
            questionIndex: i,
            message: `Q${i + 1} checks for "${q.show_if.equals}" but Q${targetIdx + 1} doesn't have that option`,
            severity: 'error',
            fixable: true,
          });
        }
      }
    }
  });

  // 3. Check for circular references using DFS
  const adjacency = new Map<string, string[]>();
  questions.forEach(q => {
    if (q.show_if) {
      const deps = adjacency.get(q.id) || [];
      deps.push(q.show_if.question_id);
      adjacency.set(q.id, deps);
    }
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string, path: string[]): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const deps = adjacency.get(nodeId) || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        if (hasCycle(dep, [...path, nodeId])) return true;
      } else if (recursionStack.has(dep)) {
        // Found cycle - report it
        const cycleStart = path.indexOf(dep);
        const cycle = [...path.slice(cycleStart), nodeId];
        const cycleIndices = cycle.map(id => idMap.get(id)!).filter(i => i !== undefined);
        errors.push({
          type: 'circular',
          questionId: nodeId,
          questionIndex: idMap.get(nodeId) || 0,
          message: `Circular logic detected: ${cycleIndices.map(i => `Q${i + 1}`).join(' → ')} → Q${(idMap.get(nodeId) || 0) + 1}`,
          severity: 'error',
          fixable: true,
        });
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  questions.forEach(q => {
    if (!visited.has(q.id)) {
      hasCycle(q.id, []);
    }
  });

  // 4. Check for unreachable questions
  // A question is unreachable if ALL paths to it require conditions that can't be simultaneously satisfied
  // For simplicity: if a question depends on a question that itself is conditional, 
  // and there's no path where both can be shown
  const reachable = new Set<number>();

  // Start with questions that have no show_if (always shown)
  questions.forEach((q, i) => {
    if (!q.show_if) reachable.add(i);
  });

  // Iteratively mark questions as reachable if their condition references a reachable question
  let changed = true;
  while (changed) {
    changed = false;
    questions.forEach((q, i) => {
      if (reachable.has(i) || !q.show_if) return;
      const targetIdx = idMap.get(q.show_if.question_id);
      if (targetIdx !== undefined && reachable.has(targetIdx)) {
        reachable.add(i);
        changed = true;
      }
    });
  }

  questions.forEach((q, i) => {
    if (!reachable.has(i) && q.show_if) {
      // Check if it's truly unreachable due to circular dependency on conditional chain
      const targetIdx = idMap.get(q.show_if.question_id);
      if (targetIdx !== undefined && !reachable.has(targetIdx)) {
        // The target itself is unreachable, making this one unreachable too
        errors.push({
          type: 'unreachable',
          questionId: q.id,
          questionIndex: i,
          message: `Q${i + 1} can never be shown because Q${targetIdx + 1} (its condition) is also unreachable`,
          severity: 'error',
          fixable: true,
        });
      }
    }
  });

  // 5. Check for questions that are unreachable because they depend on a later question
  questions.forEach((q, i) => {
    if (q.show_if) {
      const targetIdx = idMap.get(q.show_if.question_id);
      if (targetIdx !== undefined && targetIdx >= i) {
        errors.push({
          type: 'unreachable',
          questionId: q.id,
          questionIndex: i,
          message: `Q${i + 1} depends on Q${targetIdx + 1} which appears later — respondents will never see it`,
          severity: 'error',
          fixable: true,
        });
      }
    }
  });

  return errors;
}

/**
 * Auto-fix functions for common logic errors
 */
export function autoFixErrors(questions: Question[], errors: LogicError[]): Question[] {
  let fixed = [...questions];

  for (const error of errors) {
    if (!error.fixable) continue;

    switch (error.type) {
      case 'orphaned':
      case 'invalid_option':
      case 'unreachable':
        // Remove the show_if condition
        fixed = fixed.map(q => 
          q.id === error.questionId ? { ...q, show_if: null } : q
        );
        break;
      case 'circular':
        // Break the cycle by removing show_if from the last question in the cycle
        fixed = fixed.map(q => 
          q.id === error.questionId ? { ...q, show_if: null } : q
        );
        break;
    }
  }

  return fixed;
}

/**
 * Check if there are any blocking errors (severity === 'error')
 */
export function hasBlockingErrors(errors: LogicError[]): boolean {
  return errors.some(e => e.severity === 'error');
}
