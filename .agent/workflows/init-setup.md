---
description: 
---

# AI Workflow Adoption Guide

This guide enables any AI agent to adopt a standardized, specification-driven development workflow. It can be used across multiple projects on the same machine.

---

## Quick Start

### For a New Project

1. **Install OpenSpec CLI** (once per machine):
   ```bash
   npm install -g @fission-ai/openspec@latest
   ```

2. **Initialize in your project**:
   ```bash
   cd your-project
   openspec init
   # Select your AI tool (e.g., Antigravity, Claude, Cursor)
   ```

3. **Populate project context**:
   Ask your AI: "Please read openspec/project.md and help me fill it out with details about my project"

4. **Verify/Create Standard Workflows**:
   Ensure the following files exist in `.agent/workflows/`. If not, create them:

   **openspec-proposal.md**:
   ```markdown
   ---
   description: create a new change proposal
   ---
   # OpenSpec Proposal
   
   1. Create a new proposal
   \`\`\`bash
   openspec new
   \`\`\`
   2. Follow the interactive prompts to define your change.
   ```

   **openspec-apply.md**:
   ```markdown
   ---
   description: apply an approved change
   ---
   # OpenSpec Apply
   
   1. List available changes
   \`\`\`bash
   openspec list
   \`\`\`
   2. Apply the change
   \`\`\`bash
   openspec apply <change-id>
   \`\`\`
   ```

   **openspec-archive.md**:
   ```markdown
   ---
   description: archive a completed change
   ---
   # OpenSpec Archive
   
   1. Archive the change (moves to main specs)
   \`\`\`bash
   openspec archive <change-id>
   \`\`\`
   ```

5. **Create Project-Specific Workflows**:
   Analyze the project root (look for `package.json`, `requirements.txt`, `docker-compose.yml`, `Makefile`).
   Based on what you find, create relevant workflows in `.agent/workflows/`:
   
   - **Build/Setup**: `setup-dev.md` (e.g., `npm install`, `pip install`)
   - **Run App**: `run-app.md` (e.g., `npm run dev`, `python app.py`)
   - **Deploy/Docker**: `run-docker.md` (e.g., `docker-compose up`)

6. **Start using the workflow**:
   - `/openspec-proposal` - Create change proposals
   - `/openspec-apply` - Implement approved changes
   - `/openspec-archive` - Archive completed work

---

## Core Workflow Concepts

### The Three-Stage Process

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│  1. PROPOSAL        │ ───► │  2. IMPLEMENTATION  │ ───► │  3. ARCHIVE         │
│  (Design First)     │      │  (Code with Plan)   │      │  (Update Truth)     │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

1. **Proposal** - AI drafts specs, tasks, and design before any code
2. **Implementation** - AI implements tasks from the approved plan
3. **Archive** - Completed change merges into source-of-truth specs

### Directory Structure

```
project/
├── .agent/workflows/           # AI workflow commands
│   ├── openspec-proposal.md
│   ├── openspec-apply.md
│   ├── openspec-archive.md
│   └── [your-custom-workflows].md
├── openspec/
│   ├── AGENTS.md               # AI behavior instructions
│   ├── project.md              # Project context for AI
│   ├── specs/                  # Source of truth
│   │   └── [domain]/
│   │       └── spec.md
│   └── changes/                # Work in progress
│       └── [change-id]/
│           ├── proposal.md     # What and why
│           ├── tasks.md        # Implementation checklist
│           ├── design.md       # Technical decisions (optional)
│           └── specs/          # Delta specs
└── AGENTS.md                   # Root-level AI instructions
```

---

## Custom Workflows (Beyond OpenSpec)

You can create additional workflows in `.agent/workflows/`:

### Example: Python Environment (`python-env.md`)

```markdown
---
description: how to manage Python dependencies using uv
---
# Python Environment

// turbo
1. Add a dependency:
\`\`\`bash
uv add package-name
\`\`\`
```

### Example: End-of-Day Cleanup (`cleanup.md`)

```markdown
---
description: end of day cleanup tasks
---
# Cleanup

1. Move session notes to docs/sessions/
2. Move test files to appropriate test folders
3. Delete temporary files
```

### Workflow Annotations

- `// turbo` - Auto-run the next command without user confirmation
- `// turbo-all` - Auto-run ALL commands in the workflow

---

## Shared Workflows Across Projects

### Option 1: Global Workflows (User-Level)

Create workflows in `~/.gemini/workflows/` (or equivalent for your AI tool):

```
~/.gemini/
└── workflows/
    ├── python-env.md      # Shared Python workflow
    ├── cleanup.md         # Shared cleanup workflow
    └── git-conventions.md # Shared git workflow
```

These will be available in ALL projects.

### Option 2: Template Repository

Create a template repo with your standard workflows:

```bash
# Create template
git clone your-org/workflow-template ./new-project

# Structure
workflow-template/
├── .agent/workflows/
│   ├── cleanup.md
│   ├── python-env.md
│   └── code-review.md
├── openspec/
│   └── project.md.template
└── AGENTS.md
```

### Option 3: Symlinked Shared Folder

```bash
# Create central workflow location
mkdir ~/shared-workflows

# Symlink into each project
ln -s ~/shared-workflows .agent/shared-workflows
```

---

## Token Cost Assessment

### When to Use OpenSpec

| Scenario | Use OpenSpec? | Reason |
|----------|---------------|--------|
| Large feature (>100 lines) | ✅ Yes | Upfront planning saves rework |
| Bug fix | ❌ No | Direct fix is faster |
| Refactoring | ⚠️ Maybe | Use for significant restructuring |
| New API/module | ✅ Yes | Specs clarify interface design |
| UI tweak | ❌ No | Too small, direct edit preferred |

### Cost-Benefit Signals

**OpenSpec is SAVING tokens when:**
- AI is asking fewer clarifying questions
- Implementation matches expectations on first try
- Less back-and-forth on design decisions
- Fewer "undo this and do it differently" requests

**OpenSpec is COSTING tokens when:**
- Simple changes require full proposal workflow
- Specs are being written for obvious implementations
- Archiving workflow is longer than the actual change

### Recommendation
Track your experience. If OpenSpec proposals consistently prevent rewrites, keep using it. If proposals feel like overhead for your change size, skip them.

---

## Adapting to This Workflow

### For AI Agents (Copy This to Your Project)

Add this to your project's `AGENTS.md` or system instructions:

```markdown
## Development Workflow

I follow a specification-driven development workflow:

1. **For significant changes**: Use `/openspec-proposal` to draft a proposal before coding
2. **For implementation**: Use `/openspec-apply` to work through approved tasks
3. **After completion**: Use `/openspec-archive` to update source-of-truth specs

### Project-Specific Workflows
- `/python-env` - Python dependency management with uv
- `/cleanup` - End-of-day repository organization
- `/todo` - Current project tasks

### Key Principles
- Design before implementation for non-trivial changes
- Keep changes minimal and focused
- Update tasks.md as work progresses
- Archive completed changes to maintain spec accuracy
```

---

## Quick Reference: CLI Commands

```bash
# View active changes
openspec list

# View specs
openspec list --specs

# Show change details
openspec show <change-id>

# Validate change
openspec validate <change-id> --strict

# Archive completed change
openspec archive <change-id> --yes
```

---

## Troubleshooting

### "Slash commands not appearing"
Restart your AI tool - commands are loaded at startup.

### "openspec command not found"
Run: `npm install -g @fission-ai/openspec@latest`

### "Changes folder empty"
Run: `openspec init` if not already initialized.

### "Validation failing"
Check delta format:
- Use `## ADDED|MODIFIED|REMOVED Requirements`
- Each requirement needs `#### Scenario:` block
- Use SHALL/MUST in requirement text
