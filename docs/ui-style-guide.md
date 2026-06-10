# Quiz Lab UI style guide

Deliverable for **idea #2 / task #11**: Define the design tokens,
component specifications, and usage rules that the UI cleanup work should apply
across Quiz Lab.

This guide turns the findings from [`ui-audit.md`](./ui-audit.md) and the
inventory in [`ui-component-inventory.md`](./ui-component-inventory.md) into a
single standard. Runtime CSS should adopt these values in task #13.

For the centralized usage guide that consolidates these decisions into review
rules, examples, and component guidance, see [`design-system.md`](./design-system.md).

## Design Principles

1. **Use one palette.** The product palette is black, green, white, and
   accessible neutral tints. Do not introduce red, pink, orange, or blue accents
   for standard UI states.
2. **Prefer meaning over decoration.** Use color to reinforce state, not to
   create novelty. Layout, copy, and disabled states must still make sense
   without color.
3. **Make repeated surfaces predictable.** Buttons, cards, chips, forms, and
   quiz answer controls should share tokenized sizes and states.
4. **Keep the app operational.** Quiz Lab is a small tool, not a marketing page.
   Use compact spacing, clear hierarchy, and scannable controls.

## Token Naming

Use CSS custom properties on `:global(:root)` in `app/src/routes/+layout.svelte`.
Tokens are grouped by role rather than by route or component.

### Color Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `--color-page` | `#f7faf8` | App background. |
| `--color-surface` | `#ffffff` | Cards, panels, inputs, nav. |
| `--color-surface-muted` | `#eef7f2` | Soft selected and positive backgrounds. |
| `--color-surface-subtle` | `#f2f5f3` | Neutral bands, empty states, review rows. |
| `--color-text` | `#111111` | Primary text and destructive/critical semantic emphasis. |
| `--color-text-muted` | `#5f6b62` | Secondary text, metadata, helper text. |
| `--color-text-inverse` | `#ffffff` | Text on filled green or black buttons. |
| `--color-border` | `#d9e2dc` | Default borders and dividers. |
| `--color-border-strong` | `#9fb3a8` | Hover/focus-adjacent borders. |
| `--color-green` | `#0f766e` | Primary accent, links, success states. |
| `--color-green-hover` | `#0b5d55` | Primary hover and active accent. |
| `--color-green-soft` | `#e6f6f0` | Green-tinted backgrounds. |
| `--color-green-border` | `#a8d8ce` | Green-tinted borders. |
| `--color-critical-bg` | `#f2f5f3` | Incorrect/error background without red or pink. |
| `--color-critical-border` | `#111111` | Incorrect/error border without red or pink. |
| `--color-critical-text` | `#111111` | Incorrect/error text without red or pink. |
| `--color-focus-ring` | `rgba(15, 118, 110, 0.24)` | Accessible green focus halo. |

Use `--color-critical-*` for invalid fields, wrong answers, delete actions, and
timer warnings. These states should be distinguished by text, labels, border
weight, and placement, not by red/pink color.

### Typography Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `--font-sans` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | Global font stack. |
| `--font-size-xs` | `0.75rem` | Eyebrows, table/list labels. |
| `--font-size-sm` | `0.875rem` | Helper text, metadata, compact links. |
| `--font-size-md` | `1rem` | Body, buttons, inputs. |
| `--font-size-lg` | `1.25rem` | Section headings, prompts on compact surfaces. |
| `--font-size-xl` | `1.5rem` | Quiz prompts and important panel copy. |
| `--font-size-2xl` | `2rem` | Mobile or compact page title. |
| `--font-size-3xl` | `3rem` | Desktop page title. |
| `--font-size-score` | `4rem` | Result score display only. |
| `--font-weight-regular` | `400` | Body copy. |
| `--font-weight-medium` | `650` | Field errors and helper emphasis. |
| `--font-weight-semibold` | `750` | Buttons and metadata. |
| `--font-weight-bold` | `850` | Page titles, labels, score. |

Letter spacing should be `0` by default. Uppercase labels should rely on weight
and size rather than tracking.

### Spacing Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `--space-1` | `0.25rem` | Tight inline gaps. |
| `--space-2` | `0.5rem` | Label/control gaps. |
| `--space-3` | `0.75rem` | Button internal rhythm, compact groups. |
| `--space-4` | `1rem` | Default grid and stack gap. |
| `--space-5` | `1.25rem` | Card and panel padding. |
| `--space-6` | `1.5rem` | Page sections, larger card padding. |
| `--space-8` | `2rem` | Page padding and section separation. |
| `--space-10` | `2.5rem` | Large vertical separation. |

Use the smallest spacing that keeps controls readable. Do not add new arbitrary
gap values unless a component has a fixed external constraint.

### Layout Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `--content-wide` | `1180px` | Creator workspace. |
| `--content-default` | `1080px` | Navigation and pack picker. |
| `--content-readable` | `760px` | Quiz player and prose-heavy surfaces. |
| `--content-narrow` | `720px` | Shared-link fallback and compact states. |

### Radius, Border, Shadow, and Motion Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `--radius-sm` | `6px` | Letter badges and compact tags. |
| `--radius-md` | `8px` | Buttons, inputs, cards, panels. |
| `--radius-pill` | `999px` | Pills and circular counters. |
| `--border-width` | `1px` | Default border width. |
| `--border-width-strong` | `2px` | Critical state or selected answer emphasis. |
| `--shadow-card` | `0 12px 30px rgba(17, 17, 17, 0.06)` | Panels and elevated cards. |
| `--shadow-hover` | `0 10px 24px rgba(17, 17, 17, 0.08)` | Hovered pack cards. |
| `--shadow-focus` | `0 0 0 3px var(--color-focus-ring)` | Focus-visible ring. |
| `--motion-fast` | `120ms` | Color, border, and shadow changes. |
| `--motion-medium` | `180ms` | Question entry or meaningful transitions. |
| `--motion-ease` | `ease` | Default easing. |

Gate transform animations with `@media (prefers-reduced-motion: no-preference)`.
Color, border, and shadow transitions may remain, but keep them short.

## Component Specifications

### App Shell

- Body owns the font stack, text color, and page background.
- Header uses `--color-surface` and `--color-border`.
- Nav links use muted text by default and green on hover/focus.
- Every link in the header and player top row needs the shared focus ring.

### Buttons and Links

| Variant | Use | Styling |
| --- | --- | --- |
| Primary | Main forward action: publish, submit, next, replay | Filled `--color-green`, inverse text, hover `--color-green-hover`. |
| Secondary | Secondary navigation or utility action | White surface, `--color-border`, text color, green hover border/text. |
| Text | Low-emphasis local action | Transparent background, green text, no border. |
| Critical | Delete, remove, invalid destructive action | White or neutral surface, black text/border, explicit label text. |
| Segmented | Mutually exclusive setting | Shared border container; selected option uses filled green. |

Buttons and button-like anchors should use:

```css
min-height: 2.5rem;
border-radius: var(--radius-md);
font: inherit;
font-weight: var(--font-weight-semibold);
transition:
	background var(--motion-fast) var(--motion-ease),
	border-color var(--motion-fast) var(--motion-ease),
	color var(--motion-fast) var(--motion-ease),
	box-shadow var(--motion-fast) var(--motion-ease);
```

Disabled buttons should reduce opacity and use `cursor: not-allowed`. Disabled
quiz choices after answer submission may keep full opacity when they are
displaying correct/incorrect state.

### Forms

- Labels use `--font-size-sm`, `--font-weight-semibold`, and `--color-text`.
- Inputs, textareas, selects, and contenteditable editors use a white surface,
  `--color-border`, `--radius-md`, and the shared focus ring.
- Invalid fields use `--color-critical-border` and a visible text message. Do
  not rely on border color alone.
- Native checkboxes and radios use `accent-color: var(--color-green)`.
- Placeholder and helper text use `--color-text-muted`.

### Cards and Panels

- Cards and panels use `--color-surface`, `--color-border`, `--radius-md`, and
  `--shadow-card` when elevation helps separate the surface from the page.
- Repeated list rows can use `--color-surface-subtle` without a shadow.
- Pack cards may translate on hover only inside `prefers-reduced-motion:
  no-preference`.
- Do not nest decorative cards inside cards. Use divider bands for sections like
  share settings or preview mode.

### Chips and Status Pills

Use the same shape and type treatment for categories, save status, published
status, timers, and metadata chips:

```css
border: var(--border-width) solid var(--color-green-border);
border-radius: var(--radius-pill);
background: var(--color-green-soft);
color: var(--color-green);
font-size: var(--font-size-sm);
font-weight: var(--font-weight-semibold);
```

Neutral chips swap to `--color-surface-subtle`, `--color-border`, and
`--color-text-muted`.

### Quiz Answer Controls

- Multiple-choice and true/false controls are buttons.
- Default choices use white background, `--color-border`, and primary text.
- Hover and selected choices use green border; selected choices may use
  `--color-green-soft`.
- Correct choices use green border/background and clear copy such as "Correct."
- Wrong choices use `--color-critical-*` plus clear copy such as "Not quite."
- The letter badge should use `--radius-sm`; correct badges may fill green,
  while wrong badges should use black text/border or a black fill with inverse
  text.

### Feedback and Review Panels

- Feedback panels use a left border to encode state.
- Correct state uses green border, green-soft background, and readable dark text.
- Wrong, invalid, timed-out, or destructive state uses critical border/text with
  neutral background. Avoid red/pink color coding.
- Review list items use the same status border convention as answer feedback.

### Progress and Timers

- Progress tracks use `--color-surface-subtle`; fill uses `--color-green`.
- Timer normal state uses the status pill treatment.
- Timer warning state uses critical border/text with explicit copy or countdown,
  not warm colors.

### Responsive Behavior

- Keep existing breakpoints unless task #13 finds a specific layout bug.
- At mobile widths, action rows may stack and buttons may become full-width.
- Segmented controls may become vertical when labels would otherwise crowd.
- Keep fixed-format controls stable: progress tracks, pill counters, and quiz
  choice badges should not resize as content changes.

## Accessibility Rules

- Body text and button text must meet WCAG AA contrast: 4.5:1 for normal text,
  3:1 for large/bold text and UI boundaries.
- Every interactive element needs a visible `:focus-visible` state.
- Do not use color as the only indicator of correctness, invalid input, timer
  warning, selection, or destructive action.
- Keep keyboard order aligned with visual order.
- Use real buttons and anchors, as the current app already does.
- Preserve `aria-live` on save state and timer/result feedback where present.

## Migration Notes for Task #13

1. Add root tokens in `+layout.svelte` and move the font stack to `body`.
2. Replace repeated blue accents with green tokens.
3. Replace red, pink, orange, and warm warning values with critical neutral
   tokens and explicit labels.
4. Normalize primary/secondary/text/critical button classes across player and
   creator.
5. Normalize input, segmented, chip, progress, and feedback styles.
6. Preserve behavior first; visual refactors should not change quiz state logic,
   local storage keys, sharing URLs, drag/drop semantics, or route structure.

## Change Control

When adding a new UI component or state:

- Start with an existing component family from the inventory.
- Add a token only when the current scale cannot represent the need.
- Document any new token here before using it broadly.
- Verify the preview deployment on desktop and mobile widths before merging.
