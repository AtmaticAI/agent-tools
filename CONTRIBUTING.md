# Contributing to Agent Tools

Thank you for your interest in contributing to Agent Tools! This document provides guidelines and information for contributors.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Git

### Setup

```bash
# Fork and clone the repository
git clone git@github.com:YOUR_USERNAME/agent-tools.git
cd agent-tools

# Install dependencies
pnpm install

# Start development
pnpm dev
```

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test additions/fixes

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(json): add YAML conversion support
fix(pdf): handle empty page ranges
docs(readme): update MCP configuration
```

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `pnpm test`
4. Run linting: `pnpm lint`
5. Run type check: `pnpm typecheck`
6. Submit a PR with a clear description

### Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Add tests for new functionality
- Document public APIs

## Project Structure

```
agent-tools/
├── apps/web/           # Next.js application
└── packages/agent-tools/      # Core logic, MCP server, and A2A agent
```

### Adding a New Tool

1. Add core logic in `packages/agent-tools/src/<module>/`
2. Add MCP tool in `packages/agent-tools/src/tools/`
3. Add A2A skill in `packages/agent-tools/src/a2a/skills/`
4. Add API route in `apps/web/app/api/`
5. Add UI in `apps/web/app/(dashboard)/`
6. Add tests

## Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm test --filter=@atmaticai/agent-tools

# Run with coverage
pnpm test -- --coverage

# Run E2E tests
pnpm test:e2e
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update type definitions

## Release Process

Releases are managed by maintainers using changesets:

```bash
# Add a changeset
pnpm changeset

# Version packages
pnpm changeset version

# Publish
pnpm changeset publish
```

## Questions?

Open an issue or discussion on GitHub.
