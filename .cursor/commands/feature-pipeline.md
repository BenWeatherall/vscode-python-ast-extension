# Feature Pipeline

Orchestrated multi-phase feature implementation. Invokes specialized subagents in sequence with scratchpad handoff. Use when implementing a feature from a feature file in `_features/`. For bug fixes, use `bug-pipeline` instead.

## Prerequisites

- Feature file exists in `_features/{feature_name}.md` with Background, This Task, and Testing Needed sections
- User provides the feature name or path (e.g., `python-ast-visualization`)

## Commit Procedure

Reusable commit workflow executed after each successful phase or task. A phase/task is "successful" when all required steps are fully implemented and all project tests pass.

1. **Run all project tests** (both Python and Node):
   - `source .venv/bin/activate && python -m pytest tests/ -v`
   - `pnpm run test`
2. **Enforce regression gate**: only tests marked as expected failures (`@pytest.mark.xfail`, `@unittest.expectedFailure`) may fail. Any other failure is a regression and **must** be resolved before committing.
3. **Stage changed files**: `git add .`
4. **Safety check**: verify no `.env`, `*.key`, `*.pem`, or `secrets.*` files are staged. If found, unstage them (`git restore --staged <path>`) and warn.
5. **Generate a Conventional Commits message** per `@.cursor/commands/commit.md`:
   - Format: `<type>(<scope>): <brief description>`
   - Optional body: goal-focused bullet points, each under 100 characters
   - Type and scope are provided per-phase below; for implementation tasks the implementer infers them from the changes
6. **Execute the commit**: `git commit -m "<message>"`

## Instructions

Execute these phases in order. **Wait for user approval between Phase 2 and Phase 3** before proceeding to implementation tasks.

### Resume Detection (Before Phase 1)

1. Read `@.cursor/scratchpad.md`
2. If it contains a "Feature: {feature_name}" section with "Pipeline State" and "Task Completion Status":
   - **Phase 1-4**: Skip each phase marked "Complete" in Pipeline State
   - **Phase 5**: Compute remaining tasks = tasks in Execution Order that are NOT listed in Task Completion Status. Proceed to Phase 5 Implementation with only remaining tasks.
3. If no matching feature state or scratchpad is empty, start from Phase 1.

### Phase 1: Research

**Skip if Pipeline State shows Phase 1 Complete when resuming.**

Invoke the `/researcher` subagent. Pass it the feature path and ask it to:

1. Read the feature file from `_features/{feature_name}.md`
2. Execute the workflow in `@_archive/subagent-pipeline-commands/1-research-feature.md`
3. Produce planning docs in `_features/{feature_name}/planning/`
4. Write a summary to `@.cursor/scratchpad.md` (feature name, output directory, key findings, selected solution)

**Commit**: Run the **Commit Procedure**. Use type `docs`, scope `feature`, description: `research {feature_name}`.

### Phase 2: Plan

**Skip if Pipeline State shows Phase 2 Complete when resuming.**

Invoke the `/architect` subagent. Ask it to:

1. Read `@.cursor/scratchpad.md` and the planning docs from `_features/{feature_name}/planning/`
2. Execute the workflow in `@_archive/subagent-pipeline-commands/2-plan-feature.md`
3. Create implementation plan in `_features/{feature_name}/plans/master/`
4. Update `@.cursor/scratchpad.md` with plan location and key decisions
5. Present the plan summary to the user

**STOP here. Wait for explicit user approval before Phase 3.**

**Commit**: After user approval, run the **Commit Procedure**. Use type `docs`, scope `feature`, description: `plan {feature_name}`.

### Phase 3: Task List Generation

**Skip if Pipeline State shows Phase 3 Complete when resuming.**

Invoke the `/task-decomposer` subagent. Ask it to:

1. Read `@.cursor/scratchpad.md` and the plan from `_features/{feature_name}/plans/master/`
2. Execute the workflow in `@_archive/subagent-pipeline-commands/3-task_list.md` and `@_archive/subagent-pipeline-commands/4-feature-tasks.md`
3. Create task documents in `_features/{feature_name}/tasks/`
4. Update `@.cursor/scratchpad.md` with task count, ordered list of task file names, and execution order

**Commit**: Run the **Commit Procedure**. Use type `docs`, scope `feature`, description: `generate task list for {feature_name}`.

### Phase 4: Per-Task Planning

**Skip if Pipeline State shows Phase 4 Complete when resuming.**

For **each** task in execution order (from the scratchpad's task list):

Invoke the `/architect` subagent with a **fresh agent context**. Pass the feature name and single task file path. Ask it to:

1. Execute the workflow in `@_archive/subagent-pipeline-commands/5-plan-task-feature.md`
2. Create plan at `_features/{feature_name}/plans/tasks/{task_file}.md`
3. Update `@.cursor/scratchpad.md` with plan location

**Commit**: After all task plans are created, run the **Commit Procedure**. Use type `docs`, scope `feature`, description: `plan tasks for {feature_name}`.

### Phase 5: Per-Task Implementation

When resuming: iterate over **remaining tasks** only (from Resume Detection). Otherwise: full execution order.

For **each** task in the applicable list:

1. If plan does NOT exist at `_features/{feature_name}/plans/tasks/{task_file}.md`: invoke `/architect` first (per `5-plan-task-feature.md`), then proceed.
2. Invoke the `/implementer` subagent with a **fresh agent context**. Pass the feature name and single task file path. Ask it to:
   - Read `@.cursor/scratchpad.md` for context
   - Execute the workflow in `@_archive/subagent-pipeline-commands/implement-task-feature.md`
   - Implement **only** that task; do not proceed to the next task until all project tests pass (tests marked as expected failures are excluded; all other failures are regressions that must be resolved)
   - Run the **Commit Procedure** (defined in `implement-task-feature.md` Step 3.6: Commit Changes) to commit all changes for the completed task
   - Update `@.cursor/scratchpad.md` with task completion status

**Invoke architect and implementer once per task. Each invocation uses a fresh agent context.**

## Notes

- Each subagent runs in an isolated context window; the scratchpad ensures handoff continuity
- Original commands (1-research-feature, 2-plan-feature, etc.) remain available for standalone use
- Subagents are invoked via `/name` syntax (e.g., `/researcher`, `/architect`)
- **Resume**: A fresh invocation reads the scratchpad and skips completed phases; Phase 5 iterates only over remaining tasks
