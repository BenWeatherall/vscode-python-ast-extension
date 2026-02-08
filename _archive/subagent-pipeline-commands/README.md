# Archived: Legacy Pipeline Commands

These Cursor commands were superseded by the subagent pipeline architecture (February 2025). They are retained for reference and for use by the pipeline subagents.

## What These Are

Ten standalone Cursor commands that previously formed the feature and bug pipelines. Each was invoked manually in sequence; the agent ran one command per phase and carried context forward in the same conversation.

## Why Archived

The project adopted Cursor 2.0+ Custom Subagents with orchestrator commands:

- **`feature-pipeline`** and **`bug-pipeline`** now orchestrate phases via specialized subagents (`/researcher`, `/architect`, `/debug-specialist`, `/task-decomposer`, `/implementer`).
- Subagents run in isolated context windows, reducing token bloat and persona drift.
- The **scratchpad pattern** (`.cursor/scratchpad.md`) provides explicit handoff between phases.
- The archived commands define the workflow each subagent executes; subagents reference these files.

## Replacement

| Archived Command | Replaced By |
|-----------------|-------------|
| `1-research-feature` | `feature-pipeline` Phase 1 → `/researcher` |
| `2-plan-feature` | `feature-pipeline` Phase 2 → `/architect` |
| `3-task_list` | `feature-pipeline` Phase 3 → `/task-decomposer` |
| `4-feature-tasks` | `feature-pipeline` Phase 3 → `/task-decomposer` |
| `implement-feature` | `feature-pipeline` Phase 4 → `/implementer` |
| `1-investigate-bug` | `bug-pipeline` Phase 1 → `/debug-specialist` |
| `2-research-bug` | `bug-pipeline` Phase 2 → `/researcher` |
| `3-plan-bug-fix` | `bug-pipeline` Phase 3 → `/architect` |
| `4-bug-fix-tasks` | `bug-pipeline` Phase 4 → `/task-decomposer` |
| `implement-fix` | `bug-pipeline` Phase 5 → `/implementer` |

## Usage

- **Pipeline workflow**: Use `/feature-pipeline` or `/bug-pipeline` in Composer. Subagents read workflow definitions from this archive.
- **Standalone phase**: If you need to run a single phase manually, copy the relevant command content from this archive into a temporary command or invoke the subagent directly with the archived file path.
- **Reference**: These files remain the canonical workflow specifications for each phase.
