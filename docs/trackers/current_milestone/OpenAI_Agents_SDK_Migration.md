<!-- SECTION: Metadata -->
# Milestone: OpenAI Agents SDK Migration

_Last updated: 2025-12-08_  
**Status:** Planned  
**Owner:** @tan (or delegate)  
**Domain:** Frontend | Cross-cutting  
**ID / Links:** [Repo](../..), [SDK Docs](https://openai.github.io/openai-agents-js/), [Raw API Ref](../integrations/openai-agents-sdk/openai_raw_api_reference.md)

---

<!-- SECTION: Objective -->
## Objective

Adopt the OpenAI Agents SDK (v0.3.4) with the Responses API to replace the bespoke chat/tool loop, delivering a secure, observable, and extensible agent architecture for Excel automation and future multi-agent workflows.

---

<!-- SECTION: Definition of Done -->
## Definition of Done

- Agents SDK installed, configured, and wired into the taskpane with gpt-5.1 defaults.  
- Excel tools exposed via SDK `tool` wrappers with strict schemas; pivot naming aligned; parallel tool-calls supported.  
- Session/state management defined (transient runs + optional persisted session for chat).  
- Guardrails (input/output validation) and tracing enabled; HITL entry points documented.  
- Secrets pulled from env (no hardcoded keys); browser-safe key handling documented.  
- Streaming and error handling surfaced in UI; fallback behaviors defined.  
- `pnpm lint` / `pnpm type-check` / relevant tests pass.  
- Docs updated (tracking, runbook, and quickstart for agents).

---

<!-- SECTION: Scope -->
## Scope

### In Scope
- Replace manual Responses loop with Agents SDK `Agent` + `run` (and `RealtimeAgent` optional later).  
- Wrap existing Excel operations as SDK tools with Zod schemas.  
- Configure models, guardrails, tracing, streaming, and session handling.  
- Update UI integration to consume streamed events and tool outputs.  
- Security: env-driven API key flow; no secrets in bundles.  
- Documentation and operational runbooks.

### Out of Scope
- Major UI redesign beyond streaming/error surfacing.  
- Replacing Excel operation implementations themselves.  
- Voice/WebRTC real-time agents (can be follow-up).  
- Backend persistence/store for chat history (stub allowed if needed).

---

<!-- SECTION: Current Health Snapshot -->
## Current Health Snapshot

| Area | Status | Notes |
| --- | --- | --- |
| Architecture/design | ⚠️ | Custom loop; no SDK; lacks guardrails/tracing |
| Implementation | ⚠️ | Hardcoded key removed but no SDK integration yet |
| Tests & QA | ⏳ | Needs plan once agents wiring is in place |
| Docs & runbooks | ⏳ | Migration doc to be authored |

---

<!-- SECTION: Architecture / Design Snapshot -->
## Architecture / Design Snapshot

- Core agent: single primary Agent using gpt-5.1, Instructions tuned for Excel assistant.  
- Tools: thin wrappers over existing Excel operations (`api/excel/*`), registered via SDK `tool(...)` with Zod schemas; pivot naming unified to `add_pivot_table`.  
- Runner: `run(agent, input, { stream: true, parallelToolCalls: true/false per need })`; session wrapper optional for chat continuity.  
- Guardrails: Zod validation for inputs/outputs; policy to abort or request clarification.  
- Tracing: enable SDK tracing hooks; emit spans for LLM/tool/handoffs.  
- HITL: optional approval checkpoint before committing write operations.  
- Config: env-driven API key; model selection and limits centralized.  
- UI: consume streaming events (messages, function_call args, tool outputs) to show live progress and errors.

---

<!-- SECTION: Workstreams & Tasks -->
## Workstreams & Tasks

### Workstream A – Foundation & Dependencies
| ID | Area | Description | Owner | Status |
|----|------|-------------|-------|--------|
| A1 | Infra | Add @openai/agents v0.3.4 + zod; pin versions | @tan | ⏳ |
| A2 | Config | Centralize model/key config; env loading with browser safety notes | @tan | ⏳ |
| A3 | Docs | Add quickstart section referencing SDK docs/raw API ref | @tan | ⏳ |

### Workstream B – Agent & Runner
| ID | Area | Description | Owner | Status |
|----|------|-------------|-------|--------|
| B1 | Agent | Define primary Agent (instructions, model, outputType optional) | @tan | ⏳ |
| B2 | Runner | Replace custom loop with `run` + streaming handling | @tan | ⏳ |
| B3 | Sessions | Optional session wrapper for chat continuity | @tan | ⏳ |

### Workstream C – Tools & Excel Adapters
| ID | Area | Description | Owner | Status |
|----|------|-------------|-------|--------|
| C1 | Schemas | Wrap Excel ops as SDK tools with Zod, strict params | @tan | ⏳ |
| C2 | Naming | Align pivot naming to `add_pivot_table`; audit all tool names | @tan | ⏳ |
| C3 | Parallel | Verify parallel tool-call support; disable where sequencing needed | @tan | ⏳ |

### Workstream D – Guardrails, Tracing, HITL
| ID | Area | Description | Owner | Status |
|----|------|-------------|-------|--------|
| D1 | Guardrails | Input/output validation and safe failure messaging | @tan | ⏳ |
| D2 | Tracing | Enable tracing hooks; document export path | @tan | ⏳ |
| D3 | HITL | Optional approval hook before mutating operations | @tan | ⏳ |

### Workstream E – UI Integration & Streaming
| ID | Area | Description | Owner | Status |
|----|------|-------------|-------|--------|
| E1 | Stream UI | Render streamed deltas, tool-call arguments, tool results | @tan | ⏳ |
| E2 | Errors | Surface tool/LLM errors gracefully with retry guidance | @tan | ⏳ |
| E3 | Telemetry | Minimal client metrics for latency/tool-call counts | @tan | ⏳ |

### Workstream F – Validation & Rollout
| ID | Area | Description | Owner | Status |
|----|------|-------------|-------|--------|
| F1 | Tests | Add unit/contract tests for tool schemas + runner | @tan | ⏳ |
| F2 | QA | Manual smoke: read/write, chart/pivot, guardrail blocks | @tan | ⏳ |
| F3 | Docs | Update trackers/runbooks; add migration notes | @tan | ⏳ |

---

<!-- SECTION: Phases (optional if simple) -->
## Phases

| Phase | Scope | Exit Criteria | Status | Target |
| ----- | ----- | ------------- | ------ | ------ |
| P0 – Alignment | Confirm scope, owners, env/secrets plan | Milestone accepted | Planned | 2025-12-09 |
| P1 – Scaffold | Install SDK, define Agent, stub tools | Agent runs “hello world” with stream | Planned | 2025-12-11 |
| P2 – Integrate | Wrap Excel tools, UI streaming, guardrails/tracing | All tools callable via SDK; errors handled | Planned | 2025-12-15 |
| P3 – Validate | Tests + manual QA; docs/runbooks | Lint/type/tests pass; docs updated | Planned | 2025-12-17 |

---

<!-- SECTION: Dependencies -->
## Dependencies

- OpenAI API availability and `OPENAI_API_KEY` provisioning (browser-safe).  
- Existing Excel operations stability.  
- Optional: observability backend for tracing export.

---

<!-- SECTION: Risks & Mitigations -->
## Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Streaming/UI drift | Medium | Build a thin adapter translating SDK events to existing UI state |
| Tool schema mismatch | High | Zod schemas + contract tests for each tool |
| Secret exposure in browser | High | Enforce env injection; document ephemeral key pattern |
| Parallel tool conflicts | Medium | Disable `parallelToolCalls` per agent where ordering matters |

---

<!-- SECTION: Validation / QA Plan -->
## Validation / QA Plan

- `pnpm lint` and `pnpm type-check`.  
- Unit/contract tests for tool schemas (arguments/required fields) and runner flow.  
- Manual smoke in Excel: read/write, chart, pivot, format, guardrail refusal, error surfaces, and streamed progress.  
- Optional tracing verification via local exporter.

---

<!-- SECTION: Rollout / Ops Notes -->
## Rollout / Ops Notes

- Feature flag or environment toggle for Agents SDK path; keep legacy path behind fallback during shakeout.  
- Document how to supply `OPENAI_API_KEY` (and ephemeral keys if front-end delivered).  
- Rollback: switch flag to legacy path if critical issues.  
- Trace sampling configurable to control cost/noise.

---

<!-- SECTION: Changelog -->
## Changelog

- 2025-12-08 — Initial milestone drafted for Agents SDK migration.

