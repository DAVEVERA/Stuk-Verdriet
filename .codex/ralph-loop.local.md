# Ralph Loop State

status: complete
iteration: 2
max_iterations: 10
started_at: 2026-06-18T00:00:00+02:00
task: Make butterflies roam calmly and realistically across the whole site, with wing motion, landings on cards/sections, and verified rendering.

## Completion Criteria

- [x] Butterfly canvas is mounted sitewide, not inside a single onepager section.
- [x] Butterflies render visibly in the browser.
- [x] Motion includes slow flight, approach, landed rest, and takeoff states.
- [x] Landing targets are tied to visible cards/sections.
- [x] Mobile density is reduced and `prefers-reduced-motion` is respected.
- [x] Tests/build/lint pass or known exceptions documented.
- [x] No unintended files changed.
- [x] Final summary prepared.

## Iteration Log

### Iteration 0

Initial repo inspection and prior implementation review.

### Iteration 1

Plan:
- Move the butterfly field to the root layout and fix the invisible Three.js render layer.
- Add realistic behavior states: roaming, approach, landing, resting, and takeoff.
- Verify with TypeScript, lint, and Playwright screenshots.

Changes:
- Updated `src/components/ButterflyField.tsx` with landing targets, slower autonomous movement, live element anchoring, wing pose states, and corrected camera/frustum setup.
- Mounted `ButterflyField` in `src/app/layout.tsx` and removed the onepager-only mount.
- Adjusted `.butterfly-field` CSS for sitewide overlay visibility while keeping pointer events disabled.

Verification:
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- Playwright delayed screenshots under `output/playwright/` confirmed visible butterflies on desktop and mobile.

Decision:
- continue

Next:
- Run production build and final diff review.

### Iteration 2

Plan:
- Run final production verification and review changed files.

Changes:
- Reduced butterfly density slightly after screenshot review so desktop/mobile stay calm.
- Kept the sitewide root layout mount and stateful landing behavior.

Verification:
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm run build` - passed.
- Playwright delayed screenshots confirmed visible butterflies after fixing camera/frustum.

Decision:
- stop

Next:
- Final summary.
