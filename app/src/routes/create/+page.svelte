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
	const questionTypes = [
		{ value: 'multiple-choice', label: 'Multiple choice' },
		{ value: 'true-false', label: 'True / false' },
		{ value: 'fill-blank', label: 'Fill in the blank' }
	] as const;
	const draftKey = 'quiz-lab-setup-draft';
	const minMultipleChoiceOptions = 2;
	const maxMultipleChoiceOptions = 6;

	type Difficulty = (typeof difficulties)[number];
	type TimeMode = (typeof timeModes)[number]['value'];
	type QuestionType = (typeof questionTypes)[number]['value'];

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

	type QuestionOption = {
		id: string;
		text: string;
	};

	type QuestionDraft = {
		type: QuestionType;
		promptHtml: string;
		options: QuestionOption[];
		correctOptionId: string;
		trueFalseAnswer: boolean;
		blankAnswer: string;
		explanation: string;
		points: number;
	};

	type SavedQuestion = QuestionDraft & {
		id: string;
		promptText: string;
	};

	type StoredQuestionBuilder = {
		current?: Partial<QuestionDraft>;
		questions?: Partial<SavedQuestion>[];
	};

	type StoredQuizDraft = Partial<QuizDraft> & {
		timeLimitMinutes?: unknown;
		questionBuilder?: StoredQuestionBuilder;
	};

	let draft = $state<QuizDraft>(createDefaultDraft());
	let questionDraft = $state<QuestionDraft>(createQuestionDraft());
	let savedQuestions = $state<SavedQuestion[]>([]);
	let attemptedSubmit = $state(false);
	let attemptedQuestionSave = $state(false);
	let draftReady = $state(false);
	let builderReady = $state(false);
	let saveState = $state<'idle' | 'loaded' | 'saved'>('idle');
	let promptEditor = $state<HTMLDivElement | null>(null);

	const titleError = $derived(
		draft.title.trim().length >= 3 ? '' : 'Use at least 3 characters for the title.'
	);
	const timeError = $derived(
		draft.hasTimeLimit &&
			(!Number.isFinite(draft.timeLimitSeconds) ||
				draft.timeLimitSeconds < 1 ||
				draft.timeLimitSeconds > 10800)
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
	const promptText = $derived(getPlainText(questionDraft.promptHtml));
	const questionErrors = $derived(getQuestionErrors());
	const canSaveQuestion = $derived(questionErrors.length === 0);
	const correctAnswerPreview = $derived(getCorrectAnswerPreview(questionDraft));
	const savedQuestionCountLabel = $derived(
		`${savedQuestions.length} ${savedQuestions.length === 1 ? 'question' : 'questions'}`
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
	const questionSnapshot = $derived({
		current: serializeQuestionDraft(questionDraft),
		questions: savedQuestions.map(serializeSavedQuestion)
	});

	function createDefaultDraft(): QuizDraft {
		return {
			title: '',
			description: '',
			category: 'General',
			difficulty: 'Medium',
			hasTimeLimit: false,
			timeLimitSeconds: 30,
			timeMode: 'per-question',
			updatedAt: ''
		};
	}

	function createId(prefix: string) {
		return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
	}

	function createOption(text = ''): QuestionOption {
		return {
			id: createId('option'),
			text
		};
	}

	function createQuestionDraft(type: QuestionType = 'multiple-choice'): QuestionDraft {
		const options = [createOption(), createOption()];

		return {
			type,
			promptHtml: '',
			options,
			correctOptionId: options[0].id,
			trueFalseAnswer: true,
			blankAnswer: '',
			explanation: '',
			points: 1
		};
	}

	function formatSeconds(seconds: number) {
		return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
	}

	function isQuestionType(value: unknown): value is QuestionType {
		return questionTypes.some((type) => type.value === value);
	}

	function normalizePoints(value: unknown) {
		const points = Number(value);
		if (!Number.isFinite(points)) return 1;

		return Math.min(100, Math.max(1, Math.round(points)));
	}

	function normalizeOptions(value: unknown): QuestionOption[] {
		const options = Array.isArray(value)
			? value
					.filter((option): option is Partial<QuestionOption> => Boolean(option))
					.slice(0, maxMultipleChoiceOptions)
					.map((option) => ({
						id: typeof option.id === 'string' ? option.id : createId('option'),
						text: typeof option.text === 'string' ? option.text : ''
					}))
			: [];

		while (options.length < minMultipleChoiceOptions) {
			options.push(createOption());
		}

		return options;
	}

	function normalizeQuestionDraft(value?: Partial<QuestionDraft>): QuestionDraft {
		const type = isQuestionType(value?.type) ? value.type : 'multiple-choice';
		const options = normalizeOptions(value?.options);
		const correctOptionId = options.some((option) => option.id === value?.correctOptionId)
			? (value?.correctOptionId as string)
			: options[0].id;

		return {
			type,
			promptHtml: typeof value?.promptHtml === 'string' ? value.promptHtml : '',
			options,
			correctOptionId,
			trueFalseAnswer:
				typeof value?.trueFalseAnswer === 'boolean' ? value.trueFalseAnswer : true,
			blankAnswer: typeof value?.blankAnswer === 'string' ? value.blankAnswer : '',
			explanation: typeof value?.explanation === 'string' ? value.explanation : '',
			points: normalizePoints(value?.points)
		};
	}

	function normalizeSavedQuestions(value: unknown): SavedQuestion[] {
		if (!Array.isArray(value)) return [];

		return value
			.map((question) => normalizeSavedQuestion(question))
			.filter((question): question is SavedQuestion => Boolean(question));
	}

	function normalizeSavedQuestion(value: unknown): SavedQuestion | null {
		if (!value || typeof value !== 'object') return null;

		const question = value as Partial<SavedQuestion>;
		const normalized = normalizeQuestionDraft(question);
		const promptText =
			typeof question.promptText === 'string'
				? question.promptText
				: getPlainText(normalized.promptHtml);

		if (!promptText.trim()) return null;

		return {
			...normalized,
			id: typeof question.id === 'string' ? question.id : createId('question'),
			promptText: promptText.trim()
		};
	}

	function getPlainText(html: string) {
		return html
			.replace(/<script[\s\S]*?<\/script>/gi, '')
			.replace(/<style[\s\S]*?<\/style>/gi, '')
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
			.replace(/<[^>]*>/g, '')
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function getQuestionErrors() {
		const errors: string[] = [];

		if (promptText.length < 4) {
			errors.push('Add question text.');
		}

		if (!Number.isFinite(questionDraft.points) || questionDraft.points < 1 || questionDraft.points > 100) {
			errors.push('Use 1 to 100 points.');
		}

		if (questionDraft.type === 'multiple-choice') {
			if (
				questionDraft.options.length < minMultipleChoiceOptions ||
				questionDraft.options.length > maxMultipleChoiceOptions
			) {
				errors.push('Use 2 to 6 answer options.');
			}

			if (questionDraft.options.some((option) => !option.text.trim())) {
				errors.push('Fill every answer option.');
			}

			if (!questionDraft.options.some((option) => option.id === questionDraft.correctOptionId)) {
				errors.push('Mark the correct answer.');
			}
		}

		if (questionDraft.type === 'fill-blank' && !questionDraft.blankAnswer.trim()) {
			errors.push('Add the accepted answer.');
		}

		return errors;
	}

	function getCorrectAnswerPreview(question: QuestionDraft) {
		if (question.type === 'true-false') {
			return question.trueFalseAnswer ? 'True' : 'False';
		}

		if (question.type === 'fill-blank') {
			return question.blankAnswer.trim() || 'Accepted answer pending';
		}

		const correctIndex = question.options.findIndex((option) => option.id === question.correctOptionId);
		const correctOption = question.options[correctIndex];
		return correctOption?.text.trim() || `Option ${getOptionLabel(correctIndex >= 0 ? correctIndex : 0)}`;
	}

	function getOptionLabel(index: number) {
		return String.fromCharCode(65 + index);
	}

	function formatQuestionType(type: QuestionType) {
		return questionTypes.find((questionType) => questionType.value === type)?.label ?? 'Question';
	}

	function serializeQuestionDraft(question: QuestionDraft): QuestionDraft {
		return {
			type: question.type,
			promptHtml: question.promptHtml,
			options: question.options.map((option) => ({
				id: option.id,
				text: option.text
			})),
			correctOptionId: question.correctOptionId,
			trueFalseAnswer: question.trueFalseAnswer,
			blankAnswer: question.blankAnswer,
			explanation: question.explanation,
			points: question.points
		};
	}

	function serializeSavedQuestion(question: SavedQuestion): SavedQuestion {
		return {
			...serializeQuestionDraft(question),
			id: question.id,
			promptText: question.promptText
		};
	}

	onMount(() => {
		if (!browser) return;

		const saved = localStorage.getItem(draftKey);
		if (saved) {
			try {
				const parsed = JSON.parse(saved) as StoredQuizDraft;
				const defaultDraft = createDefaultDraft();
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
					title: typeof parsed.title === 'string' ? parsed.title : defaultDraft.title,
					description:
						typeof parsed.description === 'string' ? parsed.description : defaultDraft.description,
					category,
					difficulty,
					hasTimeLimit:
						typeof parsed.hasTimeLimit === 'boolean'
							? parsed.hasTimeLimit
							: defaultDraft.hasTimeLimit,
					timeLimitSeconds,
					timeMode,
					updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : defaultDraft.updatedAt
				};
				questionDraft = normalizeQuestionDraft(parsed.questionBuilder?.current);
				savedQuestions = normalizeSavedQuestions(parsed.questionBuilder?.questions);
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
			questionBuilder: questionSnapshot,
			title: draftSnapshot.title.trimStart(),
			updatedAt: new Date().toISOString()
		};

		localStorage.setItem(draftKey, JSON.stringify(snapshot));
		saveState = 'saved';
	});

	$effect(() => {
		const editor = promptEditor;
		const html = questionDraft.promptHtml;
		if (!editor) return;

		if (editor.innerHTML !== html) {
			editor.innerHTML = html;
		}
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

		if (browser) {
			setTimeout(() => promptEditor?.focus(), 0);
		}
	}

	function editSetup() {
		builderReady = false;
	}

	function resetDraft() {
		draft = createDefaultDraft();
		questionDraft = createQuestionDraft();
		savedQuestions = [];
		attemptedSubmit = false;
		attemptedQuestionSave = false;
		builderReady = false;
	}

	function selectQuestionType(type: QuestionType) {
		questionDraft.type = type;

		if (type === 'multiple-choice') {
			questionDraft.options = normalizeOptions(questionDraft.options);
			if (!questionDraft.options.some((option) => option.id === questionDraft.correctOptionId)) {
				questionDraft.correctOptionId = questionDraft.options[0].id;
			}
		}
	}

	function handlePromptInput() {
		questionDraft.promptHtml = promptEditor?.innerHTML ?? '';
	}

	function handlePromptPaste(event: ClipboardEvent) {
		if (!browser) return;

		event.preventDefault();
		const text = event.clipboardData?.getData('text/plain') ?? '';
		document.execCommand('insertText', false, text);
		handlePromptInput();
	}

	function applyRichCommand(command: 'bold' | 'italic' | 'insertUnorderedList') {
		if (!browser) return;

		promptEditor?.focus();
		document.execCommand(command, false);
		handlePromptInput();
	}

	function addOption() {
		if (questionDraft.options.length >= maxMultipleChoiceOptions) return;

		questionDraft.options = [...questionDraft.options, createOption()];
	}

	function removeOption(optionId: string) {
		if (questionDraft.options.length <= minMultipleChoiceOptions) return;

		const nextOptions = questionDraft.options.filter((option) => option.id !== optionId);
		questionDraft.options = nextOptions;

		if (!nextOptions.some((option) => option.id === questionDraft.correctOptionId)) {
			questionDraft.correctOptionId = nextOptions[0].id;
		}
	}

	function markCorrectOption(optionId: string) {
		questionDraft.correctOptionId = optionId;
	}

	function setTrueFalseAnswer(answer: boolean) {
		questionDraft.trueFalseAnswer = answer;
	}

	function saveQuestion() {
		attemptedQuestionSave = true;
		if (!canSaveQuestion) return;

		savedQuestions = [...savedQuestions, createSavedQuestion()];
		questionDraft = createQuestionDraft(questionDraft.type);
		attemptedQuestionSave = false;

		if (browser) {
			setTimeout(() => promptEditor?.focus(), 0);
		}
	}

	function createSavedQuestion(): SavedQuestion {
		const normalizedQuestion = serializeQuestionDraft(questionDraft);
		normalizedQuestion.promptHtml = normalizedQuestion.promptHtml.trim();
		normalizedQuestion.options = normalizedQuestion.options.map((option) => ({
			...option,
			text: option.text.trim()
		}));
		normalizedQuestion.blankAnswer = normalizedQuestion.blankAnswer.trim();
		normalizedQuestion.explanation = normalizedQuestion.explanation.trim();
		normalizedQuestion.points = normalizePoints(normalizedQuestion.points);

		return {
			...normalizedQuestion,
			id: createId('question'),
			promptText
		};
	}

	function clearQuestion() {
		questionDraft = createQuestionDraft(questionDraft.type);
		attemptedQuestionSave = false;
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
					<button type="submit" class="primary-button">
						{builderReady ? 'Update builder setup' : 'Continue to question builder'}
					</button>
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
			<div class="panel-heading">
				<div>
					<p class="step-label">Step 2</p>
					<h2>Question builder</h2>
				</div>
				{#if builderReady}
					<button type="button" class="text-button" onclick={editSetup}>Pause</button>
				{/if}
			</div>

			{#if builderReady}
				<div class="builder-form">
					<div class="field">
						<span>Question type</span>
						<div class="segmented question-type-control" role="group" aria-label="Question type">
							{#each questionTypes as type}
								<button
									type="button"
									class:selected={questionDraft.type === type.value}
									aria-pressed={questionDraft.type === type.value}
									onclick={() => selectQuestionType(type.value)}
								>
									{type.label}
								</button>
							{/each}
						</div>
					</div>

					<div class="field">
						<span>Question text</span>
						<div class="rich-editor" class:error={attemptedQuestionSave && promptText.length < 4}>
							<div class="rich-toolbar" role="toolbar" aria-label="Question formatting">
								<button type="button" aria-label="Bold" title="Bold" onclick={() => applyRichCommand('bold')}>
									<strong>B</strong>
								</button>
								<button type="button" aria-label="Italic" title="Italic" onclick={() => applyRichCommand('italic')}>
									<em>I</em>
								</button>
								<button
									type="button"
									aria-label="Bulleted list"
									title="Bulleted list"
									onclick={() => applyRichCommand('insertUnorderedList')}
								>
									&bull;
								</button>
							</div>
							<div
								class="editor-surface"
								bind:this={promptEditor}
								contenteditable="true"
								role="textbox"
								aria-multiline="true"
								aria-label="Question text"
								aria-invalid={attemptedQuestionSave && promptText.length < 4}
								tabindex="0"
								data-empty={promptText.length === 0}
								data-placeholder="Ask the question"
								oninput={handlePromptInput}
								onpaste={handlePromptPaste}
							></div>
						</div>
						{#if attemptedQuestionSave && promptText.length < 4}
							<span class="field-error">Add question text.</span>
						{/if}
					</div>

					{#if questionDraft.type === 'multiple-choice'}
						<div class="answer-section">
							<div class="answer-heading">
								<span>Answer options</span>
								<small>{questionDraft.options.length} of {maxMultipleChoiceOptions}</small>
							</div>

							<div class="option-heading" aria-hidden="true">
								<span>Correct</span>
								<span>Answer option</span>
							</div>

							<div class="option-list">
								{#each questionDraft.options as option, index (option.id)}
									<div class="option-row">
										<label class="correct-choice">
											<input
												type="radio"
												name="correct-option"
												checked={questionDraft.correctOptionId === option.id}
												onchange={() => markCorrectOption(option.id)}
											/>
											<span>{getOptionLabel(index)}</span>
										</label>
										<input
											type="text"
											placeholder={`Answer ${getOptionLabel(index)}`}
											bind:value={option.text}
											aria-invalid={attemptedQuestionSave && !option.text.trim()}
										/>
										{#if questionDraft.options.length > minMultipleChoiceOptions}
											<button
												type="button"
												class="remove-button"
												aria-label={`Remove answer ${getOptionLabel(index)}`}
												onclick={() => removeOption(option.id)}
											>
												Remove
											</button>
										{/if}
									</div>
								{/each}
							</div>

							<button
								type="button"
								class="secondary-button add-option"
								disabled={questionDraft.options.length >= maxMultipleChoiceOptions}
								onclick={addOption}
							>
								Add option
							</button>
						</div>
					{:else if questionDraft.type === 'true-false'}
						<div class="field">
							<span>Correct answer</span>
							<div class="segmented boolean-control" role="group" aria-label="Correct answer">
								<button
									type="button"
									class:selected={questionDraft.trueFalseAnswer}
									aria-pressed={questionDraft.trueFalseAnswer}
									onclick={() => setTrueFalseAnswer(true)}
								>
									True
								</button>
								<button
									type="button"
									class:selected={!questionDraft.trueFalseAnswer}
									aria-pressed={!questionDraft.trueFalseAnswer}
									onclick={() => setTrueFalseAnswer(false)}
								>
									False
								</button>
							</div>
						</div>
					{:else}
						<label class="field">
							<span>Accepted answer</span>
							<input
								type="text"
								placeholder="photosynthesis"
								bind:value={questionDraft.blankAnswer}
								aria-invalid={attemptedQuestionSave && !questionDraft.blankAnswer.trim()}
							/>
							{#if attemptedQuestionSave && !questionDraft.blankAnswer.trim()}
								<span class="field-error">Add the accepted answer.</span>
							{/if}
						</label>
					{/if}

					<div class="builder-meta">
						<label class="field points-field">
							<span>Points</span>
							<input
								type="number"
								min="1"
								max="100"
								step="1"
								bind:value={questionDraft.points}
								aria-invalid={attemptedQuestionSave && (!Number.isFinite(questionDraft.points) || questionDraft.points < 1 || questionDraft.points > 100)}
							/>
						</label>

						<div class="answer-preview">
							<span>Correct answer</span>
							<strong>{correctAnswerPreview}</strong>
						</div>
					</div>

					<label class="field">
						<span>Explanation</span>
						<textarea
							rows="4"
							placeholder="Show this after the answer is revealed."
							bind:value={questionDraft.explanation}
						></textarea>
					</label>

					{#if attemptedQuestionSave && questionErrors.length > 0}
						<ul class="error-list">
							{#each questionErrors as error}
								<li>{error}</li>
							{/each}
						</ul>
					{/if}

					<div class="form-actions builder-submit">
						<button type="button" class="primary-button" onclick={saveQuestion}>Save question</button>
						<button type="button" class="secondary-button" onclick={clearQuestion}>Clear</button>
					</div>

					<div class="saved-questions">
						<div class="saved-heading">
							<span>Draft questions</span>
							<strong>{savedQuestionCountLabel}</strong>
						</div>

						{#if savedQuestions.length > 0}
							<ol>
								{#each savedQuestions.slice(-3).reverse() as question (question.id)}
									<li>
										<span>
											{formatQuestionType(question.type)} - {question.points}
											{question.points === 1 ? 'point' : 'points'}
										</span>
										<strong>{question.promptText}</strong>
									</li>
								{/each}
							</ol>
						{:else}
							<p>No questions saved yet.</p>
						{/if}
					</div>
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
		max-width: 1180px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		color: #141414;
	}

	.page-header,
	.panel-heading,
	.form-actions,
	.header-actions,
	.answer-heading,
	.saved-heading {
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
		font-size: 3rem;
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
		grid-template-columns: minmax(320px, 0.8fr) minmax(420px, 1.2fr);
		gap: 1rem;
		align-items: start;
		margin-bottom: 2.5rem;
	}

	.setup-panel,
	.builder-panel {
		border: 1px solid #dedede;
		border-radius: 8px;
		background: #fff;
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
	.segmented button,
	.rich-toolbar button,
	.remove-button {
		min-height: 2.5rem;
		border-radius: 8px;
		font: inherit;
		font-weight: 750;
		cursor: pointer;
		transition:
			background 120ms ease,
			border-color 120ms ease,
			color 120ms ease,
			transform 120ms ease;
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

	.setup-form,
	.builder-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1.25rem;
	}

	.field,
	.time-section,
	.answer-section {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.field > span,
	.answer-heading > span,
	.saved-heading > span {
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
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease;
	}

	textarea {
		resize: vertical;
		min-height: 7.25rem;
	}

	input:focus,
	textarea:focus,
	select:focus,
	.editor-surface:focus {
		border-color: #1d4ed8;
		box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.13);
	}

	input[aria-invalid='true'],
	.rich-editor.error .editor-surface {
		border-color: #dc2626;
	}

	.field-error {
		color: #b91c1c;
		font-size: 0.78rem;
		font-weight: 650;
	}

	.field-grid,
	.time-controls,
	.builder-meta {
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

	.time-controls .segmented,
	.boolean-control {
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

	.time-section,
	.answer-section,
	.saved-questions {
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

	.toggle-row small,
	.answer-heading small {
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

	.secondary-button:hover:not(:disabled) {
		border-color: #1d4ed8;
		color: #1d4ed8;
	}

	.secondary-button:disabled {
		color: #999;
		cursor: not-allowed;
	}

	.validation-note {
		color: #666;
		font-size: 0.85rem;
	}

	.rich-editor {
		overflow: hidden;
		border-radius: 8px;
	}

	.rich-toolbar {
		display: flex;
		gap: 0.35rem;
		border: 1px solid #cfcfcf;
		border-bottom: 0;
		border-radius: 8px 8px 0 0;
		background: #f8fafc;
		padding: 0.4rem;
	}

	.rich-toolbar button {
		width: 2.35rem;
		min-height: 2.1rem;
		border: 1px solid #d9d9d9;
		background: #fff;
		color: #222;
		padding: 0;
	}

	.rich-toolbar button:hover {
		border-color: #1d4ed8;
		color: #1d4ed8;
	}

	.editor-surface {
		min-height: 9.5rem;
		border: 1px solid #cfcfcf;
		border-radius: 0 0 8px 8px;
		background: #fff;
		padding: 0.85rem;
		line-height: 1.5;
		outline: none;
		overflow-wrap: anywhere;
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease;
	}

	.editor-surface[data-empty='true']::before {
		content: attr(data-placeholder);
		color: #777;
		pointer-events: none;
	}

	.option-heading,
	.option-row {
		display: grid;
		grid-template-columns: 4.5rem minmax(0, 1fr) auto;
		gap: 0.65rem;
		align-items: center;
	}

	.option-heading {
		color: #666;
		font-size: 0.74rem;
		font-weight: 800;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.option-list {
		display: grid;
		gap: 0.6rem;
	}

	.correct-choice {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: #333;
		font-weight: 800;
		cursor: pointer;
	}

	.correct-choice input {
		width: 1.1rem;
		height: 1.1rem;
		accent-color: #0f766e;
	}

	.correct-choice span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 999px;
		background: #effcf8;
		color: #0f766e;
		font-size: 0.78rem;
	}

	.remove-button {
		border: 1px solid #d9d9d9;
		background: #fff;
		color: #555;
		padding: 0.55rem 0.7rem;
	}

	.remove-button:hover {
		border-color: #b91c1c;
		color: #b91c1c;
	}

	.add-option {
		width: fit-content;
	}

	.points-field {
		max-width: 11rem;
	}

	.answer-preview {
		display: grid;
		align-content: center;
		gap: 0.2rem;
		min-height: 4.25rem;
		border-left: 3px solid #7dd3c7;
		padding-left: 0.85rem;
		overflow-wrap: anywhere;
	}

	.answer-preview span {
		color: #666;
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.answer-preview strong {
		line-height: 1.35;
	}

	.error-list {
		margin: 0;
		padding-left: 1.2rem;
		color: #b91c1c;
		font-size: 0.85rem;
		font-weight: 650;
	}

	.builder-submit {
		justify-content: flex-start;
	}

	.saved-questions {
		display: grid;
		gap: 0.8rem;
	}

	.saved-heading strong {
		color: #0f766e;
		font-size: 0.86rem;
	}

	.saved-questions p {
		margin-bottom: 0;
		color: #666;
		font-size: 0.9rem;
	}

	.saved-questions ol {
		display: grid;
		gap: 0.65rem;
		margin: 0;
		padding-left: 1.25rem;
	}

	.saved-questions li {
		padding-left: 0.15rem;
	}

	.saved-questions li span {
		display: block;
		color: #666;
		font-size: 0.78rem;
		font-weight: 750;
	}

	.saved-questions li strong {
		display: block;
		margin-top: 0.1rem;
		line-height: 1.35;
		overflow-wrap: anywhere;
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

	@media (max-width: 920px) {
		.container {
			padding: 1.25rem;
		}

		.page-header,
		.workspace,
		.field-grid,
		.time-controls,
		.builder-meta,
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

		.points-field {
			max-width: none;
		}
	}

	@media (max-width: 560px) {
		.page-header,
		.panel-heading,
		.form-actions,
		.header-actions {
			align-items: flex-start;
			flex-direction: column;
		}

		.form-actions {
			gap: 0.65rem;
		}

		h1 {
			font-size: 2rem;
		}

		.primary-button,
		.secondary-button {
			width: 100%;
		}

		.segmented,
		.time-controls .segmented,
		.boolean-control {
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

		.option-heading {
			display: none;
		}

		.option-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.correct-choice {
			width: fit-content;
		}
	}
</style>
