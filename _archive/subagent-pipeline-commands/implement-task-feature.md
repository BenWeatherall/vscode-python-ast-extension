# Implement Single Feature Task

Implement one task from the feature pipeline. Invoked once per task with a fresh agent context. The plan is pre-created by the architect in the per-task planning phase. For bug fixes, use `implement-task-fix.md` instead. For full-feature implementation, use `implement-feature.md`.

## Regression Rules (MANDATORY)

- **Regression is not acceptable.** Any failing test after implementation must be fixed before the task is considered complete.
- **Do not claim tests are unrelated.** If a test fails after your changes, it is your responsibility to fix it. You may not dismiss failing tests as "unrelated" or "pre-existing" without explicit user confirmation.
- **Full test suite requirement:** Before marking a task complete, run the full test suite for affected component(s). All tests must pass.

## Prerequisites

- Task document exists in `_features/{feature_name}/tasks/{task_file}.md`
- Task plan exists in `_features/{feature_name}/plans/tasks/{task_file}.md` (created by architect)
- User provides: feature name, task file name (e.g. `01-create-model.md`)

## Instructions

Execute these phases in order. Focus only on this single task.

## Completion Checklist

**Check off each item as you complete it.**

**Phase 1: Context Gathering**
- [ ] Step 1.1: Read relevant codebase context from `docs/AI_CONTEXT/`
- [ ] Step 1.2: Read root `CHANGELOG.md` (or create if it doesn't exist)
- [ ] Step 1.3: Read task document and task plan
- [ ] Step 1.4: Read `@.cursor/scratchpad.md` for context
- [ ] Step 1.5: Identified affected component(s)

**Phase 2: Implementation**
- [ ] Step 2.1: Wrote tests first (TDD) following service-specific patterns
- [ ] Step 2.2: Verified tests FAIL before implementation
- [ ] Step 2.3: Implemented code changes following the approved plan
- [ ] Step 2.4: Ran code quality tools (ruff/mypy for Python, lint/check for UI) and fixed issues
- [ ] Step 2.5: Ran full test suite and verified all tests PASS (no regressions)
- [ ] Step 2.6: Completed service-specific validation (if applicable)

**Phase 3: Completion**
- [ ] Step 3.1: Updated root `CHANGELOG.md` under `## [Unreleased]` with plan and task links
- [ ] Step 3.2: Updated relevant documentation in `docs/AI_CONTEXT/` and READMEs (if applicable)
- [ ] Step 3.3: Archived task and plan files to `_archive/{feature_name}/`
- [ ] Step 3.4: Ran full test suite again; all tests passed
- [ ] Step 3.5: Verified no code quality errors remain
- [ ] Step 3.6: Updated `@.cursor/scratchpad.md` with "Task {task_file} completed, tests passing"

---

## Phase 1: Context Gathering

### Step 1.1: Read Codebase Context

Read relevant files from `docs/AI_CONTEXT/` based on task scope:
- **Always read**: AI_CONTEXT_QUICK_REFERENCE.md, AI_CONTEXT_REPOSITORY.md
- **If affecting Python service**: Read AI_CONTEXT_PYTHON_SERVICE.md
- **If affecting webview UI**: Read AI_CONTEXT_WEBVIEW_UI.md
- **If affecting extension host**: Read AI_CONTEXT_EXTENSION_HOST.md
- **Always read**: AI_CONTEXT_PATTERNS.md

### Step 1.2: Read Changelog

Read root `CHANGELOG.md` (create if it doesn't exist). Understand recent changes and changelog format.

### Step 1.3: Read Task and Plan

1. Read the task from `_features/{feature_name}/tasks/{task_file}.md`
2. Read the plan from `_features/{feature_name}/plans/tasks/{task_file}.md`
3. If the plan seems incomplete, request the architect to update it before proceeding

### Step 1.4: Read Scratchpad

Read `@.cursor/scratchpad.md` for feature name, pipeline state, and prior task completions.

### Step 1.5: Analyze Scope

Determine which service(s) or component(s) are affected (Python service, webview UI, extension host, utilities) based on the task and plan.

---

## Phase 2: Implementation

Follow the TDD workflow. Reference `@_archive/subagent-pipeline-commands/implement-feature.md` for detailed commands (pytest, ruff, mypy, npm run test, etc.).

### Step 2.1: Write Tests First

Create or update tests per the task plan's Test Strategy. Follow component-specific patterns from AI_CONTEXT.

### Step 2.2: Verify Tests Fail

Run tests and verify they FAIL before implementation. If they pass, adjust tests until they correctly validate expected behavior and fail.

### Step 2.3: Implement Code Changes

Implement following the plan's Implementation Order. Follow component-specific patterns from AI_CONTEXT_PATTERNS.md.

### Step 2.4: Run Code Quality Tools

Run ruff/mypy (Python) or lint/check (UI) and fix any issues.

### Step 2.5: Run Full Test Suite

Run the **full** test suite for affected component(s). **All tests must pass.** If any test fails, fix it before proceeding. Do not claim failures are "unrelated" to your changes.

### Step 2.6: Component-Specific Validation

Complete any validation steps from the plan (e.g. AST parsing, Rete.js rendering).

---

## Phase 3: Completion

### Step 3.1: Update Changelog

Add entry under `## [Unreleased]` in appropriate subsection (`### Added`, `### Changed`, etc.):

```markdown
- Description of the change
  - Plan: [task-name](_archive/{feature_name}/plans/tasks/{task_file})
  - Task: [task-name](_archive/{feature_name}/tasks/{task_file})
```

### Step 3.2: Update Documentation

Update relevant files in `docs/AI_CONTEXT/` and component READMEs based on what changed.

### Step 3.3: Archive Task and Plan

Move task and plan to archive:

```
mkdir -p _archive/{feature_name}/tasks
mkdir -p _archive/{feature_name}/plans/tasks
mv _features/{feature_name}/tasks/{task_file} _archive/{feature_name}/tasks/
mv _features/{feature_name}/plans/tasks/{task_file} _archive/{feature_name}/plans/tasks/
```

### Step 3.4: Final Validation

Run full test suite again. All tests must pass. Verify no code quality errors.

### Step 3.5: Update Scratchpad

Add to `@.cursor/scratchpad.md`: "Task {task_file} completed, tests passing"

---

## Notes

- This workflow is invoked **once per task** with a fresh agent context
- Do not proceed to the next task until this task is fully complete and all tests pass
- The plan was created by the architect in the per-task planning phase; do not create a new plan
