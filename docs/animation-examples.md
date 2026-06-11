# Quiz Lab animation examples

Deliverable for **idea #5 / task #40**: Storybook-ready documentation for the
motion work added across tasks #35-#39.

The app does not currently include Storybook configuration or Storybook
dependencies. Until that tooling exists, this document is the source for
animation examples, interaction states, code snippets, and accessibility notes.
Each example below is structured so it can become an MDX docs page or Component
Story Format story with minimal rewriting.

## Storybook status

| Area | Current repo state | Recommended Storybook story |
| --- | --- | --- |
| Motion tokens | CSS custom properties live in `app/src/routes/+layout.svelte` and every theme map. | `Design System/Motion Tokens` with token swatches and duration controls. |
| Hover and focus | Shared global transitions plus route-local component hover states. | `Components/Interactive States` with hover, focus-visible, disabled, and selected states. |
| Overlay entry and exit | Appearance popover in `+layout.svelte`. | `App Shell/Appearance Popover` with closed, opening, open, and reduced-motion examples. |
| Form validation | Creator setup and question builder validation states. | `Creator/Form Validation` with idle, error, success, and reduced-motion states. |
| Route loading | Shared layout route entry, progress status, and skeleton band. | `App Shell/Route Loading` with loading, settled, and reduced-motion states. |

## Motion token story

Use this story to show the timing scale and semantic aliases. Controls should let
reviewers switch between default, dark, high contrast, and purple themes without
changing the token names used by components.

| Token | Duration | Use |
| --- | --- | --- |
| `--motion-duration-hover` | 150ms | Hover color, border, background, and subtle transform. |
| `--motion-duration-focus` | 150ms | Focus ring, adjacent border, and shadow. |
| `--motion-duration-feedback` | 250ms | Validation messages, answer feedback, and status changes. |
| `--motion-duration-progress` | 250ms | Determinate progress track width. |
| `--motion-duration-entry` | 250ms | Page, question, panel, and overlay entry. |
| `--motion-duration-exit` | 150ms | Overlay and transient UI exit. |
| `--motion-duration-loading` | 400ms | Indeterminate progress and skeleton shimmer. |

Story controls:

| Control | Values | Expected behavior |
| --- | --- | --- |
| `duration` | hover, focus, feedback, progress, entry, exit, loading | Preview uses the selected semantic duration token. |
| `easing` | standard, emphasized | Preview uses `--motion-ease-standard` or `--motion-ease-emphasized`. |
| `theme` | default, dark, high contrast, purple | Colors change, timings remain stable. |
| `reducedMotion` | on, off | Transform/keyframe examples switch to opacity-only or no animation. |

Example preview CSS:

```css
.motion-token-preview {
	border: var(--border-width) solid var(--color-border);
	border-radius: var(--radius-md);
	background: var(--color-surface);
	color: var(--color-text);
	transition:
		background var(--motion-duration-hover) var(--motion-ease-standard),
		border-color var(--motion-duration-hover) var(--motion-ease-standard),
		box-shadow var(--motion-duration-focus) var(--motion-ease-standard);
}
```

## Interactive states story

Use for nav links, buttons, segmented controls, answer controls, theme options,
and rating controls. Keep examples compact and work-focused rather than
decorative.

| State | Required signal | Motion tokens |
| --- | --- | --- |
| Default | Surface, text, and border match component rules. | None beyond inherited transitions. |
| Hover | Border/background/color changes; optional small lift. | `--motion-duration-hover`, `--motion-ease-standard`. |
| Focus-visible | Shared `--shadow-focus` ring. | `--motion-duration-focus`, `--motion-ease-standard`. |
| Selected | Green fill or border plus explicit text/pressed state. | Hover/focus tokens for color and border. |
| Disabled | Lower opacity and `cursor: not-allowed`; no transform. | Hover/focus tokens only if clarity improves. |

Example story markup:

```svelte
<button class="primary-button">Start quiz</button>
<button class="secondary-button">Save draft</button>
<button class="secondary-button" disabled>Publish</button>

<div class="segmented" role="group" aria-label="Difficulty">
	<button type="button" aria-pressed="false">Easy</button>
	<button type="button" aria-pressed="true">Medium</button>
	<button type="button" aria-pressed="false">Hard</button>
</div>
```

Example transform guard:

```css
@media (prefers-reduced-motion: no-preference) {
	.interactive-card:hover {
		transform: translateY(-2px);
	}
}
```

## Overlay story

Use the appearance popover as the current overlay pattern. It is a non-modal
dialog controlled by a real button with `aria-expanded`.

| State | Visual example | Accessibility check |
| --- | --- | --- |
| Closed | Popover has `opacity: 0`, `visibility: hidden`, and no pointer events. | Trigger has `aria-expanded="false"`. |
| Open | Popover fades and scales from the trigger edge. | Trigger has `aria-expanded="true"` and popover has `role="dialog"`. |
| Exit | Popover fades/scales out using exit duration. | Outside click and Escape close it. |
| Reduced motion | Opacity changes only; transform is removed. | Same keyboard behavior. |

Example CSS:

```css
.theme-popover {
	opacity: 0;
	transform: translateY(-0.35rem) scale(0.98);
	transition:
		opacity var(--motion-duration-exit) var(--motion-ease-standard),
		transform var(--motion-duration-exit) var(--motion-ease-standard),
		visibility 0s linear var(--motion-duration-exit);
	visibility: hidden;
}

.theme-popover.open {
	opacity: 1;
	transform: translateY(0) scale(1);
	transition:
		opacity var(--motion-duration-entry) var(--motion-ease-standard),
		transform var(--motion-duration-entry) var(--motion-ease-standard),
		visibility 0s;
	visibility: visible;
}
```

## Form validation story

Use the creator route validation pattern for setup fields, rich editor surfaces,
answer inputs, and point inputs.

| State | Attribute | Required feedback |
| --- | --- | --- |
| Idle | `data-validation-state="idle"` | Normal input styling. |
| Error | `aria-invalid="true"` and `data-validation-state="error"` | Critical border/background, explicit message text, and `!` icon. |
| Success | `aria-invalid="false"` and `data-validation-state="success"` | Green border/shadow and explicit ready or saved copy when useful. |
| Reduced motion | Same attributes | Message and icon animations are disabled. |

Example markup:

```svelte
<label>
	<span>Title</span>
	<input
		aria-invalid={attemptedSubmit && !!titleError}
		data-validation-state={attemptedSubmit ? (titleError ? 'error' : 'success') : 'idle'}
		placeholder="Premier League pub quiz"
	/>
</label>

{#if attemptedSubmit && titleError}
	<span class="field-error">{titleError}</span>
{/if}
```

Example CSS:

```css
input[data-validation-state='error'],
.editor-surface[data-validation-state='error'] {
	border-color: var(--color-critical-border);
	background: var(--color-critical-bg);
	animation: validation-surface-in var(--motion-duration-feedback) var(--motion-ease-standard) both;
}

.field-error {
	display: inline-flex;
	gap: var(--space-2);
	color: var(--color-critical-text);
	animation: validation-message-in var(--motion-duration-feedback) var(--motion-ease-standard) both;
}
```

## Route loading story

Use the shared layout pattern for route changes. The Storybook example should
show a page shell, a top loading status, a neutral skeleton band, and a settled
view.

| State | Visual example | Accessibility check |
| --- | --- | --- |
| Loading | Slim green progress bar and three neutral skeleton lines. | Progress wrapper has `role="status"` and status copy. |
| Entering | New route view fades in with a small vertical offset. | Content remains readable and does not shift surrounding layout. |
| Settled | Progress and skeleton are removed. | Route shell has `aria-busy="false"`. |
| Reduced motion | Progress and skeleton do not shimmer; route transform is removed. | Status copy remains available. |

Example markup:

```svelte
{#if routeLoading}
	<div class="route-progress" role="status" aria-live="polite">
		<span class="visually-hidden">Loading next page</span>
		<span aria-hidden="true"></span>
	</div>
	<div class="route-skeleton" aria-hidden="true">
		<span></span>
		<span></span>
		<span></span>
	</div>
{/if}
```

Example CSS:

```css
.route-view {
	animation: route-view-in var(--motion-duration-entry) var(--motion-ease-standard) both;
}

.route-progress span[aria-hidden='true'] {
	background: var(--color-green);
	animation: route-progress var(--motion-duration-loading) var(--motion-ease-emphasized) infinite;
}

.route-skeleton span {
	background:
		linear-gradient(
			90deg,
			var(--color-surface-subtle) 0%,
			var(--color-surface-muted) 48%,
			var(--color-surface-subtle) 100%
		);
	animation: route-skeleton-shimmer var(--motion-duration-loading) var(--motion-ease-emphasized) infinite;
}
```

## Accessibility checklist

- Respect `prefers-reduced-motion` for every transform or keyframe.
- Keep correctness, validation, warning, and destructive states understandable
  without color.
- Do not delay answer correctness feedback or validation copy for the sake of
  animation.
- Use `role="status"` or existing live regions when loading or feedback needs to
  be announced.
- Keep focus-visible styles present in every interactive-state story.
- Keep skeletons decorative with `aria-hidden="true"` and pair them with status
  copy.
- Stay within the black, green, and white palette documented in
  `docs/design-system.md`.

## Reduced-motion story

Use this story to test the app with `prefers-reduced-motion: reduce` enabled.
The expected result is not a separate visual design; it is the same UI with
motion removed or reduced to static state changes.

| Surface | Default motion | Reduced-motion behavior |
| --- | --- | --- |
| Route loading | Route view fades/translates, progress animates, skeleton shimmers. | Route transform, progress animation, and shimmer are removed. |
| Appearance popover | Opacity and scale transition. | Opacity transition only; scale transform is removed. |
| Creator validation | Invalid surfaces, messages, and icons animate in. | Validation state appears immediately with the same copy and icons. |
| Quiz player | Question card enters with opacity/translate and progress width transitions. | Question card appears statically and progress width snaps to the new value. |
| Landing hero word | Rotating word stack translates vertically. | First word is static; alternate words are hidden. |
| Creator preview scroll | Preview start scrolls smoothly to the preview panel. | Preview start uses automatic scrolling. |

## Storybook migration notes

When Storybook is introduced, start with these docs pages:

1. `Design System/Motion Tokens.mdx`
2. `App Shell/Route Loading.stories.svelte`
3. `App Shell/Appearance Popover.stories.svelte`
4. `Creator/Form Validation.stories.svelte`
5. `Components/Interactive States.stories.svelte`

Use play functions only for state changes that need verification, such as opening
the appearance popover, forcing validation errors, and toggling the loading
state. Do not use Storybook controls to create motion values that do not exist in
the token system.
