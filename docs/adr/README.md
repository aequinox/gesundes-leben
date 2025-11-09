# Architectural Decision Records (ADRs)

This directory contains Architectural Decision Records (ADRs) documenting the key architectural and design decisions made for this project.

## What is an ADR?

An ADR is a document that captures an important architectural decision made along with its context and consequences. ADRs help teams understand:

- **Why** certain patterns were chosen
- **What** alternatives were considered
- **When** the decision was made
- **What** the trade-offs are

## ADR Format

Each ADR follows this structure:

- **Title**: Short descriptive title
- **Status**: Proposed, Accepted, Deprecated, Superseded
- **Date**: When the decision was made
- **Context**: The issue motivating this decision
- **Decision**: What was decided and how it works
- **Consequences**: Positive, negative, and neutral outcomes
- **Alternatives**: Other options that were considered
- **References**: Related code, docs, or other ADRs

## Current ADRs

| Number | Title | Status | Date |
|--------|-------|--------|------|
| [0001](0001-schema-builder-utility.md) | SchemaBuilder Utility for Schema.org Structured Data | Accepted | 2025-11-09 |
| [0002](0002-component-composition-pattern.md) | Component Composition Pattern (H1-H6 Delegation) | Accepted | 2025-11-09 |
| [0003](0003-reference-caching-architecture.md) | Reference Caching Architecture | Accepted | 2025-11-09 |
| [0004](0004-logging-abstraction.md) | Logging Abstraction Layer | Accepted | 2025-11-09 |
| [0005](0005-content-collections-structure.md) | Content Collections Structure | Accepted | 2025-11-09 |

## Key Architectural Patterns

### 1. SchemaBuilder Utility (ADR-0001)
Eliminated 150-200 lines of duplicate Schema.org code by centralizing schema generation logic.

### 2. Component Composition (ADR-0002)
H1-H6 components delegate to base H.astro component, demonstrating the Open/Closed Principle.

### 3. Reference Caching (ADR-0003)
Sophisticated file-based caching system providing 90% performance improvement for reference loading.

### 4. Logging Abstraction (ADR-0004)
Centralized logger utility replacing console.log with production-safe, configurable logging.

### 5. Content Collections (ADR-0005)
Astro content collections with Zod schemas providing type-safe, validated content management.

## Creating New ADRs

When making significant architectural decisions:

1. **Create a new ADR file**: `docs/adr/NNNN-short-title.md`
2. **Use sequential numbering**: Next number in sequence
3. **Follow the standard format**: See existing ADRs
4. **Link related ADRs**: Reference related decisions
5. **Update this README**: Add entry to the table above

## ADR Lifecycle

- **Proposed**: Decision under discussion
- **Accepted**: Decision approved and implemented
- **Deprecated**: Decision no longer recommended (but may still be in use)
- **Superseded**: Replaced by a newer ADR (link to replacement)

## Benefits of ADRs

1. **Knowledge preservation**: Decisions documented for future team members
2. **Onboarding**: New developers understand architectural choices quickly
3. **Avoiding repetition**: Don't revisit settled decisions
4. **Context sharing**: Understand trade-offs and constraints
5. **Learning**: See how architecture evolved over time

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Project development guidelines
- [Component Style Guide](../component-style-guide.md) - Component usage patterns
- [Component Quick Reference](../component-quick-reference.md) - Quick component reference

## Resources

- [ADR GitHub Organization](https://adr.github.io/)
- [ADR Tools](https://github.com/npryce/adr-tools)
- [When to Write an ADR](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
