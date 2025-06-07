# 📘 RoadmapReDo Documentation Process Guide

## 🎯 Purpose

Establish a scalable, low-cognitive-load workflow for creating, maintaining, and indexing all planning and architectural documents for the RoadmapReDo project. This process minimizes manual overhead and ensures continuity across ChatGPT sessions, GitHub commits, and project evolution.

---

## 🧠 Guiding Principle

> **“Capture once, reuse forever — without relying on human memory.”**

James has a traumatic brain injury, so all planning, system design, and decision records must be documented in persistent, accessible formats with minimal reliance on manual memory or re-orientation.

---

## 📁 File Location

All documents will reside in the GitHub repo:

```
/docs/
```

---

## 📑 Document Types

| Type        | Format            | Description                                  |
| ----------- | ----------------- | -------------------------------------------- |
| Canvas Docs | `.md`             | Architected outlines, logic plans, reference |
| Specs       | `.md`             | Contracts, schema rules, system design       |
| Logs        | `.md`             | Decision logs, milestones                    |
| Index       | `canvas-index.md` | Canonical list of all MD files               |

---

## 🔁 Workflow Overview

### 1. When a New Canvas or Plan is Created in ChatGPT:

* ChatGPT will generate a Markdown file (`.md`) content.
* ChatGPT will suggest an entry for `canvas-index.md`.
* User will:

  * Paste the `.md` file into `/docs/`
  * Append the index line to `canvas-index.md`

### 2. After GitHub Sync

* ChatGPT will verify the file was added correctly in a follow-up session.
* ChatGPT will resume using the document by name (e.g. *“refer to layout-contract”*).

---

## 📌 `canvas-index.md` Format

```
| Date       | Title                          | Description                                 |
|------------|--------------------------------|---------------------------------------------|
| 2025-06-05 | Roadmap Layout Contract        | Defines layout rules and visual grid logic  |
```

ChatGPT will maintain index entries in this format and prompt James to paste them after each new doc.

---

## ⚙️ Future Automation Plan

To reduce manual steps even further:

### ✅ Step 1 (Now): Manual index update via ChatGPT reminders

* ChatGPT provides full `.md` content + index line
* James pastes both into GitHub

### ⏳ Step 2 (Optional): Add YAML frontmatter to docs

```yaml
---
title: Roadmap Layout Contract
date: 2025-06-05
summary: Defines layout rules, visual grid logic
---
```

### ⏳ Step 3 (Optional): Script to auto-generate `canvas-index.md`

Script scans `/docs/*.md` and extracts:

* `title`
* `date`
* `summary`
  Then regenerates the table in `canvas-index.md`

Can be run manually or via GitHub Action on push.

---

## 🔔 Reminders for ChatGPT

When a planning document is created:

* ✅ Ask: *“Would you like to store this as a Markdown doc in GitHub?”*
* ✅ Generate: `.md` file
* ✅ Generate: index line for `canvas-index.md`
* ✅ Remind user to paste both into GitHub repo
* ✅ Resume session using document name (e.g. "refer to layout-contract")

---

## 🧷 Document Naming Conventions

| Type     | Pattern                      |
| -------- | ---------------------------- |
| Canvas   | `topic-name.md`              |
| Contract | `roadmap-layout-contract.md` |
| Log      | `2025-06-05-session-log.md`  |
| Index    | `canvas-index.md`            |

---

## 🔚 Summary

This documentation pipeline creates an **end-to-end knowledge architecture** for the RoadmapReDo project, ensuring that no session knowledge, layout rule, or design decision is ever lost.

If GitHub ever becomes your team’s primary collaboration space, this system can scale and automate to support real contributors.

ChatGPT will take full responsibility for tracking document prompts and maintaining your memory continuity.

---

## ✅ Next Steps

* [ ] Create `docs/` folder in GitHub (if not present)
* [ ] Add this file as `docs/documentation-process-guide.md`
* [ ] Create `docs/canvas-index.md` with initial header row
* [ ] Begin recording future docs using this process
