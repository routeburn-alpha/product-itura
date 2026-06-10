# Quiz Lab UI component inventory

Deliverable for **idea #2 / task #10**: Inventory and categorize all existing UI
components so later UI cleanup work can standardize the system without guessing at
what exists.

This inventory is based on the current Svelte source. It is intentionally
descriptive: it does not change runtime UI, and it does not attempt to solve the
inconsistencies already cataloged in [`ui-audit.md`](./ui-audit.md).

## Scope

| Source | Surface | Notes |
| --- | --- | --- |
| `app/src/routes/+layout.svelte` | Global app shell | Header, primary nav, global body styling. |
| `app/src/routes/+page.svelte` | Pack picker | Home page, pack card grid, pack metadata. |
| `app/src/lib/QuizPlayer.svelte` | Quiz player | Empty, playing, answered, score, and answer review states. |
| `app/src/routes/play/[pack]/+page.svelte` | Pack route wrapper | Loads a bundled pack and delegates rendering to `QuizPlayer`. |
| `app/src/routes/play/shared/+page.svelte` | Shared quiz route | Decodes hash payload, delegates playable state to `QuizPlayer`, renders fallback card. |
| `app/src/routes/create/+page.svelte` | Quiz creator | Setup form, question builder, management tools, sharing, preview player, question list. |

## Component Family Summary

| Category | Component families | Primary files |
| --- | --- | --- |
| App chrome | Site header, top nav, brand link, nav links | `+layout.svelte` |
| Page structure | Containers, page headers, section headings, workspace grid, panels | Home, player, shared route, creator |
| Navigation links | Back links, nav links, pack card links, external GitHub link | Layout, home, player, shared, creator |
| Action controls | Primary, secondary, text, remove, danger, rich-toolbar, segmented, quiz choice buttons | Player, creator |
| Forms | Field groups, text inputs, number inputs, textarea, select, checkbox, radio, readonly URL, contenteditable editor | Creator, player |
| Quiz interaction | Question card, choice list, boolean grid, blank answer, answer feedback, progress, timer | `QuizPlayer`, creator preview |
| Cards and panels | Pack cards, setup/builder/management panels, player cards, shared fallback card | Home, player, shared, creator |
| Status and feedback | Pills, validation messages, management feedback, editing banner, score/result states | Player, creator |
| Lists and summaries | Pack grid, result stats, answer review lists, saved question list, managed draggable list | Home, player, creator |
| Empty states | Empty pack, builder locked state, no saved questions, unavailable share link | Player, shared, creator |

There are no modal, dialog, popover, toast, tab, table, menu, or tooltip
components in the current UI. Native browser controls provide the only dropdown
behavior through `<select>`.

## 1. App Chrome and Navigation

| Component | Source | Variants and states | Behavior | Styling notes |
| --- | --- | --- | --- | --- |
| Site header | `+layout.svelte` (`.site-header`) | Single global instance | Wraps primary navigation on every page | White surface, bottom divider, full width. |
| Top nav | `+layout.svelte` (`.top-nav`) | Desktop row, mobile stacked layout | Provides brand, pack picker, creator, and GitHub links | 1080px max width, local font declaration duplicated with page containers. |
| Brand link | `+layout.svelte` (`.brand`) | Default only | Navigates to pack picker | Strong text link, no custom hover/focus style. |
| Nav links | `+layout.svelte` (`.nav-links a`) | Default, hover | Internal links plus external GitHub link | Rounded text links; hover currently uses a blue accent that differs from the green studio palette. |
| Back link | `QuizPlayer.svelte`, `play/shared/+page.svelte` (`.back-link`) | Default, hover | Returns to pack picker or caller-provided href | Text-only link, green hover, repeated in two scoped style blocks. |
| Pack card link | `+page.svelte` (`.pack-card`) | Default, hover | Entire card navigates to a pack route | Card-as-link pattern; hover lifts and changes border/accent. |

Inventory note: navigation is implemented with real anchors throughout, which is
good for semantics. Focus styling is inconsistent: pack cards have custom focus
in the earlier audit snapshot, while current nav/back links mostly rely on
browser defaults.

## 2. Page Structure

| Component | Source | Variants and states | Behavior | Styling notes |
| --- | --- | --- | --- | --- |
| Page container | Home `.container`, player `.container`, shared `.container`, creator `.container` | Different max widths and padding by surface | Centers page content | Font family and base text color are repeated in route-local CSS. |
| Page header | Home/creator `.page-header` | Desktop row, mobile stacked in creator/home | Holds eyebrow, title, subtitle, and optional actions | Home and creator share the same structural pattern but different max widths and text scale. |
| Eyebrow/step label | `.eyebrow`, `.step-label`, `.result-label` | Page label, section step, result label | Static metadata | Uppercase green labels appear in multiple files with similar but not centralized styling. |
| Section heading | Home `.section-heading`, creator `.panel-heading`, `.share-heading`, `.review-heading` | Static, action-bearing, summary-bearing | Groups a heading with count/status/actions | Same flex split pattern repeated under different class names. |
| Workspace grid | Creator `.workspace` | Two-column desktop, one-column mobile | Arranges setup, builder, and management panels | Only creator uses a multi-panel dashboard layout. |

Inventory note: page structure is currently composed inline in each route. There
are no shared layout primitives beyond Svelte route nesting.

## 3. Cards, Panels, and Surfaces

| Component | Source | Variants and states | Behavior | Styling notes |
| --- | --- | --- | --- | --- |
| Pack card | Home `.pack-card` | Default, hover | Navigates to selected pack | Repeated content card with title/category/description/meta. |
| Setup panel | Creator `.setup-panel` | Static | Contains quiz setup form | White card with border, radius, shadow. |
| Builder panel | Creator `.builder-panel`, `.builder-panel.ready` | Locked, ready | Contains question builder once setup is valid | Ready state changes border color. |
| Management panel | Creator `.management-panel` | Static with conditional sections | Contains status, actions, share, preview, saved question management | Full-width panel below setup/builder. |
| Question card | Player `.question-card`, creator `.preview-question-card` | Initial, selected, answered | Hosts prompt and answer controls | Runtime player card is bordered/shadowed; creator preview card is a lighter nested panel inside preview area. |
| Result card | Player `.result-card` | Score summary and review | Displays final score and review list | Shares card styling with empty state. |
| Empty card | Player `.empty-card`, shared `.share-card` | Empty pack, unavailable shared link | Explains unavailable state and offers navigation | Similar white bordered/shadowed surface with separate class names. |
| Share panel | Creator `.share-panel` | Unavailable, ready | Shows public link controls when quiz is published | Uses divider bands rather than a nested card. |
| Preview area | Creator `.preview-area` | Playing, results | Embeds a mini player inside management panel | Light tinted band with its own progress, question, feedback, review list. |

Inventory note: bordered white surfaces are common but not centralized. Radii are
mostly 8px in the current code, while spacing and shadow values still vary by
surface.

## 4. Action Controls

| Component | Source | Variants and states | Behavior | Styling notes |
| --- | --- | --- | --- | --- |
| Primary button/link | Player/creator `.primary-button` | Default, hover, disabled on buttons | Submit, continue, publish, replay, open shared link | Same class applied to both `<button>` and `<a>`. Uses filled accent styling. |
| Secondary button/link | Player/creator `.secondary-button` | Default, hover, disabled on buttons | Navigation and lower-priority actions | Same class applied to buttons and anchors. White surface with bordered accent hover. |
| Text button | Creator `.text-button` | Default, hover | Reset and pause builder setup | Low-emphasis inline button. |
| Remove button | Creator `.remove-button` | Default, hover | Removes a multiple-choice option | Separate class from danger button, hover uses an off-palette danger tone. |
| Danger button | Creator `.danger-button` | Default, hover, disabled | Deletes saved questions | Explicit destructive action style; currently outside the black/green/white palette standard. |
| Segmented buttons | Creator `.segmented button` | Default, selected, mobile stacked | Difficulty, timer mode, question type, true/false answer selection | Native buttons in a grouped visual container with `aria-pressed`. |
| Rich-toolbar buttons | Creator `.rich-toolbar button` | Default, hover | Applies bold, italic, unordered list commands to contenteditable prompt | Icon-like text buttons using B/I/bullet glyphs and accessible labels. |
| Quiz choice button | Player `.choice`, creator `.preview-choice` | Default, hover, selected, correct, wrong, disabled | Selects multiple-choice answers | Letter badges are nested spans; correct/wrong states duplicate between player and preview. |
| Boolean answer button | Player `.boolean-grid button`, creator `.preview-boolean button` | Default, hover, selected, correct, wrong, disabled | Selects true/false answers | Shares state language with multiple-choice controls but is styled via separate selectors. |

Inventory note: the app has a useful action hierarchy, but it is class-based and
duplicated rather than componentized. Primary/secondary buttons are the closest
thing to a cross-surface control system.

## 5. Forms and Inputs

| Component | Source | Variants and states | Behavior | Styling notes |
| --- | --- | --- | --- | --- |
| Field group | Creator `.field`, player `.blank-answer` | Standard, compact, preview blank answer | Pairs label text, control, and optional validation | Creator field pattern is broad; player blank answer repeats a smaller variant. |
| Text input | Creator and player `<input type="text">` | Editable, readonly share URL, disabled during answer review, invalid | Captures title, answers, accepted answers, share URL | Focus ring exists on creator inputs and player blank input. |
| Number input | Creator `<input type="number">` | Valid, invalid | Time limit and points | Uses browser numeric controls and shared input styling. |
| Textarea | Creator `<textarea>` | Default | Description and explanation text | Same styling as inputs, vertical resize enabled. |
| Select | Creator `<select>` | Default | Category selection | Native select, same styling as inputs. |
| Checkbox toggle | Creator `.toggle-row input[type="checkbox"]` | Checked/unchecked | Enables time limit | Native checkbox with green accent-color. |
| Radio option | Creator `.correct-choice input[type="radio"]` | Checked/unchecked | Marks correct multiple-choice option | Native radio with green accent-color and custom letter badge. |
| Contenteditable editor | Creator `.editor-surface` | Empty, focused, invalid | Rich question prompt entry, sanitized on paste/input | Uses `role="textbox"` and toolbar commands instead of a textarea. |
| Hidden type controls | Creator `.type-controls[hidden]` | Multiple choice, true/false, fill blank | Switches answer UI based on question type | Uses `hidden` plus `aria-hidden`. |

Inventory note: forms are real HTML controls with labels and validation hooks.
The main inconsistency is visual: creator form controls have a fuller focus and
invalid system than player controls.

## 6. Quiz Player Components

| Component | Source | Variants and states | Behavior | Styling notes |
| --- | --- | --- | --- | --- |
| Player shell | `QuizPlayer.svelte` (`.player-shell`) | Playing only | Wraps top row, progress, question card | Simple grid stack. |
| Top row/meta | `.top-row`, `.top-meta` | With/without timer | Displays back link, progress label, timer | Flex row collapses on small screens. |
| Timer pill | Player/creator `.timer-pill`, `.timer-pill.warning` | Normal, warning | Counts down per question or total quiz | Warning state currently uses a warm hue outside the black/green/white palette. |
| Progress track | Player `.progress-track`, creator `.preview-progress` | Width updates by question progress | Visual progress only (`aria-hidden`) | Same behavior repeated under different class names. |
| Pack kicker | Player `.pack-kicker` | Category/type/points chips | Metadata above prompt | Chip styling is local to player. |
| Prompt | Player `.prompt`, creator `.preview-prompt` | Runtime and preview | Displays current question text | Large bold text with overflow wrapping. |
| Answer feedback | Player `.feedback`, creator `.preview-feedback` | Neutral, correct, wrong, timed out | Announces correctness and explanation | Correct/wrong styling duplicated across player and preview. |
| Result hero | Player `.result-hero` | Score bands by copy | Displays final score and summary | Score text uses accent color and large type. |
| Result stats | Player `.result-stats` | Static three-column, mobile one-column | Summarizes correct, missed, points | Small uppercase labels repeated with other summary components. |
| Answer review list | Player `.review-list`, creator `.preview-review-list` | Correct/wrong item states | Shows every answer and explanation | Border-left status convention repeated in feedback and review items. |

Inventory note: `QuizPlayer.svelte` is already a reusable component for bundled
and shared quizzes. The creator preview reimplements much of the same UI locally,
which is the largest duplication in the current component inventory.

## 7. Creator-Specific Components

| Component | Source | Variants and states | Behavior | Styling notes |
| --- | --- | --- | --- | --- |
| Save pill | Creator `.save-pill` | Draft autosaves, restored, saved | Live status with `aria-live` | Green pill matches other positive status chips. |
| Validation note | Creator `.validation-note` | Ready, title required | Inline form guidance | Muted text only. |
| Editing banner | Creator `.editing-banner` | Editing active | Marks currently edited question | Status role, left accent stripe. |
| Answer preview | Creator `.answer-preview` | Changes by question type | Shows currently selected correct answer | Left accent stripe pattern. |
| Saved questions summary | Creator `.saved-questions` | Empty, list of latest three | Shows recent draft questions | Ordered list with compact metadata. |
| Status pill | Creator `.status-pill`, `.published` | Draft, published | Shows quiz status | Neutral default, green published state. |
| Management summary | Creator `.management-summary` | Static | Displays questions, points, manual save | Three-column data summary. |
| Management feedback | Creator `.management-feedback`, `.error` | Success/neutral, error | Shows save/publish/copy messages | Error state currently uses an off-palette danger tone. |
| Share status pill | Creator `.share-heading > span`, `.ready` | Not ready, ready | Shows link readiness | Neutral default, green ready state. |
| Managed question item | Creator `.managed-question-list li` | Default, dragging, drag-over | Reorder, edit, move, delete saved questions | Drag-over has focus-like ring; dragging lowers opacity. |
| Drag handle | Creator `.drag-handle` | Decorative | Visual affordance for draggable rows | `aria-hidden`; actual row is draggable. |
| Question type placeholders | Creator `.question-types span` | Static locked-builder hints | Shows supported question types before setup is complete | Dashed outline chips. |

Inventory note: creator-specific components are the densest part of the UI and
would benefit most from a small design-token layer before being split into shared
Svelte components.

## 8. Status, Validation, and Feedback Patterns

| Pattern | Components | Current states | Standardization opportunity |
| --- | --- | --- | --- |
| Positive status chip | `.save-pill`, `.status-pill.published`, `.share-heading > span.ready`, `.timer-pill` | Green border/background/text | Consolidate as one chip primitive with `neutral`, `success`, `warning` variants. |
| Neutral chip | `.status-pill`, `.share-heading > span`, `.pack-kicker span`, `.question-types span` | Gray or pale background with bold small text | Standardize radius, padding, and text scale. |
| Inline validation | `.field-error`, `.error-list`, `aria-invalid` inputs | Error messages and invalid borders | Palette conflicts with studio standard; future cleanup should use accessible black/green/white-safe treatment. |
| Feedback panels | `.feedback`, `.preview-feedback`, `.management-feedback`, `.editing-banner` | Neutral, correct, wrong, editing, error | Consolidate border-left status panels and avoid duplicating state colors. |
| Progress indicators | `.progress-track`, `.preview-progress` | Visual progress fill | Same behavior under different class names; candidate for shared player/progress primitive. |

## 9. Lists and Data Display

| Component | Source | Variants and states | Behavior | Styling notes |
| --- | --- | --- | --- | --- |
| Pack grid | Home `.pack-grid` | Responsive auto-fit grid | Displays available packs | Card width changes by viewport. |
| Pack metadata row | Home `.meta`, `.play`, `.category` | Static, hover-affordance on play label | Shows question count and play cue | Category pill and play accent use the green/blue split noted in the audit. |
| Saved question list | Creator `.saved-questions ol` | Latest three questions | Compact draft summary | Not interactive. |
| Managed question list | Creator `.managed-question-list` | Draggable, drag-over, dragging | Main saved-question management surface | Ordered visually by list position and internal index badge. |
| Review grids | Player `.review-grid`, creator `.review-details` | Score and answer details | Presents final review data | Runtime player uses a grid; creator preview uses stacked text details. |
| Result stats | Player `.result-stats` | Three metrics | Score summary | Similar to creator management summary but separately styled. |

## 10. Responsive Behavior

| Breakpoint | Source | Changes |
| --- | --- | --- |
| `max-width: 920px` | Creator | Workspace, headers, form grids, management summary collapse to one column. |
| `max-width: 680px` | Home | Header, section heading, pack header, metadata stack vertically; title reduces. |
| `max-width: 620px` | Player | Top row/actions/review stack; cards tighten padding; stats/review grids become one column. |
| `max-width: 560px` | Layout and creator | Nav stacks, creator controls/actions stack, segmented controls become vertical, buttons full width. |

Inventory note: responsiveness is scoped per page. There is no shared breakpoint
token or layout utility.

## 11. Componentization Candidates

These are the strongest candidates for follow-up extraction or tokenization:

1. **Button system**: `.primary-button`, `.secondary-button`, `.text-button`, `.danger-button`, `.remove-button`, segmented buttons, and rich-toolbar buttons share enough structure to justify a documented button hierarchy.
2. **Status chip**: save/status/share/timer/category/kicker chips repeat the same pill language with small variations.
3. **Field and validation system**: creator fields are robust; player blank-answer fields should reuse the same conventions.
4. **Progress/timer pair**: runtime player and creator preview share progress and timer behavior under separate classes.
5. **Quiz answer controls**: player choices, boolean buttons, creator preview choices, and creator preview booleans duplicate selected/correct/wrong/disabled states.
6. **Review item**: runtime answer review and creator preview review both present prompt, answer, correct answer, score, and optional explanation.
7. **Panel/card surface**: setup, builder, management, player cards, shared card, and pack cards all use bordered white surfaces with related radius/shadow decisions.

## 12. Gaps and Non-Components

- No modal/dialog system exists.
- No toast/notification system exists; feedback is inline.
- No tooltip system exists; rich-toolbar buttons use native `title` attributes.
- No custom menu/dropdown system exists; category selection uses a native `<select>`.
- No shared icon component exists; the UI uses text, B/I formatting glyphs, bullets, and simple arrow text.
- No table component exists; summary data is displayed with grids and lists.
- No shared Svelte component library exists except `QuizPlayer.svelte`.

## 13. Cleanup Risks to Track

- The creator preview duplicates large portions of `QuizPlayer.svelte`, which
  can cause state styling to drift.
- Destructive, invalid, wrong-answer, and timer-warning states use off-palette
  warning/danger styling. Later cleanup should reconcile these with the studio
  standard while preserving accessible contrast and meaning.
- Primary/secondary action classes are used on both buttons and anchors. That is
  semantically fine, but documentation should make the element choice explicit.
- Focus-visible treatment is not consistently custom across links, buttons, and
  grouped controls.
- Page containers, panels, labels, chips, and dividers all repeat similar values
  in scoped CSS. Task #11 or #13 should introduce tokens before broad refactors.
