---
name: sdlc-developer
description: Implement one approved feature spec as code plus verification in this repository. Use when the SDLC pipeline stage "develop" starts, or the human asks to implement a feature from an approved spec.
---

# SDLC Developer

Mission: implement exactly what `specs/<feature-id>/spec.md` promises - every acceptance criterion,
nothing beyond scope - following the conventions in `GEMINI.md`.

## Steps

1. Read `GEMINI.md`, the spec, and the review findings you were handed (if any).
2. Explore the existing code the spec tells you to reuse. Read it before writing anything that
   could duplicate it.
3. Plan the change file by file. Keep the plan in your notes; do not create planning files.
4. Implement - the smallest change that satisfies every AC.
5. Add or update tests and verification exactly as the spec's test plan requires.
6. Run the project gates and fix failures before reporting.
7. Self-review your own diff with the checklist below.
8. Report with `changed_files` and `ac_coverage`.

## Rules

- Scope: only the files this feature needs. Unrelated refactors, formatting churn and
  "while we are here" changes are review findings, not goodwill.
- Reuse before create. A new helper next to an existing one that does the same job is a DRY
  violation the reviewer will find and reject.
- Follow the project's layout and naming exactly (see GEMINI.md).
- Keep the code simple: small functions, honest names, no dead code, no commented-out code, no
  speculative abstraction, no framework or dependency the spec did not allow.
- Comments only where the "why" is non-obvious. Never narrate what the code already says.
- Never touch `specs/`, `docs/`, review reports or `.env` files.
- Never commit; committing is a separate stage with its own skill.

## Self-review checklist before reporting

- Every AC implemented and covered by the spec's verification plan.
- Error, loading, empty and permission states handled wherever the UI or API needs them.
- No new duplication of existing logic (search before you claim this).
- No new dependency unless the spec allows it; if unavoidable, say so in the REPORT.
- Gates pass, with the output kept short and factual.
- Diff contains nothing unrelated.


## Java / Spring specifics (this project)

- Layering is strict: controller -> service interface -> service impl -> repository -> entity.
- Request/response objects are DTOs under `dto/<domain>/`; entity <-> DTO conversion goes through
  `mapper/<Domain>Mapper`. Never return an entity from a controller.
- Errors: throw `AppException` with an `ErrorCode`; `GlobalExceptionHandler` shapes the response;
  envelopes are `SuccessResponse` / `ErrorResponse` / `ValidationErrorResponse`.
- Write paths are `@Transactional` at the service layer; validation uses jakarta annotations with
  `@Valid` at the controller boundary.
- Filtering and sorting reuse `common/specification/*` (`SearchRequest`, `GenericSpecification`,
  `GenericSortBuilder`) instead of hand-written query logic.
- New behaviour needs at least a service-level test; `mvn verify` must stay green.

## REPORT

End your reply with exactly one REPORT block (see GEMINI.md): stage `developer`, verdict `DONE` or
`BLOCKED`, `changed_files` listing every touched path, `ac_coverage` mapping each AC to the code
and verification that satisfies it, `evidence` with the gate commands and their results.
