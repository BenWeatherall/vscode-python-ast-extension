# Plan Single Feature Task

Create a fully realized implementation plan for one task from the feature pipeline. Invoked once per task with a fresh agent context. For bug fixes, use `5-plan-task-bug.md` instead.

## Prerequisites

- Task document exists in `_features/{feature_name}/tasks/{task_file}.md`
- Master plan exists in `_features/{feature_name}/plans/master/`
- User provides: feature name, task file name (e.g. `01-create-model.md`)

## Instructions

Execute these steps in order. Focus only on this single task.

### Step 1: Read Context

1. Read `@.cursor/scratchpad.md` for feature name and pipeline state
2. Read the task document from `_features/{feature_name}/tasks/{task_file}.md`
3. Read master plan from `_features/{feature_name}/plans/master/` (overview.md, implementation.md, testing.md)
4. Read relevant files from `@docs/AI_CONTEXT/` based on task scope:
   - Always read: AI_CONTEXT_QUICK_REFERENCE.md, AI_CONTEXT_REPOSITORY.md
   - Read service-specific context if task affects Python service, webview UI, or extension host
   - Always read: AI_CONTEXT_PATTERNS.md

### Step 2: Deep Understanding

Analyze the task to ensure full understanding:

- What files will be created or modified?
- What are the dependencies on other tasks (already completed)?
- What tests must be written first (TDD)?
- What are the acceptance criteria?
- What interfaces or models are involved?

### Step 3: Create Task Plan

Ensure `_features/{feature_name}/plans/tasks/` exists. Create a single plan document at `_features/{feature_name}/plans/tasks/{task_file}.md` with:

1. **Overview**: What this task accomplishes within the feature
2. **Files to Create/Modify**: List all files with specific changes
3. **Test Strategy**: Which tests to write first (TDD), in what order
4. **Implementation Order**: Step-by-step sequence for this task
5. **Validation Steps**: How to verify the task is complete
6. **Documentation Updates**: What docs need updating for this task

### Step 4: Update Scratchpad

Add to `@.cursor/scratchpad.md`: "Task plan created: {task_file} at plans/tasks/{task_file}"

## Output

- Plan file: `_features/{feature_name}/plans/tasks/{task_file}.md`
- Scratchpad updated with plan location

## Notes

- This workflow is invoked **once per task** with a fresh agent context
- The plan must be detailed enough for the implementer to execute without ambiguity
- Reference the master plan for consistency but focus exclusively on this task
