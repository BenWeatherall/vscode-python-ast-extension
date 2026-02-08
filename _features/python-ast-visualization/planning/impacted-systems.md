# Impacted Systems

## Overview

This document identifies existing project components that will be impacted by implementing the Python AST visualization feature. Since this is a new project with no existing codebase, the impact is minimal and primarily relates to project structure and tooling setup.

## Project Status

Based on project analysis, this is a **greenfield project** with no existing implementation. The project structure exists only as a concept in `initial_concept.md`.

## Impacted Areas

### 1. Project Structure

**Current State:** No existing directory structure  
**Impact:** Must establish the complete project structure as outlined in the concept:
- Root-level configuration files (`package.json`, `pyproject.toml`)
- Directory structure for three main components (Python service, Webview UI, Extension Host)

**Changes Required:**
- Create base project structure following the sidecar architecture pattern
- Establish separation of concerns between Python service, TypeScript extension host, and React webview

### 2. Build and Development Tooling

**Current State:** No build configuration exists  
**Impact:** Must establish:
- Python virtual environment setup (via `uv` as per project rules)
- Node.js/TypeScript build pipeline for VS Code extension
- Webview bundling configuration (Vite/Esbuild as mentioned in concept)
- Testing infrastructure for both Python and TypeScript components

**Changes Required:**
- Create `install.sh` script per project rules
- Configure `pyproject.toml` for Python dependencies
- Configure `package.json` for Node.js dependencies and build scripts
- Set up bundling pipeline for webview code

### 3. Development Workflow

**Current State:** No development workflow established  
**Impact:** Must establish:
- Linting configuration (`ruff.toml` for Python, ESLint/TypeScript for extension)
- Type checking setup (`mypy` for Python, TypeScript compiler for extension)
- Testing framework setup (`unittest` for Python, Jest/Mocha for TypeScript)

**Changes Required:**
- Configure linting tools per project standards
- Set up test infrastructure following TDD practices
- Establish development commands and scripts

### 4. Documentation Structure

**Current State:** Only `initial_concept.md` exists  
**Impact:** Must create:
- `README.md` with executive summary, installation, and usage
- `docs/AI_CONTEXT/` directory structure for future feature planning
- Project documentation following content length rules (500 lines max)

**Changes Required:**
- Create comprehensive README
- Establish documentation structure for AI context files
- Document architecture and patterns

## No Impact Areas

The following areas are **not impacted** because they don't exist yet:
- Existing Python modules or services
- Existing TypeScript/JavaScript code
- Existing interfaces or APIs
- Existing data models or schemas
- Existing test suites

## Summary

Since this is a new project, the impact is primarily **structural and organizational** rather than functional. The main work involves establishing the project foundation according to the sidecar architecture pattern described in the initial concept, rather than modifying existing systems.

All "impacted" areas are actually **new areas to be created** as part of the initial project setup, which aligns with the greenfield nature of this feature.
