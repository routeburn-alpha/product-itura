<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	const categories = [
		'General',
		'Sports',
		'History',
		'Science',
		'Entertainment',
		'Music',
		'Movies',
		'Food & Drink'
	];
	const difficulties = ['Easy', 'Medium', 'Hard'] as const;
	const timeModes = [
		{ value: 'per-question', label: 'Per question' },
		{ value: 'total', label: 'Total quiz' }
	] as const;
	const draftKey = 'quiz-lab-setup-draft';

	type Difficulty = (typeof difficulties)[number];
	type TimeMode = (typeof timeModes)[number]['value'];
	type QuizDraft = {
		title: string;
		description: string;
		category: string;
		difficulty: Difficulty;
		hasTimeLimit: boolean;
		timeLimitSeconds: number;
		timeMode: TimeMode;
		updatedAt: string;
	};

	const defaultDraft: QuizDraft = {
		title: '',
		description: '',
		category: 'General',
		difficulty: 'Medium',
		hasTimeLimit: false,
		timeLimitSeconds: 30,
		timeMode: 'per-question',
		updatedAt: ''
	};

	let draft = $state<QuizDraft>({ ...defaultDraft });
	let attemptedSubmit = $state(false);
	let draftReady = $state(false);
	let builderReady = $state(false);
	let saveState = $state<'idle' | 'loaded' | 'saved'>('idle');

	const titleError = $derived(
		draft.title.trim().length >= 3 ? '' : 'Use at least 3 characters for the title.'
	);
	const timeError = $derived(
		draft.hasTimeLimit && (!Number.isFinite(draft.timeLimitSeconds) || draft.timeLimitSeconds < 1 || draft.timeLimitSeconds > 10800)
			? 'Choose a time limit from 1 to 10,800 seconds.'
			: ''
	);
	const isValid = $derived(!titleError && !timeError);
	const saveLabel = $derived(
		saveState === 'loaded'
			? 'Draft restored'
			: saveState === 'saved'
				? 'Draft saved'
				: 'Draft autosaves'
	);
	const timeSummary = $derived(
		draft.hasTimeLimit
			? `${formatSeconds(draft.timeLimitSeconds)} ${draft.timeMode === 'per-question' ? 'per question' : 'total'}`
			: 'No time limit'
	);
	const draftSnapshot = $derived({
		title: draft.title,
		description: draft.description,
		category: draft.category,
		difficulty: draft.difficulty,
		hasTimeLimit: draft.hasTimeLimit,
		timeLimitSeconds: draft.timeLimitSeconds,
		timeMode: draft.timeMode
	});

	function formatSeconds(seconds: number) {
		return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
	}

	onMount(() => {
		if (!browser) return;

		const saved = localStorage.getItem(draftKey);
		if (saved) {
			try {
				const parsed = JSON.parse(saved) as Partial<QuizDraft> & { timeLimitMinutes?: unknown };
				const difficulty = difficulties.includes(parsed.difficulty as Difficulty)
					? (parsed.difficulty as Difficulty)
					: defaultDraft.difficulty;
				const timeMode = timeModes.some((mode) => mode.value === parsed.timeMode)
					? (parsed.timeMode as TimeMode)
					: defaultDraft.timeMode;
				const category =
					parsed.category && categories.includes(parsed.category) ? parsed.category : defaultDraft.category;
				const savedSeconds = Number(parsed.timeLimitSeconds);
				const legacyMinutes = Number(parsed.timeLimitMinutes);
				const timeLimitSeconds =
					savedSeconds > 0
						? savedSeconds
						: legacyMinutes > 0
							? legacyMinutes * 60
							: defaultDraft.timeLimitSeconds;

				draft = {
					...defaultDraft,
					...parsed,
					category,
					difficulty,
					timeMode,
					timeLimitSeconds
				};
				saveState = 'loaded';
			} catch {
				localStorage.removeItem(draftKey);
			}
		}

		draftReady = true;
	});

	$effect(() => {
		if (!browser || !draftReady) return;

		const snapshot = {
			...draftSnapshot,
			title: draftSnapshot.title.trimStart(),
			updatedAt: new Date().toISOString()
		};

		localStorage.setItem(draftKey, JSON.stringify(snapshot));
		saveState = 'saved';
	});

	function selectDifficulty(difficulty: Difficulty) {
		draft.difficulty = difficulty;
	}

	function selectTimeMode(timeMode: TimeMode) {
		draft.timeMode = timeMode;
	}

	function continueToQuestionBuilder() {
		attemptedSubmit = true;
		if (!isValid) return;

		draft.title = draft.title.trim();
		builderReady = true;
	}

	function editSetup() {
		builderReady = false;
	}

	function resetDraft() {
		draft = { ...defaultDraft };
		attemptedSubmit = false;
		builderReady = false;
	}
</script>

<div class="container">
	<header class="page-header">
		<div>
			<p class="eyebrow">Quiz creator</p>
			<h1>Build a quiz draft</h1>
			<p class="subtitle">Set the basics for a trivia-night quiz, then carry the saved draft into questions.</p>
		</div>
		<div class="header-actions">
			<a class="secondary-button" href="{base}/">All packs</a>
			<span class="save-pill" aria-live="polite">{saveLabel}</span>
		</div>
	</header>

	<main class="workspace">
		<section class="setup-panel" aria-labelledby="setup-title">
			<div class="panel-heading">
				<div>
					<p class="step-label">Step 1</p>
					<h2 id="setup-title">Quiz setup</h2>
				</div>
				<button type="button" class="text-button" onclick={resetDraft}>Reset</button>
			</div>

			<form class="setup-form" novalidate onsubmit={(event) => { event.preventDefault(); continueToQuestionBuilder(); }}>
				<label class="field">
					<span>Title</span>
					<input
						type="text"
						autocomplete="off"
						placeholder="Premier League pub quiz"
						bind:value={draft.title}
						aria-invalid={attemptedSubmit && !!titleError}
					/>
					{#if attemptedSubmit && titleError}
						<span class="field-error">{titleError}</span>
					{/if}
				</label>

				<label class="field">
					<span>Description</span>
					<textarea
						rows="4"
						placeholder="A fast round for friends before kickoff."
						bind:value={draft.description}
					></textarea>
				</label>

				<div class="field-grid">
					<label class="field">
						<span>Category</span>
						<select bind:value={draft.category}>
							{#each categories as category}
								<option value={category}>{category}</option>
							{/each}
						</select>
					</label>

					<div class="field">
						<span>Difficulty</span>
						<div class="segmented" role="group" aria-label="Difficulty">
							{#each difficulties as difficulty}
								<button
									type="button"
									class:selected={draft.difficulty === difficulty}
									aria-pressed={draft.difficulty === difficulty}
									onclick={() => selectDifficulty(difficulty)}
								>
									{difficulty}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<div class="time-section">
					<label class="toggle-row">
						<input type="checkbox" bind:checked={draft.hasTimeLimit} />
						<span>
							<strong>Time limit</strong>
							<small>{timeSummary}</small>
						</span>
					</label>

					{#if draft.hasTimeLimit}
						<div class="time-controls">
							<label class="field compact">
								<span>Seconds</span>
								<input
									type="number"
									min="1"
									max="10800"
									step="1"
									bind:value={draft.timeLimitSeconds}
									aria-invalid={attemptedSubmit && !!timeError}
								/>
								{#if attemptedSubmit && timeError}
									<span class="field-error">{timeError}</span>
								{/if}
							</label>

							<div class="field compact">
								<span>Timer mode</span>
								<div class="segmented" role="group" aria-label="Timer mode">
									{#each timeModes as mode}
										<button
											type="button"
											class:selected={draft.timeMode === mode.value}
											aria-pressed={draft.timeMode === mode.value}
											onclick={() => selectTimeMode(mode.value)}
										>
											{mode.label}
										</button>
									{/each}
								</div>
							</div>
						</div>
					{/if}
				</div>

				<div class="form-actions">
					<button type="submit" class="primary-button">Continue to question builder</button>
					<span class="validation-note">
						{#if isValid}
							Ready for questions
						{:else}
							Title required
						{/if}
					</span>
				</div>
			</form>
		</section>

		<section class="builder-panel" class:ready={builderReady} aria-live="polite">
			<p class="step-label">Step 2</p>
			<h2>Question builder</h2>

			{#if builderReady}
				<div class="summary-list">
					<div>
						<span>Title</span>
						<strong>{draft.title}</strong>
					</div>
					<div>
						<span>Category</span>
						<strong>{draft.category}</strong>
					</div>
					<div>
						<span>Difficulty</span>
						<strong>{draft.difficulty}</strong>
					</div>
					<div>
						<span>Timer</span>
						<strong>{timeSummary}</strong>
					</div>
				</div>
				<div class="builder-actions">
					<button type="button" class="secondary-button" onclick={editSetup}>Edit setup</button>
					<span class="ready-pill">Ready for questions</span>
				</div>
			{:else}
				<p class="empty-state">Complete setup to unlock question building.</p>
				<div class="question-types" aria-label="Question types">
					<span>Multiple choice</span>
					<span>True / false</span>
					<span>Fill in the blank</span>
				</div>
			{/if}
		</section>
	</main>

</div>

<style>
	.container {
		max-width: 1080px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		color: #141414;
	}

	.page-header,
	.panel-heading,
	.form-actions,
	.builder-actions,
	.header-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.page-header {
		margin-bottom: 1.5rem;
	}

	.eyebrow,
	.step-label {
		margin: 0 0 0.35rem;
		font-size: 0.74rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0;
		color: #0f766e;
	}

	h1,
	h2,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0.45rem;
		font-size: clamp(2rem, 4vw, 3.75rem);
		line-height: 1;
		font-weight: 850;
		letter-spacing: 0;
	}

	h2 {
		margin-bottom: 0;
		font-size: 1.25rem;
		line-height: 1.2;
		letter-spacing: 0;
	}

	.subtitle {
		max-width: 58ch;
		margin-bottom: 0;
		color: #555;
		line-height: 1.55;
	}

	.save-pill {
		flex-shrink: 0;
		border: 1px solid #b7e4dc;
		border-radius: 999px;
		background: #effcf8;
		color: #0f766e;
		padding: 0.45rem 0.75rem;
		font-size: 0.82rem;
		font-weight: 700;
	}

	.header-actions {
		flex-shrink: 0;
		justify-content: flex-end;
	}

	.workspace {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
		gap: 1rem;
		align-items: start;
		margin-bottom: 2.5rem;
	}

	.setup-panel,
	.builder-panel {
		border: 1px solid #dedede;
		border-radius: 8px;
		background: #fff;
	}

	.setup-panel,
	.builder-panel {
		padding: 1.25rem;
		box-shadow: 0 12px 30px rgba(20, 20, 20, 0.05);
	}

	.builder-panel {
		min-height: 25rem;
		display: flex;
		flex-direction: column;
	}

	.builder-panel.ready {
		border-color: #7dd3c7;
	}

	.text-button,
	.primary-button,
	.secondary-button,
	.segmented button {
		min-height: 2.5rem;
		border-radius: 8px;
		font: inherit;
		font-weight: 750;
		cursor: pointer;
		transition: background 120ms ease, border-color 120ms ease, color 120ms ease, transform 120ms ease;
	}

	.text-button {
		border: 0;
		background: transparent;
		color: #1d4ed8;
		padding: 0 0.25rem;
	}

	.text-button:hover {
		color: #0f766e;
	}

	.setup-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1.25rem;
	}

	.field,
	.time-section {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.field > span {
		font-size: 0.86rem;
		font-weight: 750;
		color: #333;
	}

	input,
	textarea,
	select {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #cfcfcf;
		border-radius: 8px;
		background: #fff;
		padding: 0.78rem 0.85rem;
		font: inherit;
		color: #141414;
		outline: none;
		transition: border-color 120ms ease, box-shadow 120ms ease;
	}

	textarea {
		resize: vertical;
		min-height: 7.25rem;
	}

	input:focus,
	textarea:focus,
	select:focus {
		border-color: #1d4ed8;
		box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.13);
	}

	input[aria-invalid='true'] {
		border-color: #dc2626;
	}

	.field-error {
		color: #b91c1c;
		font-size: 0.78rem;
		font-weight: 650;
	}

	.field-grid,
	.time-controls {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.segmented {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border: 1px solid #cfcfcf;
		border-radius: 8px;
		overflow: hidden;
	}

	.time-controls .segmented {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.segmented button {
		border: 0;
		border-right: 1px solid #d9d9d9;
		border-radius: 0;
		background: #fff;
		color: #444;
		padding: 0.6rem 0.7rem;
		white-space: nowrap;
	}

	.segmented button:last-child {
		border-right: 0;
	}

	.segmented button.selected {
		background: #1d4ed8;
		color: #fff;
	}

	.time-section {
		border-top: 1px solid #ececec;
		padding-top: 1rem;
	}

	.toggle-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
	}

	.toggle-row input {
		width: 1.2rem;
		height: 1.2rem;
		accent-color: #0f766e;
	}

	.toggle-row span {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.toggle-row small {
		color: #666;
		font-size: 0.78rem;
	}

	.primary-button,
	.secondary-button {
		border: 1px solid transparent;
		padding: 0.7rem 1rem;
		text-decoration: none;
	}

	.primary-button {
		background: #1d4ed8;
		color: #fff;
	}

	.primary-button:hover {
		background: #1741b6;
		transform: translateY(-1px);
	}

	.secondary-button {
		background: #fff;
		border-color: #cfcfcf;
		color: #222;
	}

	.secondary-button:hover {
		border-color: #1d4ed8;
		color: #1d4ed8;
	}

	.validation-note {
		color: #666;
		font-size: 0.85rem;
	}

	.ready-pill {
		border-radius: 999px;
		background: #effcf8;
		color: #0f766e;
		padding: 0.5rem 0.75rem;
		font-size: 0.82rem;
		font-weight: 800;
	}

	.summary-list {
		display: grid;
		gap: 0.8rem;
		margin: 1.25rem 0 auto;
	}

	.summary-list div {
		display: grid;
		gap: 0.15rem;
		border-bottom: 1px solid #ececec;
		padding-bottom: 0.75rem;
	}

	.summary-list span {
		color: #666;
		font-size: 0.78rem;
		font-weight: 750;
		text-transform: uppercase;
		letter-spacing: 0;
	}

	.summary-list strong {
		color: #111;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.builder-actions {
		margin-top: 1.25rem;
	}

	.empty-state {
		margin: 1rem 0;
		color: #666;
		line-height: 1.5;
	}

	.question-types {
		display: grid;
		gap: 0.55rem;
		margin-top: auto;
	}

	.question-types span {
		border: 1px dashed #cfcfcf;
		border-radius: 8px;
		padding: 0.7rem 0.8rem;
		color: #555;
		font-size: 0.88rem;
		font-weight: 700;
	}

	@media (max-width: 820px) {
		.container {
			padding: 1.25rem;
		}

		.page-header,
		.workspace,
		.field-grid,
		.time-controls,
		.header-actions {
			display: grid;
			grid-template-columns: 1fr;
		}

		.save-pill {
			width: fit-content;
		}

		.builder-panel {
			min-height: auto;
		}
	}

	@media (max-width: 560px) {
		.page-header,
		.panel-heading,
		.form-actions,
		.builder-actions,
		.header-actions {
			align-items: flex-start;
			flex-direction: column;
		}

		.form-actions,
		.builder-actions {
			gap: 0.65rem;
		}

		.primary-button,
		.secondary-button {
			width: 100%;
		}

		.segmented {
			grid-template-columns: 1fr;
		}

		.segmented button {
			border-right: 0;
			border-bottom: 1px solid #d9d9d9;
			white-space: normal;
		}

		.segmented button:last-child {
			border-bottom: 0;
		}
	}
</style>
