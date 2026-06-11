# Quiz Lab design system

Deliverable for **idea #2 / task #14**: a centralized guide for the UI decisions
made during the cleanup work. Use this document when changing Quiz Lab screens,
adding a new component, or reviewing a UI pull request.

Supporting documents:

- [`ui-audit.md`](./ui-audit.md): the original UI inconsistency and clutter audit.
- [`ui-component-inventory.md`](./ui-component-inventory.md): every component
  family currently in the app.
- [`ui-style-guide.md`](./ui-style-guide.md): the token definitions and migration
  standard that task #13 implemented in runtime CSS.
- [`animation-audit.md`](./animation-audit.md): current transition coverage and
  prioritized motion opportunities for idea #5.
- [`animation-examples.md`](./animation-examples.md): Storybook-ready animation
  examples, state matrices, snippets, and accessibility notes for idea #5.

## Design principles

1. **One palette, many meanings.** Quiz Lab uses black, green, white, and
   accessible neutral tints. Correct, selected, warning, invalid, and destructive
   states must be clear without red, pink, orange, or blue accents.
2. **Small tool, clear hierarchy.** This is an operational quiz builder/player,
   not a marketing page. Prefer compact spacing, readable forms, and predictable
   actions over decorative presentation.
3. **Components communicate state.** Use copy, placement, border weight, and
   status labels together. Do not make color the only way a user understands
   correctness, selection, validation, or deletion.
4. **Route-local CSS can still be systematic.** The app does not have a shared
   component library yet, so scoped Svelte styles must consume the same global
   tokens and follow the same component rules.
5. **Behavior wins over visual cleanup.** UI refactors must preserve quiz state,
   local storage keys, share URLs, drag-and-drop behavior, routes, and ARIA/live
   announcements.

## Source of truth

Global tokens live in `app/src/routes/+layout.svelte` under `:global(:root)`.
Body-level page background, text color, font stack, and shared focus-visible
ring also live there.

When a component needs a value that exists in the token system, use the token.
Add a token only when the existing scale cannot represent the need and the value
is likely to be reused.

### Color roles

| Role | Token | Use |
| --- | --- | --- |
| Page background | `--color-page` | Body background behind all routes. |
| Surface | `--color-surface` | Cards, panels, inputs, nav, buttons. |
| Muted surface | `--color-surface-muted` | Hover and softly selected areas. |
| Subtle surface | `--color-surface-subtle` | Divider bands, empty states, review rows. |
| Primary text | `--color-text` | Body text, headings, critical emphasis. |
| Muted text | `--color-text-muted` | Metadata, helper text, secondary copy. |
| Inverse text | `--color-text-inverse` | Text on filled green or black surfaces. |
| Border | `--color-border` | Default dividers, inputs, cards, panels. |
| Strong border | `--color-border-strong` | Adjacent focus or emphasized control borders. |
| Accent | `--color-green` | Primary actions, links, progress, success. |
| Accent hover | `--color-green-hover` | Hovered primary actions and stronger success text. |
| Accent soft | `--color-green-soft` | Selected/correct backgrounds and positive chips. |
| Accent border | `--color-green-border` | Positive chips and ready-state borders. |
| Critical background | `--color-critical-bg` | Wrong, invalid, timeout, and delete affordances. |
| Critical border | `--color-critical-border` | Wrong, invalid, timeout, and delete borders. |
| Critical text | `--color-critical-text` | Wrong, invalid, timeout, and delete text. |
| Focus ring | `--color-focus-ring` | Shared keyboard focus halo. |

### Typography roles

| Role | Token | Use |
| --- | --- | --- |
| Font family | `--font-sans` | Body and all controls. |
| Extra small | `--font-size-xs` | Eyebrows, labels, compact badges. |
| Small | `--font-size-sm` | Helper text, metadata, compact links. |
| Body | `--font-size-md` | Body copy, inputs, buttons. |
| Large | `--font-size-lg` | Section headings and compact prompts. |
| Extra large | `--font-size-xl` | Quiz prompts and important panel copy. |
| Page title | `--font-size-2xl`, `--font-size-3xl` | Mobile and desktop page titles. |
| Score | `--font-size-score` | Result score display only. |
| Regular | `--font-weight-regular` | Default body copy. |
| Medium | `--font-weight-medium` | Field errors and helper emphasis. |
| Semibold | `--font-weight-semibold` | Buttons and metadata. |
| Bold | `--font-weight-bold` | Titles, labels, score, prominent badges. |

Default letter spacing is `0`. Uppercase labels should use size and weight
rather than extra tracking.

### Spacing, layout, and surfaces

| Role | Token | Use |
| --- | --- | --- |
| Tight gap | `--space-1`, `--space-2` | Inline controls, labels, compact rows. |
| Control rhythm | `--space-3` | Button groups, answer choices, small grids. |
| Default gap | `--space-4` | Page stacks, panel grids, common flex gaps. |
| Panel padding | `--space-5`, `--space-6` | Cards, panels, player cards. |
| Page padding | `--space-8` | Route-level container padding. |
| Wide content | `--content-wide` | Creator workspace. |
| Default content | `--content-default` | Navigation and pack picker. |
| Readable content | `--content-readable` | Quiz player and prose-heavy surfaces. |
| Narrow content | `--content-narrow` | Shared-link fallback and compact states. |
| Small radius | `--radius-sm` | Letter badges and compact tags. |
| Standard radius | `--radius-md` | Buttons, inputs, cards, panels. |
| Pill radius | `--radius-pill` | Chips and counters. |
| Border width | `--border-width`, `--border-width-strong` | Default and emphasized UI boundaries. |
| Elevation | `--shadow-card`, `--shadow-hover`, `--shadow-focus` | Panels, card hover, focus-visible. |
| Motion scale | `--motion-fast`, `--motion-medium`, `--motion-slow` | 150ms, 250ms, and 400ms timing scale. |
| Motion semantics | `--motion-duration-*`, `--motion-ease-*` | Intent-based hover, focus, feedback, progress, entry, exit, and loading motion. |

### Motion roles

| Role | Token | Use |
| --- | --- | --- |
| Fast duration | `--motion-fast` | 150ms hover, focus, and quick state changes. |
| Medium duration | `--motion-medium` | 250ms progress, entry, and feedback transitions. |
| Slow duration | `--motion-slow` | 400ms loading or deliberately slower ambient motion. |
| Standard easing | `--motion-ease-standard` | Ease-out movement and state changes. |
| Emphasized easing | `--motion-ease-emphasized` | Ease-in-out for longer entry/loading transitions. |
| Hover duration | `--motion-duration-hover` | Button, link, card, and control hover states. |
| Focus duration | `--motion-duration-focus` | Focus ring and adjacent border/shadow changes. |
| Feedback duration | `--motion-duration-feedback` | Validation and answer feedback state changes. |
| Progress duration | `--motion-duration-progress` | Progress bars and determinate loading indicators. |
| Entry duration | `--motion-duration-entry` | Question, overlay, and panel entry. |
| Exit duration | `--motion-duration-exit` | Overlay or transient UI exit. |
| Loading duration | `--motion-duration-loading` | Skeletons or indeterminate loading affordances. |

`--motion-ease` remains as a compatibility alias for `--motion-ease-standard`
until older route-local CSS is migrated to semantic tokens.

## Component specifications

### App shell

**Use for:** site header, primary navigation, brand, and global route chrome.

- Header uses `--color-surface` with a bottom `--color-border` divider.
- Navigation max-width is `--content-default`.
- Brand uses primary text and bold weight.
- Nav links use muted text by default, green on hover/focus, and the shared
  focus-visible ring.
- The appearance control uses a real button with `aria-expanded` and a
  non-modal overlay panel. The overlay fades/scales with entry and exit tokens,
  closes on outside click or Escape, and keeps reduced-motion users on opacity
  only.

Do:

```css
.nav-links a:hover {
	background: var(--color-surface-muted);
	color: var(--color-green);
}
```

Do not:

```css
.nav-links a:hover {
	color: #1d4ed8;
}
```

Rationale: the app should have one accent color and one predictable focus model.

### Page headers and section headings

**Use for:** route titles, panel headers, management headers, share headers.

- Eyebrows and step labels use `--font-size-xs`, `--font-weight-bold`, and
  `--color-green`.
- Page titles use `--font-size-3xl` on desktop and `--font-size-2xl` on mobile.
- Supporting copy uses muted text and readable line height.
- Header action rows can stack on mobile.

Do:

- Pair page titles with concrete task copy: "Pick a pack", "Build a quiz draft".
- Keep secondary metadata visually quieter than the title.
- Use the same flex split pattern for headings with actions.

Do not:

- Add decorative hero sections to operational screens.
- Use negative letter spacing or custom one-off label sizes.

Rationale: consistent headings make the pack picker, player, and creator feel
like one tool even though their layouts differ.

### Cards and panels

**Use for:** pack cards, setup/builder/management panels, player cards, result
cards, empty cards, and shared fallback cards.

- Default surface: `--color-surface`, `--color-border`, `--radius-md`.
- Use `--shadow-card` when elevation separates a working surface from the page.
- Repeated rows and divider bands use `--color-surface-subtle` without an extra
  nested card.
- Pack card hover may use `--shadow-hover`; gate transform effects with
  `prefers-reduced-motion` when adding new transform motion.

Do:

```css
.panel {
	border: var(--border-width) solid var(--color-border);
	border-radius: var(--radius-md);
	background: var(--color-surface);
	box-shadow: var(--shadow-card);
}
```

Do not:

```css
.panel {
	border-radius: 14px;
	background: linear-gradient(...);
}
```

Rationale: cards and panels are work surfaces. Their job is to organize content,
not create a competing visual theme.

### Buttons and links

**Use for:** form submits, publish/save/preview actions, replay, navigation,
delete, reset, and inline utilities.

| Variant | Use | Styling |
| --- | --- | --- |
| Primary | Main forward action | Filled green, inverse text, green-hover background. |
| Secondary | Lower-priority navigation or utility | White surface, border, text color, green hover. |
| Text | Low-emphasis local action | Transparent, green text, no border. |
| Critical | Delete/remove/destructive | Surface or neutral background, black text/border, explicit label. |
| Segmented | Mutually exclusive setting | Grouped border, selected option filled green. |

Base button rules:

```css
min-height: 2.5rem;
border-radius: var(--radius-md);
font: inherit;
font-weight: var(--font-weight-semibold);
transition:
	background var(--motion-duration-hover) var(--motion-ease-standard),
	border-color var(--motion-duration-hover) var(--motion-ease-standard),
	color var(--motion-duration-hover) var(--motion-ease-standard),
	box-shadow var(--motion-duration-focus) var(--motion-ease-standard);
```

Do:

- Use real `<button>` elements for local actions.
- Use anchors for navigation.
- Make disabled buttons visibly disabled with opacity and `cursor: not-allowed`.
- Keep critical actions text-explicit, such as "Delete question".

Do not:

- Use red, pink, orange, or blue for button variants.
- Use color alone to imply an action is destructive.
- Put a button style on a non-interactive element.

Rationale: Quiz Lab mixes anchors and buttons correctly today. The visual system
should support that semantic split rather than hide it.

### Forms and validation

**Use for:** quiz setup, question builder, blank answer input, share URL, rich
prompt editor, checkboxes, radios, and selects.

- Labels use `--font-size-sm`, `--font-weight-semibold`, and `--color-text`.
- Inputs, textareas, selects, and contenteditable editors use surface, border,
  standard radius, inherited font, and shared focus ring.
- Invalid controls use `--color-critical-border` and visible error text.
- Validated controls can use `data-validation-state="idle|success|error"` for
  smooth border, background, and message transitions.
- Validation messages use explicit text plus a compact `!` or status icon; do
  not rely on border color alone.
- Native checkboxes and radios use `accent-color: var(--color-green)`.
- Placeholder, helper, and disabled text use `--color-text-muted`.

Do:

```css
input[aria-invalid='true'] {
	border-color: var(--color-critical-border);
}

input[data-validation-state='success'] {
	border-color: var(--color-green-border);
}

.field-error {
	display: inline-flex;
	gap: var(--space-2);
	color: var(--color-critical-text);
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-medium);
	animation: validation-message-in var(--motion-duration-feedback) var(--motion-ease-standard) both;
}
```

Do not:

```css
input[aria-invalid='true'] {
	border-color: #dc2626;
}
```

Rationale: invalid state has to survive color-blindness and the studio palette
standard. Pair the visual state with clear copy.

### Chips, pills, and metadata

**Use for:** categories, save status, publish status, timers, pack kicker
metadata, share readiness, and compact labels.

Positive/default pill:

```css
border: var(--border-width) solid var(--color-green-border);
border-radius: var(--radius-pill);
background: var(--color-green-soft);
color: var(--color-green);
font-size: var(--font-size-sm);
font-weight: var(--font-weight-semibold);
```

Neutral pill:

```css
border-color: var(--color-border);
background: var(--color-surface-subtle);
color: var(--color-text-muted);
```

Do:

- Use compact, scannable text.
- Keep pill dimensions stable when values change.
- Use warning/critical timers with critical tokens and explicit countdown copy.

Do not:

- Introduce a new chip color for every category.
- Use warm timer warning colors.

Rationale: pills are status labels. Consistent shapes and type make their meaning
quick to scan.

### Quiz answer controls

**Use for:** multiple-choice answers, true/false answers, fill-in answer inputs,
runtime player, and creator preview.

- Multiple-choice and true/false controls are buttons.
- Default answer controls use surface, border, primary text, and standard radius.
- Hover and selected states use green border and optional green-soft background.
- Correct states use green border/background plus explicit feedback copy.
- Wrong states use critical tokens plus explicit feedback copy.
- Letter badges use `--radius-sm`; correct badges may fill green, wrong badges
  may fill critical text with inverse text.

Do:

```css
.choice.correct {
	border-color: var(--color-green);
	background: var(--color-green-soft);
	color: var(--color-green-hover);
}

.choice.wrong {
	border-color: var(--color-critical-border);
	background: var(--color-critical-bg);
	color: var(--color-critical-text);
}
```

Do not:

```css
.choice.wrong {
	background: #fef2f2;
	color: #7f1d1d;
}
```

Rationale: a wrong answer is an important state, but it does not need a separate
palette. Border weight, text, and feedback copy carry the meaning.

### Feedback and review panels

**Use for:** answer explanation, wrong/correct messages, management feedback,
editing banner, answer review items, and preview review items.

- Use a left border to encode the state.
- Correct/positive feedback uses green border and green-soft background.
- Wrong, invalid, timeout, and destructive feedback uses critical tokens.
- Review rows should be readable at a glance and include the relevant answer
  copy, not only a color cue.

Do:

- Keep `aria-live` behavior for save state, timer, result, and feedback messages.
- Include labels such as "Correct", "Not quite", "Timed out", or "Question saved".
- Use neutral backgrounds for base review rows.

Do not:

- Rely on border color alone for correctness.
- Hide explanations behind hover or focus.

Rationale: feedback is often read under time pressure. It should be explicit,
high contrast, and stable.

### Progress and timers

**Use for:** player progress track, creator preview progress track, timer pill.

- Progress track uses `--color-surface-subtle`.
- Progress fill uses `--color-green`.
- Timer normal state uses the positive pill pattern.
- Timer warning state uses critical tokens and still displays the remaining time.
- Progress tracks are visual only where equivalent text or status copy is already
  present.
- Page navigation uses the shared layout route transition: keyed content fades in
  with `--motion-duration-entry`, a slim `role="status"` progress bar announces
  loading, and a compact skeleton band gives orientation while the next view
  settles.
- Skeleton loading surfaces use neutral surface tokens and
  `--motion-duration-loading`; they must not introduce new accent colors or
  layout shift.

Do:

- Pair progress bars with text such as "Question 3 of 15".
- Keep tracks and fills height-stable as progress changes.

Do not:

- Use warm colors for warning states.
- Animate width in a way that creates layout shift.
- Replace real content with long-lived skeletons after data has rendered.

Rationale: progress is orientation, not decoration. It should be calm and
predictable.

## Route-specific guidance

### Pack picker

- Keep the pack grid simple and scannable.
- Pack cards are anchors and should preserve the whole-card click target.
- Category and metadata styling should follow chip and metadata rules.
- The "Play" cue should remain a text affordance, not a competing button inside
  the card.

### Quiz player

- Preserve keyboard order: back link, answer controls, submit/next actions.
- Submit remains disabled until an answer is provided.
- Answer review states must include enough text for a user to understand the
  outcome without color.
- Keep the score display large and green; use `--font-size-score` only there.

### Quiz creator

- The creator is a dense working surface. Favor panels, dividers, and grouped
  controls over decorative cards.
- Setup, builder, management, share, and preview areas should stay visually
  distinct without nested card-heavy composition.
- Segmented controls must retain `aria-pressed`.
- Drag-over, validation, and editing states should use the shared focus/feedback
  language.

### Shared quiz route

- The shared fallback card should remain narrow and readable.
- Loading/unavailable states should explain what is happening and offer a clear
  path back to packs.
- Shared quiz rendering delegates to `QuizPlayer`; do not fork player styles
  into the shared route unless a state truly differs.

## Accessibility requirements

- Normal text must meet WCAG AA contrast of 4.5:1.
- Large or bold text and UI boundaries must meet at least 3:1.
- Every interactive element must have a visible `:focus-visible` state.
- Correctness, invalid state, warning, selection, and destructive intent must not
  rely on color alone.
- Reduced-motion users get static or near-instant alternatives: semantic motion
  durations collapse to `1ms`, transform/keyframe surfaces are removed locally,
  and JavaScript-initiated scrolling uses `auto` instead of `smooth`.
- Keep keyboard order aligned with visual order.
- Use native controls where possible: anchors for navigation, buttons for
  actions, checkboxes/radios/selects for native form choices.
- Preserve `aria-live`, `aria-invalid`, `aria-pressed`, labels, and roles when
  restyling existing components.

## Responsive requirements

- Keep the existing breakpoints unless a task identifies a concrete layout bug.
- At mobile widths, action rows may stack and buttons may become full-width.
- Segmented controls may stack vertically when labels would otherwise crowd.
- Fixed-format elements such as progress tracks, pills, letter badges, and score
  counters should not resize unexpectedly as state changes.
- Text must wrap cleanly inside buttons, cards, panels, and chips.

## Content guidance

Use short, direct labels:

- Primary actions: "Publish", "Submit answer", "Next question", "Play again".
- Secondary actions: "All packs", "Pick another pack", "Preview quiz".
- Critical actions: "Delete question", "Remove option".
- Feedback: "Correct", "Not quite", "Title required", "Draft autosaves".

Avoid vague labels:

- "Click here"
- "Danger"
- "Error" without a fix
- "Proceed" when the next step can be named

Rationale: clear labels reduce the amount of visual decoration needed to explain
state.

## Review checklist

Before merging a UI change:

- Does it use existing tokens instead of new literals?
- Does it avoid red, pink, orange, and blue accents?
- Does every interactive element have focus-visible treatment?
- Does every state make sense without color?
- Does it preserve route behavior, storage keys, share URLs, and ARIA semantics?
- Does it pass `npm run check` and `npm run build` from `app/`?
- Does the PR preview load the pack picker, creator, quiz player, and shared
  fallback routes?

## Change control

When adding a component or state:

1. Start from the closest component family in this document.
2. Reuse global tokens from `+layout.svelte`.
3. Add a new token only for a reusable role, not for a one-off pixel value.
4. Update this document and `ui-style-guide.md` when the token system changes.
5. Validate the GitHub Pages PR preview before merging.

When extracting shared Svelte components later, prioritize:

1. Button variants.
2. Status chips.
3. Field and validation wrappers.
4. Progress and timer display.
5. Quiz answer controls.
6. Feedback and review rows.
7. Card and panel surfaces.

These candidates come from the inventory and are intentionally ordered by reuse
and drift risk.
