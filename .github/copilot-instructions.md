# AI Assistant Instructions for RoadmapReDo

Concise guidance for productive contributions. Focus on current architecture and data-driven UI patterns in this repo.

## Big Picture
A single-page, data-driven certification roadmap (`index.html`) renders a horizontally scrolling domain strip. Layout + styling are computed at runtime from JSON in `data/`. There is no build system: edit HTML/CSS/embedded JS directly and commit. Core concerns:
- Transform domain / subdomain / certification JSON into positioned tiles inside a flex + CSS grid hybrid.
- Support interactive filter modes (domains, strata levels, vendors, learner mode) with redraw cycles.
- Maintain persistent user view state (likely via localStorage) without leaking learner-mode visuals when OFF.

## Key Data Structures (from JSON)
Certification object (excerpt fields): `certId`, `domainId`, `subdomainId`, `certSkillStrata` (numeric row within skill strata rails), `vendorId`, optional `crossSubdomains`, display metadata (`certTileLabel`, `certUrl`, `certTooltip`).
Domain object: `domainId`, `gridColumnSpan`, `domainDisplayOrder`, description, `teamRoles` color tokens (maps team role -> CSS custom property names). Skill-level pseudo-domain `SKL` supplies vertical strata segments.
Subdomain object: `subdomainId`, `domainId`, grid coordinates (`gridRowStart`, `gridRowSpan`, `gridColumnStart`, `gridColumnSpan`), `subdomainColor`.

## Layout & Rendering Pattern
- Domains rendered left→right according to `domainDisplayOrder`; each domain allocates a horizontal grid span (`gridColumnSpan`).
- Subdomains define internal grid slices (absolute positioning via CSS Grid coordinates) spanning uniform vertical height (28 skill rows) and tuned horizontal widths.
- Skill strata rail (`#skill-strata-rail`) overlays beginner / intermediate / expert vertical bands using fixed row spans (1–8 expert, 9–20 intermediate, 21–28 beginner). Map numeric `certSkillStrata` onto these rows.
- Certifications placed into cells derived from `(subdomainId, certSkillStrata, columnIndexHeuristic)`; current logic risks collisions (ISSUE-001). Any new placement code MUST implement occupancy checks before assigning `(row,col)` within a subdomain.

## Styling Conventions
- Extensive CSS custom properties declared at `:root`; reuse tokens instead of hard-coded colors. Domain-specific classes: `.domain-<ID>` manage border & title palette; learner status classes (`cert-status-achieved|planned|reach`) override tile styling.
- Do not inline fixed colors; set `style.backgroundColor = var(--token)` or apply a class that inherits defined variables.
- Wireframe mode proposal (see `docs/features.md`) uses a body class (`wireframe-mode`) to neutralize backgrounds; follow the pattern of dark-mode (`body.dark-mode`).

## Interaction & Modes
- Filter pills use unified styling classes (`.domain-filter-tile`, `.strata-filter-tile`, `.mode-filter-tile`) with hidden checkbox/input elements driving state.
- Learner Mode ON: tiles gain status classes and possibly inline overrides; Learner Mode OFF must strip those without leaving residual styles (ensure redraw after stripping to prevent transient wireframe artifact unless intentionally implementing wireframe feature).
- Planned new mode: Wireframe View (body class + conditional skip of coloration). When adding, gate color application logic with `if (!filterState.wireframeMode)`.

## Persistence & State
- State object (`filterState` inferred) should contain booleans for dark mode, learner mode, domain toggles, strata selections, vendor filters, future `wireframeMode`. When adding properties: include in save / restore helpers (search for `saveState` / `applyPersistedState`).
- Ensure learner selections persist separately from visual activation flag (store chosen statuses even if `learnerMode` false).

## Placement Algorithm Improvement (ISSUE-001)
Implement explicit occupancy map per subdomain: `Map<row, Set<col>>` or flat key `"row-col"`. For each cert candidate row, iterate columns 1..gridColumnSpan; pick first free; if full, probe neighboring rows (±1..N) within subdomain vertical span. Log collisions during development; remove legacy "home/guest" bias code afterward.

## Adding Data
- New cert: append object to `data/certs.json` preserving field order; ensure `certSkillStrata` matches desired vertical strata band (1–8 expert, 9–20 intermediate, 21–28 beginner). Keep `crossDomains` empty (deprecated multi-domain rendering) unless analytics-only metadata is reintroduced.
- New domain/subdomain: adjust `gridColumnSpan` sizing carefully to avoid pushing existing content off-screen; verify horizontal ordering via `domainDisplayOrder`.

## Accessibility & UX
- When introducing new modes (wireframe), add ARIA labels or live region announcements. Maintain sufficient contrast for dark mode (test tile text against background tokens; prefer existing light/dark variable pairs).

## Performance Considerations
- Minimize full DOM rebuilds; prefer targeted updates unless layout fundamentals change. However, mode toggles currently rely on a full redraw (acceptable given scale). If optimizing, cache computed placement coordinates keyed by `certId` + active filter hash.

## Safe Change Pattern
1. Instrument (console logs) behind a dev flag (`DEV_MODE` variable) – never commit verbose logs enabled.
2. Implement feature flagged path (e.g., `USE_OCCUPANCY_PLACEMENT`) side-by-side; compare cell counts, overlap detection.
3. Remove legacy branches & terminology only after parity validation.

## Examples
- Color token usage: domain NET title uses `background-color: var(--domain-net-light); color: var(--domain-net-dark);` – follow analogous light/dark pairing for new domains.
- Learner status styling: `.cert-tile.cert-status-achieved` uses green palette tokens; replicate pattern if introducing additional statuses.

## Out of Scope / Avoid
- Do not introduce external JS frameworks (keep vanilla for portability).
- Avoid speculative data fields not consumed today.
- Do not reformat large JSON arrays (diff noise); append minimally.

Provide concise PR descriptions referencing issue IDs (e.g., ISSUE-001) and impacted files (`index.html`, data JSON). Ask if any section above lacks clarity before large refactors.
