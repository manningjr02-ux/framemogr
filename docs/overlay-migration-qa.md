# Overlay migration QA checklist

Use this checklist to verify the select-page overlay flow after the thumbnail-to-overlay migration.

---

## Upload new image

- [ ] **Letters appear** — After upload → select, letter markers (A, B, C…) show on the image overlay.
- [ ] **Selection works** — Clicking a letter or an “I’m A” / “I’m B” button selects that person and highlights it.
- [ ] **Continue enabled only after select** — “Analyze My Frame” is disabled until a person is selected; it enables only after a valid selection.

---

## Refresh page

- [ ] **Letters stable** — Refreshing the select page (same `analysisId`) shows the same letter assignments.
- [ ] **No reshuffle** — Labels (A, B, C…) do not change order or identity after refresh; `detected_people` is stable.

---

## Open old analysis

- [ ] **No crash** — Opening a result or flow for an analysis created before `detected_people` exists does not crash.
- [ ] **Handles missing detected_people safely** — When `detected_people` is null/undefined (legacy row), the app degrades gracefully (e.g. empty list, retry, or clear message) without throwing.

---

## Mobile

- [ ] **Tap works** — Tapping a letter marker on the overlay selects that person.
- [ ] **Fallback buttons work** — “I’m A”, “I’m B”, etc. work on touch devices and correctly enable Continue when tapped.

---

## Edge cases

- [ ] **1 person** — Single detected face: one letter, one fallback button; selection and Continue work.
- [ ] **10 people** — Many faces: letters and fallback buttons scale; no layout break or overflow; selection still works.
- [ ] **Faces near edges** — People at image edges: markers are clamped and visible; no overflow or mis-hit.
- [ ] **Very small faces** — Small detected faces: markers and boxes still usable; no crash.
- [ ] **No faces detected** — Zero faces: appropriate message (e.g. “We couldn’t detect faces…”); retry or back to upload; no crash.

---

## Build and runtime

- [ ] **Production build** — `npm run build` completes successfully.
- [ ] **No runtime console errors** — In production (or production-like) run, open select/overlay flow and confirm the browser console has no errors during upload → select → continue.

---

*Last updated: overlay migration (PersonOverlaySelector as default; thumbnail grid removed).*
