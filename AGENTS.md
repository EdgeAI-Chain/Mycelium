<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Development Workflow

I follow a specification-driven development workflow:

1. **For significant changes**: Use `/openspec-proposal` to draft a proposal before coding
2. **For implementation**: Use `/openspec-apply` to work through approved tasks
3. **After completion**: Use `/openspec-archive` to update source-of-truth specs

### Project-Specific Workflows
- `/setup-dev` - Install Frontend and Backend dependencies
- `/run-dashboard` - Start the React Frontend
- `/run-edge` - Start the Python Edge Services
- `/python-env` - Python dependency management (if applicable)

### Key Principles
- Design before implementation for non-trivial changes
- Keep changes minimal and focused
- Update tasks.md as work progresses
- Archive completed changes to maintain spec accuracy