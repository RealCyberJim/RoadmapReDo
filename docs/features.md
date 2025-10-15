# Feature Concepts & Backlog

## Wireframe (Bare) Certification View

Working title: "Wireframe Mode" / "Bare Tiles" / "Schematic View"

### 1. Origin Story (Accidental Discovery)
During a bug fix for Learner Mode deactivation, an intermediate UI state appeared where all certification tiles rendered as:
- Neutral/transparent (no domain fill color applied)
- Thin grey (default) borders
- White text on the dark background (due to inherited dark-mode tile text styling)
- Subdomain canvases still present but muted

This happened right after turning OFF Learner Mode, before a full roadmap redraw reapplied domain color backgrounds. The code path:
1. Learner Mode OFF handler stripped inline styles and learner status classes from each `.cert-tile`.
2. Domain background coloring logic (normally applied when building the roadmap or re-running `applyFiltersAndRedraw()`) had NOT yet re-run.
3. Result: Tiles fell back to baseline `.cert-tile` CSS: `background-color: inherit; border: 1px solid; color: white;` with no per-domain inherited background (because that is normally synthesized dynamically, not baked into static CSS for each tile itself).
4. After the subsequent manual interaction (filter toggle) forced `applyFiltersAndRedraw()`, domain coloration logic rebuilt the DOM and the effect disappeared.

### 2. Technical Cause (Root Mechanism)
The anomaly = a temporal gap between (A) removal of learner-specific inline overrides and (B) reapplication of domain/subdomain-derived coloration. In that gap, tiles are existing DOM nodes lacking any background-color/border-color overrides except the base `.cert-tile` rules. Because subdomain canvases sit underneath and tiles use `background-color: inherit`, but the parent containers themselves were not providing a colored background (their role is structural) the visible result was a lightweight, schematic tile grid.

Key ingredients:
- Inline style stripping (e.g., `tile.style.backgroundColor = ''` and `tile.style.color = ''`).
- No immediate rebuild of roadmap structure.
- Base CSS for `.cert-tile` defines white text and a 1px border but neutral background.

### 3. How to Reproduce Intentionally (Current Codebase)
(If current fix remains: learner toggle now triggers redraw, so to reproduce you would temporarily disable that.)

Option A (Temporary Dev Hack):
1. Comment out or early-return the `applyFiltersAndRedraw()` call inside the Learner Mode OFF branch in `renderLearnerModePills()` change handler.
2. Enable Learner Mode, assign a few statuses (to guarantee inline styles were set previously), then disable Learner Mode.
3. Observe wireframe state before any other interaction triggers a redraw.

Option B (Programmatic Trigger):
Add a one-off dev function in console:
```js
Array.from(document.querySelectorAll('.cert-tile')).forEach(t=>{
  t.removeAttribute('style');
  t.classList.remove('cert-status-achieved','cert-status-planned','cert-status-reach');
});
```
This simulates the stripped state without initiating a redraw.

### 4. Proposed Feature Definition
Introduce an explicit toggle: Wireframe View.
Purpose: Provide a low-noise schematic suitable for:
- Structural layout reviews (alignment, density, spacing)
- Presentations focusing on pathway shape rather than color semantics
- Accessibility/contrast testing baseline
- Printing / export as template

### 5. Visual Specification (Initial)
Tiles:
- Background: transparent (or `background-color: inherit`)
- Border: uniform medium-grey (light mode: `#666`; dark mode: `#555` or `#777` for contrast)
- Text Color: light mode `#222`, dark mode `#eee`
- Optional hover: subtle highlight (e.g., rgba accent) without color semantics
- Remove domain color fills, planned/reach/achieved badges, and cross-domain shading
Subdomain Canvases:
- Option 1: Hidden entirely for pure grid
- Option 2: 5–10% opacity tint (configurable)
Domain Titles:
- Retain for orientation (maybe dim to 60% opacity)
Skill Strata Rail:
- Keep or optionally outline-only variant
Learner Mode Interaction:
- Disabled (read-only schematic) OR optional enable but statuses hidden visually
ARIA / A11y:
- Add `aria-label="Wireframe mode active: colors suppressed"` to a container

### 6. State Model Extension
Add to `filterState`:
```js
wireframeMode: false
```
Persistence: Include in `saveState()` snapshot and `applyPersistedState()` merge.

### 7. Implementation Outline
1. Add a toggle pill to the Options stack (mutually independent of dark mode & learner mode).
2. When ON:
   - Add `body.classList.add('wireframe-mode')`.
   - During roadmap draw, skip applying background colors (gate the logic with `if(!filterState.wireframeMode)`).
   - Suppress learner status styling in `applyLearnerStatusToTile` if wireframe active.
3. CSS block for `.wireframe-mode`:
```css
body.wireframe-mode .cert-tile {
  background: transparent !important;
  border-color: #666 !important;
  color: #222 !important;
}
body.dark-mode.wireframe-mode .cert-tile {
  border-color: #777 !important;
  color: #eee !important;
}
body.wireframe-mode .subdomain-canvas { opacity: 0.05; }
body.wireframe-mode .domain-title { filter: grayscale(100%) brightness(.9); opacity:.7; }
body.wireframe-mode .cert-tile.cert-status-achieved,
body.wireframe-mode .cert-tile.cert-status-planned,
body.wireframe-mode .cert-tile.cert-status-reach { /* neutralize learner visuals */ }
```
4. Ensure `applyFiltersAndRedraw()` re-runs when toggling wireframe mode.
5. Add ARIA live announcement for mode change.

### 8. Edge Cases & Considerations
- Printable output: Confirm borders appear on white background; may need `@media print` overrides.
- Interaction layering: Learner popup still functions? Decide whether to hide or allow.
- Performance: Minor; just a conditional skip and extra class.
- Persistence: Safe; default false.
- Dark Mode + Wireframe: Ensure adequate contrast (test WCAG).

### 9. Future Enhancements
- Export PNG/SVG of wireframe layout.
- Animated transition (fade out domain colors).
- Density heatmap overlay (wireframe as base layer, toggle heat region shading).
- Keyboard shortcut (e.g., `W`).
- Partial wireframe (only dim non-filtered domains).

### 10. Reverting / Removing
Because feature is additive and gated by a class + state key, removal involves:
- Delete toggle pill + filterState key + CSS block.
- Remove conditional branches checking `wireframeMode`.

### 11. Quick Reproduction Script (Dev Note)
If regression appears again unintentionally, capture with:
```js
(() => {
  const snap = document.getElementById('roadmap').cloneNode(true);
  console.log('Wireframe snapshot captured', snap);
})();
```

---

(End of Wireframe View specification.)
