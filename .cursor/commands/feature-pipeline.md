# Feature Pipeline

Orchestrated multi-phase feature implementation. Invokes specialized subagents in sequence with scratchpad handoff. Use when implementing a feature from a feature file in `_features/`. For bug fixes, use `bug-pipeline` instead.

## Prerequisites

- Feature file exists in `_features/{feature_name}.md` with Background, This Task, and Testing Needed sections
- User provides the feature name or path (e.g., `python-ast-visualization`)

## Instructions

Execute these phases in order. **Wait for user approval between Phase 2 and Phase 3** before proceeding to implementation tasks.

### Phase 1: Research

Invoke the `/researcher` subagent. Pass it the feature path and ask it to:

1. Read the feature file from `_features/{feature_name}.md`
2. Execute the workflow in `@_archive/subagent-pipeline-commands/1-research-feature.md`
3. Produce planning docs in `_features/{feature_name}/planning/`
4. Write a summary to `@.cursor/scratchpad.md` (feature name, output directory, key findings, selected solution)

### Phase 2: Plan

Invoke the `/architect` subagent. Ask it to:

1. Read `@.cursor/scratchpad.md` and the planning docs from `_features/{feature_name}/planning/`
2. Execute the workflow in `@_archive/subagent-pipeline-commands/2-plan-feature.md`
3. Create implementation plan in `_features/{feature_name}/plans/master/`
4. Update `@.cursor/scratchpad.md` with plan location and key decisions
5. Present the plan summary to the user

**STOP here. Wait for explicit user approval before Phase 3.**

### Phase 3: Task List Generation

Invoke the `/task-decomposer` subagent. Ask it to:

1. Read `@.cursor/scratchpad.md` and the plan from `_features/{feature_name}/plans/master/`
2. Execute the workflow in `@_archive/subagent-pipeline-commands/3-task_list.md` and `@_archive/subagent-pipeline-commands/4-feature-tasks.md`
3. Create task documents in `_features/{feature_name}/tasks/`
4. Update `@.cursor/scratchpad.md` with task count, ordered list of task file names, and execution order

### Phase 4: Per-Task Planning

For **each** task in execution order (from the scratchpad's task list):

Invoke the `/architect` subagent with a **fresh agent context**. Pass the feature name and single task file path. Ask it to:

1. Execute the workflow in `@_archive/subagent-pipeline-commands/5-plan-task-feature.md`
2. Create plan at `_features/{feature_name}/plans/tasks/{task_file}.md`
3. Update `@.cursor/scratchpad.md` with plan location

### Phase 5: Per-Task Implementation

For **each** task in execution order (from the scratchpad's task list):

Invoke the `/implementer` subagent with a **fresh agent context**. Pass the feature name and single task file path. Ask it to:

1. Read `@.cursor/scratchpad.md` for context
2. Execute the workflow in `@_archive/subagent-pipeline-commands/implement-task-feature.md`
3. Implement **only** that task; do not proceed to the next task until all tests pass
4. Update `@.cursor/scratchpad.md` with task completion status

**Invoke architect and implementer once per task in execution order. Each invocation uses a fresh agent context.**

## Notes

- Each subagent runs in an isolated context window; the scratchpad ensures handoff continuity
- Original commands (1-research-feature, 2-plan-feature, etc.) remain available for standalone use
- Subagents are invoked via `/name` syntax (e.g., `/researcher`, `/architect`)
