# Bug Pipeline

Orchestrated multi-phase bug fix implementation. Invokes specialized subagents in sequence with scratchpad handoff. Use when fixing a bug from `_bugs/`. For new features, use `feature-pipeline` instead.

## Prerequisites

- User provides the bug name or identifier (used for `{bug_name}` in paths)
- Initial error description, symptoms, or reproduction report

## Instructions

Execute these phases in order. **Wait for user approval between Phase 3 and Phase 4** before proceeding to implementation tasks.

### Phase 1: Investigate

Invoke the `/debug-specialist` subagent. Pass it the bug name and ask it to:

1. Review the bug report or error description provided by the user
2. Execute the workflow in `@_archive/subagent-pipeline-commands/1-investigate-bug.md`
3. Create investigation docs in `_bugs/{bug_name}/investigation/`
4. Write a summary to `@.cursor/scratchpad.md` (bug name, investigation directory, root cause hypothesis, affected components)

### Phase 2: Research

Invoke the `/researcher` subagent. Ask it to:

1. Read `@.cursor/scratchpad.md` and investigation docs from `_bugs/{bug_name}/investigation/`
2. Execute the workflow in `@_archive/subagent-pipeline-commands/2-research-bug.md`
3. Create research docs in `_bugs/{bug_name}/research/`
4. Update `@.cursor/scratchpad.md` with key findings and applicable solutions

### Phase 3: Plan

Invoke the `/architect` subagent. Ask it to:

1. Read `@.cursor/scratchpad.md` and research docs from `_bugs/{bug_name}/research/`
2. Execute the workflow in `@_archive/subagent-pipeline-commands/3-plan-bug-fix.md`
3. Create fix plan in `_bugs/{bug_name}/plans/master/`
4. Update `@.cursor/scratchpad.md` with plan location and fix approach
5. Present the plan summary to the user

**STOP here. Wait for explicit user approval before Phase 4.**

### Phase 4: Task List Generation

Invoke the `/task-decomposer` subagent. Ask it to:

1. Read `@.cursor/scratchpad.md` and the plan from `_bugs/{bug_name}/plans/master/`
2. Execute the workflow in `@_archive/subagent-pipeline-commands/4-bug-fix-tasks.md`
3. Create task documents in `_bugs/{bug_name}/tasks/`
4. Update `@.cursor/scratchpad.md` with task count, ordered list of task file names, and execution order

### Phase 5: Per-Task Planning

For **each** task in execution order (from the scratchpad's task list):

Invoke the `/architect` subagent with a **fresh agent context**. Pass the bug name and single task file path. Ask it to:

1. Execute the workflow in `@_archive/subagent-pipeline-commands/5-plan-task-bug.md`
2. Create plan at `_bugs/{bug_name}/plans/tasks/{task_file}.md`
3. Update `@.cursor/scratchpad.md` with plan location

### Phase 6: Per-Task Implementation

For **each** task in execution order (from the scratchpad's task list):

Invoke the `/implementer` subagent with a **fresh agent context**. Pass the bug name and single task file path. Ask it to:

1. Read `@.cursor/scratchpad.md` for context
2. Execute the workflow in `@_archive/subagent-pipeline-commands/implement-task-fix.md`
3. Implement **only** that task; do not proceed to the next task until all tests pass
4. Update `@.cursor/scratchpad.md` with task completion status

**Invoke architect and implementer once per task in execution order. Each invocation uses a fresh agent context.**

## Notes

- Each subagent runs in an isolated context window; the scratchpad ensures handoff continuity
- Original commands (1-investigate-bug, 2-research-bug, etc.) remain available for standalone use
- Subagents are invoked via `/name` syntax (e.g., `/debug-specialist`, `/researcher`, `/architect`)
