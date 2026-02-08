# Plan Single Bug Fix Task

Create a fully realized implementation plan for one task from the bug fix pipeline. Invoked once per task with a fresh agent context. For features, use `5-plan-task-feature.md` instead.

## Prerequisites

- Task document exists in `_bugs/{bug_name}/tasks/{task_file}.md`
- Master plan exists in `_bugs/{bug_name}/plans/master/`
- User provides: bug name, task file name (e.g. `01-add-regression-test.md`)

## Instructions

Execute these steps in order. Focus only on this single task.

### Step 1: Read Context

1. Read `@.cursor/scratchpad.md` for bug name and pipeline state
2. Read the task document from `_bugs/{bug_name}/tasks/{task_file}.md`
3. Read master plan from `_bugs/{bug_name}/plans/master/` (overview.md, fix-approach.md, implementation.md, testing.md, validation.md)
4. Read relevant files from `@docs/AI_CONTEXT/` based on task scope:
   - Always read: AI_CONTEXT_QUICK_REFERENCE.md, AI_CONTEXT_REPOSITORY.md
   - Read service-specific context if task affects Python service, webview UI, or extension host
   - Always read: AI_CONTEXT_PATTERNS.md

### Step 2: Deep Understanding

Analyze the task to ensure full understanding:

- What files will be created or modified?
- What are the dependencies on other tasks (already completed)?
- What regression tests must be written first (when feasible)?
- What are the acceptance criteria?
- How does this task contribute to fixing the bug?

### Step 3: Create Task Plan

Ensure `_bugs/{bug_name}/plans/tasks/` exists. Create a single plan document at `_bugs/{bug_name}/plans/tasks/{task_file}.md` with:

1. **Overview**: What this task accomplishes within the fix
2. **Files to Create/Modify**: List all files with specific changes
3. **Test Strategy**: Regression tests first when feasible (TDD)
4. **Implementation Order**: Step-by-step sequence for this task
5. **Validation Steps**: How to verify the task and prevent regression
6. **Documentation Updates**: What docs need updating for this task

### Step 4: Update Scratchpad

Add to `@.cursor/scratchpad.md`: "Task plan created: {task_file} at plans/tasks/{task_file}"

## Output

- Plan file: `_bugs/{bug_name}/plans/tasks/{task_file}.md`
- Scratchpad updated with plan location

## Notes

- This workflow is invoked **once per task** with a fresh agent context
- The plan must be detailed enough for the implementer to execute without ambiguity
- Prioritize regression tests that reproduce the bug before applying the fix
