# HeadyWeb — Heady Ecosystem

## AutoContext Integration
This repository is part of the Heady ecosystem. For full project context, reference
[HeadyAutoContext](https://github.com/HeadySystems/HeadyAutoContext):

| Context Tier | Path | Use Case |
|-------------|------|----------|
| **Small** | `context/Small/heady-quick-context.md` | Quick tasks, token-limited chats |
| **Medium** | `context/Medium/` | Feature development, debugging, code review |
| **Large** | `context/Large/` | Deep architecture work, system design |

### Runtime Access
- **Service:** `getAutoContext().enrich()` — zero-code context injection
- **API:** `GET /api/context/:tier` — edge-served context
- **MCP:** `context` tool in heady-mcp-server — IDE access
- **CLI:** `heady context --tier medium --export ./path/`

## Architecture Reference
See [HeadyAutoContext docs/ARCHITECTURE.md](https://github.com/HeadySystems/HeadyAutoContext/blob/main/docs/ARCHITECTURE.md)
for the full 5-layer architecture (edge ingress, control plane, execution plane, memory plane, safety/health).
