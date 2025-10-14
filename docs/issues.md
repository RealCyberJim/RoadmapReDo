# Roadmap Project - Known Issues Log

This document tracks known issues, investigations, and remediation progress for the Security Certification Roadmap. Treat it as a living punch list. Add new issues at the top (reverse chronological) and update status fields as work proceeds.

---
## Format Guidance
Each issue should follow this structure:

```
### [ISSUE-ID] Short Title
Status: Open | In Progress | Blocked | Resolved | Deferred
Severity: Informational | Low | Medium | High | Critical
First Observed: YYYY-MM-DD
Owner: (who is driving resolution)
Related Files: (paths or data files)

Summary:
  One-paragraph plain-language description.

Reproduction Steps:
  1. ...
  2. ...
  Expected:
  Actual:

Impact:
  (User-facing effect, scope, visibility, data loss risk, etc.)

Technical Analysis / Findings:
  - Bullet points of what we've learned.

Working Hypotheses:
  - Hypothesis 1: ...
  - (Mark ✅ / ❌ as validated or disproven.)

Proposed Fix Options:
  Option A: ... (pros/cons)
  Option B: ...
  Chosen Approach: (once selected)

Action Checklist:
  - [ ] Task 1
  - [ ] Task 2

Instrumentation / Debug Aids:
  (Temporary logging, visual overlays, assertions.)

Notes / References:
  (Links, commits, related issues.)
```

---
## Active Issues

### ISSUE-001 Overlapping / Hidden Certification Tiles
Status: Open  
Severity: Medium (content visibility impaired but data intact)  
First Observed: 2025-10-13  
Owner: (unassigned)  
Related Files: `index.html`, `data/certs.json`, `data/subdomains.json`

Summary:
Certain certification tiles (example: "ITIL MP", "ITIL Fdn") are not visibly rendered in the default view even though text search (Ctrl+F) finds four occurrences of "ITIL". Two tiles are effectively hidden because they occupy the exact same CSS Grid cell as other tiles and are fully overlapped.

Reproduction Steps:
1. Load `index.html` in a browser (default state, all vendors enabled).
2. Press Ctrl+F and search for `ITIL`.
3. Four matches are reported; only two are visible.
4. Use Vendor filter → select vendor `ITIL`.
5. All four ITIL-related tiles become visible (competitor tiles filtered out, so no overlap).

Expected:
All distinct cert tiles should appear in unique, non-overlapping grid cells when space exists in the subdomain and skill row.

Actual:
Multiple cert tiles are assigned identical (row, column) coordinates within a subdomain grid (notably `RSK_left_unspec` rows 12 and 25 which have only a 2-column span), causing later DOM nodes to visually obscure earlier ones.

Impact:
- Users may miss available certifications.
- Filtering by vendor masks the root issue (false sense of completeness only under filtered views).
- Reduces trust in roadmap completeness.

Technical Analysis / Findings:
- Subdomain `RSK_left_unspec` has `gridColumnSpan: 2` → only two horizontal slots per skill row.
- Multiple certs share `certSkillStrata` 12 (e.g., `RSK_itilmp`, plus other RSK or cross-related entries) and 25 (`RSK_itilfdn`, etc.).
- Placement logic attempts heuristic ordering but lacks a robust occupancy check.
- Data structure `tileRowMap` mixes two concepts: a per-row column index counter and explicit occupancy markers (`"row-col"` keys), increasing risk of logic gaps.
- Home/guest terminology exists in code, but the feature allowing multi-domain rendering is deprecated; terminology now obscures intent.
- Guest placement vertical offset search only tests a single preferred column when scanning alternate rows; home placement never searches alternates at all.
- No collision detection or warning emitted to console.

Working Hypotheses:
- ✅ H1: Overlap stems from more tiles than available columns for a given row in a subdomain (confirmed in RSK_left_unspec).
- ✅ H2: Algorithm does not guarantee first-free placement; it may choose an occupied cell without fallback.
- ❌ H3: Z-index or opacity styling hides tiles independently (not observed; stacking only).
- ✅ H4: Vendor filter visibility changes eliminate competing tiles, revealing overlapped ones.

Proposed Fix Options:
Option A (Recommended): Implement explicit occupancy-driven placement.
  - Maintain per-subdomain occupancy map keyed by (row, col).
  - For each cert: generate ordered candidate cells (row, col). Search same row, all columns; if full, expand to ±row offsets (bounded) reusing column order.
  - Guarantees no two tiles share a cell (unless grid truly out of capacity).
  Pros: Deterministic, minimal UI change.  
  Cons: Slightly more JS, need to reconcile with existing heuristic bias code.

Option B: Expand column span for crowded unspecialized subdomains (e.g., from 2 to 3 or 4).
  Pros: Simple data change.  
  Cons: Arbitrary widening, shifts layout, does not solve underlying placement logic.

Option C: Layered visual fan-out for collisions (translate overlapped tiles diagonally).
  Pros: Quick visual mitigation.  
  Cons: Still a collision; reduced readability.

Chosen Approach: (TBD — suggest Option A first, optionally combine with selective widening if chronic congestion remains.)

Action Checklist:
- [ ] Add collision instrumentation (log all (row,col) with >1 cert).
- [ ] Refactor placement to use explicit occupancy search function.
- [ ] Remove deprecated terminology ("home" / "guest") from code comments.
- [ ] Add developer comment explaining new placement strategy.
- [ ] (Optional) Add DEV_MODE flag to visually outline collision attempts.
- [ ] Validate no collisions remain across all vendors.
- [ ] Update this issue with results and close when verified.

Instrumentation / Debug Aids (Planned):
- Temporary `occupancy` Map plus collision reporting after each subdomain.
- Console timing to measure placement performance (expected negligible).
- Optional visual jitter for collided cells (should not appear post-fix).

Notes / References:
- Original investigation date: 2025-10-13
- Related JSON objects: `RSK_itilmp` (row 12), `RSK_itilfdn` (row 25)
- Future improvement: dynamic per-subdomain density analysis to auto-adjust grid spans.

#### Addendum 2025-10-13: Deprecated Multi-Domain ("home/guest") Feature Clarification
The prior feature that rendered a certification tile in multiple domains simultaneously (designating one as "home" and others as "guest") has been fully deprecated. Current requirement: exactly one rendered instance per certification in its canonical domain/subdomain. Remaining references to "home" or "guest" in code are legacy artifacts and must be audited to ensure they do not still influence layout or filtering.

Audit Goals:
1. Enumerate every occurrence of the tokens `home` and `guest` in the runtime JS (within `index.html`).
2. Classify each occurrence:
  - CosmeticOnly: name/comment only; no behavioral impact.
  - FunctionalLegacy: logic branch or placement bias tied to previously multi-domain intent.
3. Verify that no placement decisions (row/column selection) depend on legacy multi-domain arrays (`crossDomains`, `crossSubdomains`) except where still explicitly required by current single-instance model (should be none if truly deprecated).

Planned Steps:
1. Introduce a diagnostic helper `window.auditDeprecatedTerminology()` printing a structured report (location, line snippet, classification suggestion).
2. Add collision instrumentation first (to have baseline), then run audit to avoid conflating new logic with legacy effects.
3. If bias helpers (`getBiasDirection`, `getColumnOrderWithProximityBias`, `getColumnOrderWithBias`) are only serving deprecated logic, mark them for removal after occupancy placement algorithm passes parity checks.
4. Perform neutral renames (e.g., `sourceDomainId`, `renderContextDomainId`) only after confirming zero functional coupling.
5. Remove or stub unused parameters/branches; document each removal with commit references appended here.

Success Criteria:
- Zero functional legacy branches remaining (audit reports none classified as FunctionalLegacy).
- Occupancy placement (feature-flagged) yields deterministic, collision-free layout independent of legacy bias code.
- All deprecated terminology excised or replaced; docstrings updated.

Risk Mitigation:
- Feature flag for new placement prevents coupling: `USE_OCCUPANCY_PLACEMENT` remains false until audit complete.
- One commit per stage (instrument → audit → rename → enable → remove legacy) with regression diagnostics executed between each.

Documentation Updates:
- This addendum will be updated with: (a) audit results summary, (b) commit SHAs for removals, (c) confirmation of success criteria.

Open Questions (to record if arise):
- Are `crossDomains` / `crossSubdomains` data fields still populated in JSON? If so, decide whether to prune from dataset or retain for future analytics (not layout).
- Should we retain a minimal bias mechanism for future multi-domain reintroduction? (Current stance: defer until a concrete requirement returns.)

Next Actions (mapped to todo list):
- Add instrumentation & audit (ISSUE-001 action checklist alignment).
- Implement occupancy algorithm behind flag.
- Validate parity, then remove deprecated logic.

Status: Pending audit implementation.

---
## Backlog / Future Candidates (Placeholders)
- ISSUE-002: (Add next issue here)
- ISSUE-003: ...

---
## Changelog
- 2025-10-13: Created initial issues log and documented ISSUE-001.
