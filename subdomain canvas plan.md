# Roadmap Layout Refactor Plan: Subdomain Canvas Implementation

## Purpose

This plan defines the step-by-step actions required to replace the use of CSS `background-color` in subdomain containers with a separate visual layer called `.subdomain-canvas`. This visual substrate will be drawn beneath the certification tiles and aligned precisely with subdomain boundaries.

---

## Context

* The term **"subdomain background"** has been deprecated due to confusion with CSS `background-*` properties.
* We now refer to the visual layer behind subdomains as `.subdomain-canvas` to improve semantic clarity.
* Certification tiles will remain children of their `.subdomain-container` to preserve structural hierarchy, styling inheritance, and compatibility with future filtering logic.

---

## ✅ Step-by-Step Plan

### 1. Terminology Standardization

* Replace all uses of the term "background" (referring to layout layers) with `subdomain-canvas`.
* Update all related class names, comments, and logic to reflect this terminology change.

### 2. Undo CSS Background Assignment on Subdomain Containers

In `drawRoadmap()` or wherever subdomain containers are created, remove any background-color styling applied directly to `.subdomain-container`:

```js
// REMOVE this line:
subDiv.style.backgroundColor = `var(${sub.subdomainColor})`;
```

### 3. Draw Subdomain Canvas Layer in JavaScript

Before appending each subdomain container (`subDiv`), insert this logic:

```js
const canvas = document.createElement('div');
canvas.classList.add('subdomain-canvas');
canvas.style.gridRowStart = sub.gridRowStart;
canvas.style.gridRowEnd = `span ${sub.gridRowSpan}`;
canvas.style.gridColumnStart = sub.gridColumnStart;
canvas.style.gridColumnEnd = `span ${sub.gridColumnSpan}`;
canvas.style.backgroundColor = `var(${sub.subdomainColor})`;

domainDiv.appendChild(canvas); // Must be added BEFORE subdomain container
```

### 4. Add `.subdomain-canvas` CSS

```css
.subdomain-canvas {
  position: absolute;
  z-index: 1;
  border-radius: 0.25vmax;
}
```

### 5. Ensure `.domain-container` Has Relative Positioning

This ensures that absolutely positioned `.subdomain-canvas` children are placed correctly inside the domain grid:

```css
.domain-container {
  position: relative;
}
```

### 6. Maintain Correct Z-Index for Tiles and Containers

Ensure that `.subdomain-container` and `.cert-tile` have higher `z-index` values (or default stacking order) than `.subdomain-canvas`:

```css
.subdomain-container {
  position: relative;
  z-index: 2;
}

.cert-tile {
  position: relative;
  z-index: 3;
}
```

---

## Benefits

* Preserves semantic structure and parent-child relationships for interactivity and filtering
* Prevents layout breakage caused by padding, margin, or container overflow
* Cleanly separates visual highlighting from grid and tile logic

---

## Future Considerations

* Canvas layers may support future interactivity: hover states, focus outlines, contextual coloring
* Skill strata markers may be added using similar layering logic
* Z-index levels can be adapted for more advanced overlay or highlight behavior

---

**Status:** Ready for implementation
**Author/Developer:** ChatGPT
**Context Maintainer:** User
