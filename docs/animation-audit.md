# Quiz Lab animation audit

Deliverable for **idea #5 / task #34**: audit the current UI for transition and
animation opportunities before the implementation tasks add new motion behavior.

This audit is based on the current Svelte source. It is intentionally
descriptive: it records existing motion, identifies gaps, and prioritizes
follow-up work without changing runtime behavior.

## Scope

| Source | Surface | Motion relevance |
| --- | --- | --- |
| `app/src/routes/+layout.svelte` | App shell, primary nav, appearance picker popover | Global motion tokens, focus ring, nav hover, native `details` popover. |
| `app/src/routes/+page.svelte` | Pack picker | Pack card hover lift and shadow. |
| `app/src/lib/QuizPlayer.svelte` | Runtime quiz player | Progress width transition, question entry animation, answer choice states, CTA hover. |
| `app/src/routes/create/+page.svelte` | Quiz creator | Dense form, segmented controls, rich editor, preview player, drag reorder list. |
| `app/src/lib/components/ThemePicker.svelte` | Theme picker | Theme option selected state and compact popover content. |
| `app/src/lib/components/ThemeRating.svelte` | Theme rating | Star hover, focus, and filled state. |
| `app/src/routes/play/shared/+page.svelte` | Shared quiz fallback | Static fallback card and back link. |

## Current Motion Foundation

| Area | Current state | Gap |
| --- | --- | --- |
| Global tokens | `--motion-fast: 120ms`, `--motion-medium: 180ms`, `--motion-ease: ease` exist in `:root` and every theme token map. | No slow duration, no semantic aliases for hover, entry, exit, progress, or feedback. Current durations do not yet match the requested 150ms, 250ms, and 400ms scale. |
| Focus | A global `:focus-visible` selector applies `--shadow-focus` to anchors, buttons, summary, form controls, and textbox roles. | Focus ring appearance is centralized, but focus transitions are not. Some local controls transition border and color; others snap directly. |
| Reduced motion | No runtime `prefers-reduced-motion` rule is present in current app CSS. | Existing transform and keyframe motion is not reduced for users who request reduced motion. |
| State animation policy | Transitions are local and mostly use the global tokens. | The app has no written rule for which properties may animate, which states should snap, and which states require motion opt-outs. |

## Existing Motion Inventory

| Component family | Existing motion | Opportunity |
| --- | --- | --- |
| Primary navigation | Nav and appearance summary hover states change background and text color instantly. Appearance popover appears through native `details` with no entry or exit treatment. | Add tokenized color transitions to nav and summary. Consider a small opacity or translate entry for the popover only after reduced-motion support exists. |
| Pack cards | Pack card hover transitions border, shadow, and `translateY(-2px)`. | Keep the lift subtle, but gate transform with reduced-motion. Use the same hover duration/easing as other interactive surfaces. |
| Primary and secondary actions | Player and creator buttons transition background, border, color, and sometimes `translateY(-1px)`. Disabled states mostly snap. | Standardize button transitions across player and creator. Gate hover transforms. Add disabled-state opacity/color transition only if it remains clear and non-distracting. |
| Text, remove, danger, toolbar, and segmented buttons | Creator control classes share a broad transition block. Rich-toolbar and segmented buttons rely on the same timing. | Split semantic motion by role: hover/focus for small controls, selected state for segmented buttons, destructive hover with no extra movement. |
| Quiz answer choices | Player choices and booleans transition color, border, background, and transform. Creator preview choices transition color, border, and background. Correct and wrong states snap after submission. | Use a shared answer-control motion policy across runtime and preview. Prioritize selected/correct/wrong changes because they are core quiz feedback. Avoid animating anything that delays correctness comprehension. |
| Progress indicators | Runtime and preview progress bars transition width with `--motion-medium`. | Keep this as a useful low-motion affordance, but define a semantic progress duration and reduce it to instant width changes for reduced-motion users. |
| Question entry | Runtime `question-card` uses `enter-question` keyframes with opacity and translate. Creator preview has no matching question entry. | Decide whether question entry belongs in both runtime and preview. If kept, gate translate and offer opacity-only or instant fallback. |
| Forms and validation | Creator inputs, textareas, selects, and editor surface transition border and focus shadow. Player blank-answer input focus snaps. Validation messages and invalid borders snap. | Standardize form focus transitions between creator and player. Animate validation feedback carefully, favoring border/shadow/color changes over movement. |
| Theme picker and rating | Theme options transition background, border, and shadow. Star buttons transition background, border, and color. | Good low-risk pattern. Add focus/selected consistency and reduced-motion coverage rather than more visual flourish. |
| Drag reorder list | Managed question rows transition border, shadow, and opacity for dragging/drag-over. | Keep opacity and border feedback; consider a short background transition for drop target clarity. Avoid animating list reflow unless a proven library is added. |
| Feedback panels and review rows | Feedback and review states change border/background/color instantly. | Animate only color/border transitions if this improves clarity. Do not delay answer feedback or screen-reader announcements. |
| Shared fallback and empty states | Static cards with no entry or hover motion except the global focus ring on links. | Low priority. These states should stay quiet unless a shared card entry pattern is introduced. |

## Component Priority

| Priority | Components | Why |
| --- | --- | --- |
| P0 | Reduced-motion policy, motion tokens, global focus/hover policy | These are prerequisites for adding more motion without accessibility regressions or duplicated timing values. |
| P1 | Buttons, links, segmented controls, quiz answer controls, progress bars | These are the highest-frequency interactions and define the feel of the quiz workflow. |
| P1 | Creator form controls and validation feedback | The creator is form-heavy; smoother state changes can reduce jarring error and focus changes. |
| P2 | Appearance popover, theme picker, theme rating | The popover is the only overlay-like surface today, and theme controls already have a small motion language to standardize. |
| P2 | Managed question drag states | Drag feedback directly affects confidence while reordering, but should remain practical and restrained. |
| P3 | Cards, empty states, result/review panels | These are mostly static reading surfaces. Motion should be reused from shared primitives rather than added locally. |

## Missing Families

- No modal or dialog component exists in the current UI.
- No toast system exists; feedback is inline.
- No custom dropdown system exists besides the appearance `details` popover and native `<select>`.
- No tooltip system exists; rich-toolbar buttons use native `title` attributes.
- No skeleton or async loading component exists. The shared route has a text loading state before hash data is decoded.
- No page transition system exists in Svelte route changes.

## Follow-up Handoff

1. **Task #35 - tokens:** expand the current token set to include the requested
   150ms, 250ms, and 400ms timing scale plus semantic aliases for hover, focus,
   progress, entry, exit, and feedback. Keep the source of truth synchronized
   between `+layout.svelte` and theme token maps.
2. **Task #36 - hover and focus:** apply the semantic hover/focus tokens to nav,
   links, buttons, segmented controls, theme controls, and answer controls.
3. **Task #37 - overlays:** start with the appearance `details` popover. There is
   no modal/dialog system to animate yet, so document that gap before inventing a
   modal API.
4. **Task #38 - forms:** align creator and player field focus styles, then add
   validation transitions for border, shadow, and message appearance.
5. **Task #39 - page/loading states:** avoid route-wide animation until reduced
   motion exists. Begin with shared progress/loading primitives if needed.
6. **Task #40 - documentation:** add examples for tokens, answer controls,
   buttons, forms, progress, and reduced-motion behavior. This repo does not
   currently include Storybook, so documentation may need to live in project docs
   unless Storybook is introduced separately.
7. **Task #41 - reduced motion:** add a global `@media (prefers-reduced-motion:
   reduce)` policy that removes transforms/keyframes and shortens width/color
   transitions where appropriate.

## Implementation Guardrails

- Prefer CSS transitions and keyframes over a new animation library until the app
  needs coordinated route or list choreography.
- Animate opacity, color, border, box-shadow, and transforms only. Avoid layout
  properties except progress bar width, which already represents state directly.
- Do not animate correctness in a way that delays feedback. State should remain
  immediately understandable through text, border, and background.
- Keep the app palette within the documented black, green, and white system for
  any new animated states.
- Every new transform or keyframe must have a reduced-motion fallback.
