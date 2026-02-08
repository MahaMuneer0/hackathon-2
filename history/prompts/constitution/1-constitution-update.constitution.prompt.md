---
id: 1
title: constitution-update
stage: constitution
date: 2025-12-28
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-app-phase1
branch: master
user: ABC
command: sp.constitution
labels: [constitution, setup, todo-app]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

```text
# Project Constitution - Todo App Phase I

## Why This Project Exists
We are building a simple Todo app to practice Spec-Driven Development. We start small (console app) and will make it bigger in later phases. The goal is to learn how to use AI (Claude Code) to build software by writing specs first, not code.

## Non-Negotiable Rules (Must Always Follow)

1. **Spec-Driven Only**
   Never write code directly. Always write or update a spec first. Only implement after a clear task from /sp.tasks.

2. **No Manual Coding**
   I (the human) will not type code myself. All code comes from Claude Code after I refine specs.

3. **Clean and Simple Code**
   - Use Python 3.13+
   - Follow PEP 8 style (clean indentation, good names)
   - Use type hints everywhere
   - Write small functions that do one thing
   - Add helpful comments and docstrings

4. **Project Structure**
   - All code in /src folder
   - Main file: src/main.py
   - Other files: src/models.py, src/todo_manager.py, etc.
   - README.md with how to run
   - CLAUDE.md with instructions for Claude Code

5. **Tech Stack (Cannot Change in Phase I)**
   - Pure Python (no external libraries except built-in ones)
   - In-memory storage only (use a list of dicts or simple class)
   - Console interface (input() and print())

6. **Task Rules**
   - Each task has an ID
   - Title (required, 1-200 characters)
   - Description (optional)
   - Completed status (True/False)
   - Auto-generated ID and created date

7. **Testing Mindset**
   - Code should be easy to test
   - We will add real tests later, but think about it now

8. **Agent Behavior**
   - Always reference the spec or task you are working on
   - If something is unclear, ask me to update the spec
   - Never add extra features without a new spec

These rules cannot be changed without updating this constitution first.

Last updated: December 28, 2025
```

## Response snapshot

Updated the constitution file at `.specify/memory/constitution.md` with the project principles for the Todo App Phase I project. The constitution now includes six core principles: Spec-Driven Development, No Manual Coding, Clean and Simple Code, Project Structure, Tech Stack Constraints, and Task Rules. It also includes sections for Additional Constraints, Development Workflow, and Governance. The constitution is version 1.0.0 and was ratified on 2025-12-28.

## Outcome

- ✅ Impact: Created initial project constitution file with all required principles and governance structure
- 🧪 Tests: none
- 📁 Files: Updated .specify/memory/constitution.md with the complete constitution
- 🔁 Next prompts: Ready to create spec for the todo app functionality
- 🧠 Reflection: The constitution provides clear guidance for the project and establishes the rules that must be followed during development

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin creating the spec for the todo app